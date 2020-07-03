const reflectPrefix = 'graphql_decorators';
export const GRAPHQL_MODEL_ENTITY = `${reflectPrefix}_entity`;
export const GRAPHQL_MODEL_PK = `${reflectPrefix}_pk`;
export const GRAPHQL_MODEL_FK = `${reflectPrefix}_fk`;
export const GRAPHQL_MODEL_COLUMN = `${reflectPrefix}_property`;
export const GRAPHQL_RESOLVER_QUERY = `${reflectPrefix}_query`;
export const GRAPHQL_RESOLVER_MUTATION = `${reflectPrefix}_mutation`;
export const GRAPHQL_RESOLVER_RETURN = `${reflectPrefix}_return`;
export const GRAPHQL_RESOLVER_NEXT = `${reflectPrefix}_next`;
export const GRAPHQL_MODEL_FIELDS = `${reflectPrefix}_model_fields`;

/**
 * Arguments for query and mutation decorator.
 */
interface GraphQLQueryMutationArg {
  return: any;
  name?: string;
}

function defineFields(target: any, key: any) {
  let existingFields: string[] = Reflect.getOwnMetadata(GRAPHQL_MODEL_FIELDS, target) || [];
  existingFields.push(key);
  Reflect.defineMetadata(GRAPHQL_MODEL_FIELDS, existingFields, target);
}

/**
 * Decorator to set metadata for model.
 * @param name
 */
export function graphQlModel() {
  return (target: any) => {
    Reflect.defineMetadata(GRAPHQL_MODEL_ENTITY, target.name, target.prototype);
  };
}

/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
export function graphQlPk() {
  return (target: any, key: string): any => {
    defineFields(target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_PK, true, target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, key, target, key);
  };
}

/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export function graphQlColumn() {
  return (target: any, key: string): any => {
    defineFields(target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, key, target, key);
  };
}

/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
export function graphQlFk(type: any) {
  return (target: any, key: string): any => {
    defineFields(target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_FK, type, target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_COLUMN, key, target, key);
  };
}

/**
 * set the return type for queries and mutations
 * @param target instance target
 * @param key the key propertie
 * @param type the type of return
 * @param isArray define if is array return
 */
function defineReturnType(target: any, key: any, type: any) {
  Reflect.defineMetadata(GRAPHQL_RESOLVER_RETURN, type, target, key);
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function graphQlQuery(args: GraphQLQueryMutationArg) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_QUERY, args.name ? args.name : key, target, key);
    defineReturnType(target, key, args.return);
  };
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function graphQlMutation(args: GraphQLQueryMutationArg) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_MUTATION, args.name ? args.name : key, target, key);
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
