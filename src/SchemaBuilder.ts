import * as graphqlTypes from 'graphql';
import {
  GRAPHQL_RESOLVER_QUERY,
  GRAPHQL_RESOLVER_MUTATION,
  GRAPHQL_RESOLVER_AUTH,
  GRAPHQL_RESOLVER_RETURN,
  GRAPHQL_RESOLVER_PARAM,
} from './Decorators';
import { getGraphQLBasicType } from './GraphQlType';
import {
  createGraphQLModels,
  createGraphQLInputModels,
  getGraphQLModel,
  getGraphQLInputModel,
} from './GraphQlModelCreator';
import { FillModelUtil } from './FillModelUtil';

export class SchemaBuilder {
  private resolverInstances = [];
  private modelTypesResolver = {};
  private resolverModelFunction = null;

  constructor(resolver: (model: any) => any) {
    this.resolverModelFunction = resolver;
  }

  /**
   * register all the models that will be used in the system.
   * @param models
   */
  registerModels(models: (new () => any)[]) {
    // initialize all models
    this.modelTypesResolver = createGraphQLModels(models, this.resolverModelFunction);
    createGraphQLInputModels(this.modelTypesResolver);

    return this;
  }

  /**
   * register all the resolvers for graphQL.
   * @param resolvers the resolvers classes.
   */
  registerResolvers(resolvers: (new () => any)[]) {
    for (const resolver of resolvers) {
      this.resolverInstances.push(new resolver());
    }
    return this;
  }

