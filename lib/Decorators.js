"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflectPrefix = 'graphql_decorators';
exports.GRAPHQL_MODEL_ENTITY = `${reflectPrefix}_entity`;
exports.GRAPHQL_MODEL_PK = `${reflectPrefix}_pk`;
exports.GRAPHQL_MODEL_FK = `${reflectPrefix}_fk`;
exports.GRAPHQL_MODEL_COLUMN = `${reflectPrefix}_property`;
exports.GRAPHQL_RESOLVER_QUERY = `${reflectPrefix}_query`;
exports.GRAPHQL_RESOLVER_MUTATION = `${reflectPrefix}_mutation`;
exports.GRAPHQL_RESOLVER_RETURN = `${reflectPrefix}_return`;
exports.GRAPHQL_RESOLVER_AUTH = `${reflectPrefix}_auth`;
exports.GRAPHQL_RESOLVER_PARAM = `${reflectPrefix}_param`;
exports.GRAPHQL_MODEL_FIELDS = `${reflectPrefix}_model_fields`;
function defineFields(target, key) {
    let existingFields = Reflect.getOwnMetadata(exports.GRAPHQL_MODEL_FIELDS, target) || [];
    existingFields.push(key);
    Reflect.defineMetadata(exports.GRAPHQL_MODEL_FIELDS, existingFields, target);
}
/**
 * Decorator to set metadata for model.
 * @param name
 */
function GraphQlModel() {
    return (target) => {
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_ENTITY, target.name, target.prototype);
    };
}
exports.GraphQlModel = GraphQlModel;
/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
function GraphQlPk() {
    return (target, key) => {
        defineFields(target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_PK, true, target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, key, target, key);
    };
}
exports.GraphQlPk = GraphQlPk;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
function GraphQlColumn() {
    return (target, key) => {
        defineFields(target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, key, target, key);
    };
}
exports.GraphQlColumn = GraphQlColumn;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
function GraphQlFk(type) {
    return (target, key) => {
        defineFields(target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_FK, type, target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, key, target, key);
    };
}
exports.GraphQlFk = GraphQlFk;
/**
 * set the return type for queries and mutations
 * @param target instance target
 * @param key the key propertie
 * @param type the type of return
 * @param isArray define if is array return
 */
function defineReturnType(target, key, type) {
    Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_RETURN, type, target, key);
}
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
function GraphQlQuery(args) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_QUERY, args.name ? args.name : key, target, key);
        defineReturnType(target, key, args.return);
    };
}
exports.GraphQlQuery = GraphQlQuery;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
function GraphQlMutation(args) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_MUTATION, args.name ? args.name : key, target, key);
        defineReturnType(target, key, args.return);
    };
}
exports.GraphQlMutation = GraphQlMutation;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
function GraphQlAuth(func) {
    return (target, key) => {
        const methods = Reflect.getOwnMetadata(exports.GRAPHQL_RESOLVER_AUTH, target, key) || [];
        methods.unshift(func);
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_AUTH, methods, target, key);
    };
}
exports.GraphQlAuth = GraphQlAuth;
/**
 * Decorator to set metadata for param of resolver.
 * @param args
 */
function GraphQlParam(options) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_PARAM, options, target, key);
    };
}
exports.GraphQlParam = GraphQlParam;
