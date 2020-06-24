import * as graphqlTypes from 'graphql';
import { graphQLgetType } from './GraphQlType';
import { getGraphQLBasicType } from './GraphQlType';

const reflectPrefix = 'graphql_decorators';
export const GRAPHQL_MODEL_ENTITY = `${reflectPrefix}_entity`;
export const GRAPHQL_MODEL_PK = `${reflectPrefix}_pk`;
export const GRAPHQL_MODEL_FK = `${reflectPrefix}_fk`;
export const GRAPHQL_MODEL_COLUMN = `${reflectPrefix}_property`;
export const GRAPHQL_RESOLVER_QUERY = `${reflectPrefix}_query`;
export const GRAPHQL_RESOLVER_MUTATION = `${reflectPrefix}_mutation`;
export const GRAPHQL_RESOLVER_RETURN = `${reflectPrefix}_return`;
export const GRAPHQL_RESOLVER_NEXT = `${reflectPrefix}_next`;

/**
 * Arguments for query and mutation decorator.
 */
interface GraphQLQueryMutationArg {
  return: any;
  name?: string;
}

/**
 * Decorator to set metadata for model.
 * @param name
 */
export function graphQlModel(name?: string) {
  return (target: any) => {
    Reflect.defineMetadata(GRAPHQL_MODEL_ENTITY, name ? name : target.name, target.prototype);
  }
}

/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
export function graphQlPk(name?: string) {
  return (target : any, key : string) : any => {
    Reflect.defineMetadata(GRAPHQL_MODEL_PK, true, target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
  }
}

/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export function graphQlColumn(name?: string) {
  return (target : any, key : string) : any => {
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
  }
}

/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export function graphQlFk(name?: string) {
  return (target : any, key : string) : any => {
    const classType: any = Reflect.getMetadata('design:type', target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_FK, classType, target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
  }
}

/**
 * set the return type for queries and mutations
 * @param target instance target
 * @param key the key propertie
 * @param type the type of return
 * @param isArray define if is array return
 */
function defineReturnType(target: any, key: any, type: any) {
  if (Array.isArray(type)) {
    Reflect.defineMetadata(
      GRAPHQL_RESOLVER_RETURN,
      new graphqlTypes.GraphQLList(graphQLgetType(new type[0]())),
      target,
      key
    );
  } else {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_RETURN, graphQLgetType(new type()), target, key);
  }
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function graphQlQuery(args: GraphQLQueryMutationArg) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_QUERY, args.name ? name : key, target, key);
    Reflect.defineMetadata(GRAPHQL_RESOLVER_RETURN, getGraphQLBasicType('string'), target, key);
    defineReturnType(target, key, args.return);
  };
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function graphQlMutation(args: GraphQLQueryMutationArg) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_MUTATION, name ? name : key, target, key);
    defineReturnType(target, key, args.return);
  };
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function graphQlNext(func: Function) {
  return (target: any, key: string): any => {
    const methods: any[] = Reflect.getOwnMetadata(GRAPHQL_RESOLVER_NEXT, target, key) || [];
    methods.unshift(func);
    Reflect.defineMetadata(GRAPHQL_RESOLVER_NEXT, methods, target, key);
  };
}