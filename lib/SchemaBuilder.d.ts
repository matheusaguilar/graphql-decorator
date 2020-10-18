import * as graphqlTypes from 'graphql';
export declare class SchemaBuilder {
    private resolverInstances;
    private modelTypesResolver;
    private inputModelTypes;
    private resolverModelFunction;
    constructor(resolver: (model: any) => any);
    /**
     * register all the models that will be used in the system.
     * @param models
     */
    registerModels(models: (new () => any)[]): this;
    /**
     * register all the resolvers for graphQL.
     * @param resolvers the resolvers classes.
     */
    registerResolvers(resolvers: (new () => any)[]): this;
    /**
     * build and return the GraphQLSchema
     */
    buildSchema(): Promise<graphqlTypes.GraphQLSchema>;
    /**
     * define the return type for queries and mutations.
     * @param resolver the resolver class.
     * @param method the method of resolver (query or mutation)
     */
    private defineReturnType;
    /**
     * return the array of arguments to be called with resolver method.
     * @param hasArgs
     * @param args
     * @param resolver
     * @param method
     * @param context
     * @param argsLength
     */
    private getResolverArgsArray;
    /**
     * create queries for every resolver.
     * @param resolver the resolver.
     * @param modelType the modelType of resolver.
     */
    private createQueries;
    /**
     * create mutations for every resolver.
     * @param resolver the resolver.
     * @param modelType the modelType of resolver.
     */
    private createMutations;
    /**
     * return the model for parse the arguments as correct type in resolver.
     * @param name
     */
    private getModelForFillAsArg;
    /**
     * call next functions before call resolver
     */
    private validateAuthFunctions;
    /**
     * return graphQL arg types for function arguments in queries and mutations.
     * @param resolver
     * @param method
     * @param argNames
     */
    private getArgsTypes;
    /**
     * create model type input for resolver if not exists.
     * @param resolver
     * @param modelType
     */
    private createModelTypeForResolver;
    /**
     * return the model type input for resolver.
     * @param modelType
     */
    private getModelTypeForResolver;
    /**
     * if an argument has object type, create an GraphQLInputObjectType to be the type.
     * @param modelType
     */
    private createModelTypeInput;
    /**
     * return function parameters names.
     * @param func the function to look.
     */
    private getFunctionArgsNames;
}
