const reflectPrefix = 'graphql_decorators';
export const GRAPHQL_MODEL_ENTITY = `${reflectPrefix}_entity`;
export const GRAPHQL_MODEL_PK = `${reflectPrefix}_pk`;
export const GRAPHQL_MODEL_FK = `${reflectPrefix}_fk`;
export const GRAPHQL_MODEL_FK_NAME = `${reflectPrefix}_fk_name`;
export const GRAPHQL_MODEL_COLUMN = `${reflectPrefix}_property`;
export const GRAPHQL_RESOLVER_QUERY = `${reflectPrefix}_query`;
export const GRAPHQL_RESOLVER_MUTATION = `${reflectPrefix}_mutation`;
export const GRAPHQL_RESOLVER_RETURN = `${reflectPrefix}_return`;
export const GRAPHQL_RESOLVER_AUTH = `${reflectPrefix}_auth`;
export const GRAPHQL_RESOLVER_PARAM = `${reflectPrefix}_param`;
export const GRAPHQL_MODEL_FIELDS = `${reflectPrefix}_model_fields`;

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

function defineFields(target: any, key: any) {
  let existingFields: string[] = Reflect.getOwnMetadata(GRAPHQL_MODEL_FIELDS, target) || [];
  existingFields.push(key);
  Reflect.defineMetadata(GRAPHQL_MODEL_FIELDS, existingFields, target);
}

/**
 * Decorator to set metadata for model.
 * @param name
 */
export function GraphQlModel() {
  return (target: any) => {
    Reflect.defineMetadata(GRAPHQL_MODEL_ENTITY, target.name, target.prototype);
  };
}

/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
export function GraphQlPk() {
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
export function GraphQlColumn() {
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
interface FkOptions {
  type: () => any;
  idColumn?: string;
}

export function GraphQlFk(options: FkOptions) {
  return (target: any, key: string): any => {
    defineFields(target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_FK, options.type, target, key);
    Reflect.defineMetadata(GRAPHQL_MODEL_FK_NAME, options.idColumn, target, key);
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
export function GraphQlQuery(args: GraphQLResolverOptions) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_QUERY, args.name ? args.name : key, target, key);
    defineReturnType(target, key, args.return);
  };
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function GraphQlMutation(args: GraphQLResolverOptions) {
  return (target: any, key: string): any => {
    Reflect.defineMetadata(GRAPHQL_RESOLVER_MUTATION, args.name ? args.name : key, target, key);
    defineReturnType(target, key, args.return);
  };
}

/**
 * Decorator to set metadata for resolver.
 * @param args
 */
export function GraphQlAuth(func: Function) {
  return (target: any, key: string): any => {
    const methods: any[] = Reflect.getOwnMetadata(GRAPHQL_RESOLVER_AUTH, target, key) || [];
    methods.unshift(func);
    Reflect.defineMetadata(GRAPHQL_RESOLVER_AUTH, methods, target, key);
  };
}

/**
 * Decorator to set metadata for param of resolver.
 * @param args
 */
export function GraphQlParam(options: GraphQLParamOptions): any {
  return (target: any, key: string, index: number): any => {
    const params: any[] = Reflect.getOwnMetadata(GRAPHQL_RESOLVER_AUTH, target, key) || [];
    params.push({
      index,
      options,
    });
    Reflect.defineMetadata(GRAPHQL_RESOLVER_PARAM, params, target, key);
  };
}