  /**
   * build and return the GraphQLSchema
   */
  async buildSchema(): Promise<graphqlTypes.GraphQLSchema> {
    const queryFields = {};
    const mutationFields = {};
    const queryPromises = [];
    const mutationPromises = [];

    // create graphQL object for every resolver with query and mutation types
    for (const resolver of this.resolverInstances) {
      queryPromises.push(this.createQueries(resolver));
      mutationPromises.push(this.createMutations(resolver));
    }

    // fetch all queries
    const queries = await Promise.all(queryPromises);
    for (const query of queries) {
      Object.assign(queryFields, query);
    }
    const query = new graphqlTypes.GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    });

    // fetch all mutations
    const mutations = await Promise.all(mutationPromises);
    for (const mutation of mutations) {
      Object.assign(mutationFields, mutation);
    }
    const mutation = new graphqlTypes.GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    });

    // Schema
    const schema: any = {};
    schema.query = query;

    if (Object.keys(mutationFields).length > 0) {
      schema.mutation = mutation;
    }

    // clear objects
    this.resolverInstances = null;
    // this.inputModelTypes = null;
    return new graphqlTypes.GraphQLSchema(schema);
  }

  /**
   * create queries for every resolver.
   * @param resolver the resolver.
   * @param modelType the modelType of resolver.
   */
  private async createQueries(resolver) {
    const queryFields = {};

    for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(resolver))) {
      if (Reflect.hasMetadata(GRAPHQL_RESOLVER_QUERY, resolver, method)) {
        const queryName = Reflect.getMetadata(GRAPHQL_RESOLVER_QUERY, resolver, method);
        const hasArgs = resolver[method].length > 0;
        let argsLength = 0;
        const argNames = this.getFunctionArgsNames(resolver[method]);

        queryFields[queryName] = {};
        // add return type
        queryFields[queryName].type = this.defineReturnType(resolver, method);

        // add args params
        if (hasArgs) {
          queryFields[queryName].args = this.getArgsTypes(resolver, method, argNames);
          argsLength = Object.keys(queryFields[queryName].args).length;
        }

        // execute the function in resolver to return a response for graphql
        queryFields[queryName].resolve = (_, args, context) => {
          if (this.validateAuthFunctions(resolver, method, context)) {
            const argsAsArray = this.getResolverArgsArray(
              hasArgs,
              args,
              resolver,
              method,
              context,
              argsLength
            );
            return resolver[method].apply(resolver, argsAsArray);
          }
          return null;
        };
      }
    }

    return queryFields;
  }

  /**
   * create mutations for every resolver.
   * @param resolver the resolver.
   * @param modelType the modelType of resolver.
   */
  private async createMutations(resolver) {
    const mutationFields = {};

    // create mutation
    for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(resolver))) {
      if (Reflect.hasMetadata(GRAPHQL_RESOLVER_MUTATION, resolver, method)) {
        const queryName = Reflect.getMetadata(GRAPHQL_RESOLVER_MUTATION, resolver, method);
        const hasArgs = resolver[method].length > 0;
        let argsLength = 0;
        const argNames = this.getFunctionArgsNames(resolver[method]);

        mutationFields[queryName] = {};
        // add return type
        mutationFields[queryName].type = this.defineReturnType(resolver, method);

        // add args params
        if (hasArgs) {
          mutationFields[queryName].args = this.getArgsTypes(resolver, method, argNames);
          argsLength = Object.keys(mutationFields[queryName].args).length;
        }

        // execute the function in resolver to return a response for graphql
        mutationFields[queryName].resolve = (_, args, context) => {
          if (this.validateAuthFunctions(resolver, method, context)) {
            const argsAsArray = this.getResolverArgsArray(
              hasArgs,
              args,
              resolver,
              method,
              context,
              argsLength
            );
            return resolver[method].apply(resolver, argsAsArray);
          }
          return null;
        };
      }
    }

    return mutationFields;
  }

  /**
   * define the return type for queries and mutations.
   * @param resolver the resolver class.
   * @param method the method of resolver (query or mutation)
   */
  private defineReturnType(resolver, method) {
    if (Reflect.hasMetadata(GRAPHQL_RESOLVER_RETURN, resolver, method)) {
      let typeReturn = Reflect.getMetadata(GRAPHQL_RESOLVER_RETURN, resolver, method);
      if (Array.isArray(typeReturn)) {
        return new graphqlTypes.GraphQLList(getGraphQLModel(new typeReturn[0]()));
      } else {
        const basicType = getGraphQLBasicType(typeReturn.name);
        return basicType ? basicType : getGraphQLModel(new typeReturn());
      }
    }
    return null;
  }

  /**
   * return the array of arguments to be called with resolver method.
   * @param hasArgs
   * @param args
   * @param resolver
   * @param method
   * @param context
   * @param argsLength
   */
  private getResolverArgsArray(hasArgs, args, resolver, method, context, argsLength) {
    const argsAsArray = [];
    if (hasArgs) {
      const pArgs = Reflect.getMetadata('design:paramtypes', resolver, method);
      const options = Reflect.getMetadata(GRAPHQL_RESOLVER_PARAM, resolver, method);

      Object.keys(args).forEach((arg, index) => {
        if (!getGraphQLBasicType(pArgs[index].name)) {
          const optionsArg = this.paramHasOptions(options, index);
          let modelType = optionsArg
            ? optionsArg.type
            : this.getModelForFillAsArg(pArgs[index].name.toLowerCase());

          if (Array.isArray(modelType)) {
            modelType = modelType[0];
            const argResult = [];
            args[arg]?.forEach((argParam) => {
              argResult.push(FillModelUtil.fillModelFromRequest(argParam, modelType));
            });
            argsAsArray.push(argResult);
          } else {
            argsAsArray.push(FillModelUtil.fillModelFromRequest(args[arg], modelType));
          }
        } else {
          argsAsArray.push(args[arg]);
        }
      });

      for (let i = argsAsArray.length; i < argsLength; i++) {
        argsAsArray.push(null);
      }
    }
    argsAsArray.push(context);
    return argsAsArray;
  }

  /**
   * return the model for parse the arguments as correct type in resolver.
   * @param name
   */
  private getModelForFillAsArg(name: string) {
    return this.modelTypesResolver[name];
  }

  /**
   * check if param of the function has options set
   * @param options
   * @param index
   */
  private paramHasOptions(options, index) {
    const option = options?.find((opt) => opt.index === index);
    return option ? option.options : null;
  }

  /**
   * call next functions before call resolver
   */
  private validateAuthFunctions(resolver, method, context): boolean {
    let count = 0;
    const funcs = [];
    if (Reflect.hasMetadata(GRAPHQL_RESOLVER_AUTH, resolver, method)) {
      const next = Reflect.getMetadata(GRAPHQL_RESOLVER_AUTH, resolver, method);
      if (next) {
        // add all validation next functions
        funcs.push(...next);
      }

      // create functions to be executed with req, res, next
      const funcNexts = [];
      for (let i = funcs.length - 1; i >= 0; i--) {
        funcNexts.unshift(() => {
          funcs[i](
            context.req,
            context.res,
            i === funcs.length - 1
              ? () => {
                  count++;
                }
              : () => {
                  funcNexts[i + 1]();
                  count++;
                }
          );
        });
      }

      funcNexts[0](); // execute the first function of validation
    }

    return count === funcs.length;
  }

  /**
   * return graphQL arg types for function arguments in queries and mutations.
   * @param resolver
   * @param method
   * @param argNames
   */
  private getArgsTypes(resolver, method, argNames: string[]) {
    const args = {};

    const pArgs = Reflect.getMetadata('design:paramtypes', resolver, method);
    const options = Reflect.getMetadata(GRAPHQL_RESOLVER_PARAM, resolver, method);

    argNames.forEach((arg, index) => {
      if (pArgs[index].name.toLowerCase() !== 'ResContext'.toLowerCase()) {
        const optionsArg = this.paramHasOptions(options, index);
        let modelType = optionsArg ? optionsArg.type : pArgs[index];
        let isArray = false;

        if (Array.isArray(modelType)) {
          modelType = modelType[0];
          isArray = true;
        }

        const type = getGraphQLBasicType(modelType.name);
        if (type) {
          modelType = type;
        } else {
          modelType = getGraphQLInputModel(new modelType());
        }

        args[arg] = {
          type: isArray ? new graphqlTypes.GraphQLList(modelType) : modelType,
        };
      }
    });

    return args;
  }

  /**
   * return function parameters names.
   * @param func the function to look.
   */
  private getFunctionArgsNames(func) {
    return `${func}`
      .replace(/[/][/].*$/gm, '') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
      .split('){', 1)[0]
      .replace(/^[^(]*[(]/, '') // extract the parameters
      .replace(/=[^,]+/g, '') // strip any ES6 defaults
      .split(',')
      .filter(Boolean); // split & filter [""]
  }
}
