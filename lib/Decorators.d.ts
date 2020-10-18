export declare const GRAPHQL_MODEL_ENTITY: string;
export declare const GRAPHQL_MODEL_PK: string;
export declare const GRAPHQL_MODEL_FK: string;
export declare const GRAPHQL_MODEL_COLUMN: string;
export declare const GRAPHQL_RESOLVER_QUERY: string;
export declare const GRAPHQL_RESOLVER_MUTATION: string;
export declare const GRAPHQL_RESOLVER_RETURN: string;
export declare const GRAPHQL_RESOLVER_AUTH: string;
export declare const GRAPHQL_RESOLVER_PARAM: string;
export declare const GRAPHQL_MODEL_FIELDS: string;
/**
 * Arguments for query and mutation decorator.
 */
interface GraphQLResolverOptions {
    return: any;
    name?: string;
}
interface GraphQLParamOptions {
    type: any;
}
/**
 * Decorator to set metadata for model.
 * @param name
 */
export declare function GraphQlModel(): (target: any) => void;
/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
export declare function GraphQlPk(): (target: any, key: string) => any;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export declare function GraphQlColumn(): (target: any, key: string) => any;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export declare function GraphQlFk(type: () => any): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function GraphQlQuery(args: GraphQLResolverOptions): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function GraphQlMutation(args: GraphQLResolverOptions): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function GraphQlAuth(func: Function): (target: any, key: string) => any;
/**
 * Decorator to set metadata for param of resolver.
 * @param args
 */
export declare function GraphQlParam(options: GraphQLParamOptions): any;
export {};
