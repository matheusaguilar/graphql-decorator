export declare const GRAPHQL_MODEL_ENTITY: string;
export declare const GRAPHQL_MODEL_PK: string;
export declare const GRAPHQL_MODEL_FK: string;
export declare const GRAPHQL_MODEL_COLUMN: string;
export declare const GRAPHQL_RESOLVER_QUERY: string;
export declare const GRAPHQL_RESOLVER_MUTATION: string;
export declare const GRAPHQL_RESOLVER_RETURN: string;
export declare const GRAPHQL_RESOLVER_NEXT: string;
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
export declare function graphQlModel(name?: string): (target: any) => void;
/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
export declare function graphQlPk(name?: string): (target: any, key: string) => any;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export declare function graphQlColumn(name?: string): (target: any, key: string) => any;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export declare function graphQlFk(name?: string): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function graphQlQuery(args: GraphQLQueryMutationArg): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function graphQlMutation(args: GraphQLQueryMutationArg): (target: any, key: string) => any;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export declare function graphQlNext(func: Function): (target: any, key: string) => any;
export {};
