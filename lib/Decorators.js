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
exports.GRAPHQL_RESOLVER_NEXT = `${reflectPrefix}_next`;
/**
 * Decorator to set metadata for model.
 * @param name
 */
function graphQlModel(name) {
    return (target) => {
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_ENTITY, name ? name : target.name, target.prototype);
    };
}
exports.graphQlModel = graphQlModel;
/**
 * Decorator to set metadata for pk.
 * @param target
 * @param key
 */
function graphQlPk(name) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_PK, true, target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
    };
}
exports.graphQlPk = graphQlPk;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
function graphQlColumn(name) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
    };
}
exports.graphQlColumn = graphQlColumn;
/**
 * Decorator to set metadata for property.
 * @param target
 * @param key
 */
function graphQlFk(name) {
    return (target, key) => {
        const classType = Reflect.getMetadata('design:type', target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_FK, classType, target, key);
        Reflect.defineMetadata(exports.GRAPHQL_MODEL_COLUMN, name ? name : key, target, key);
    };
}
exports.graphQlFk = graphQlFk;
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
function graphQlQuery(args) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_QUERY, args.name ? name : key, target, key);
        defineReturnType(target, key, args.return);
    };
}
exports.graphQlQuery = graphQlQuery;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
function graphQlMutation(args) {
    return (target, key) => {
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_MUTATION, name ? name : key, target, key);
        defineReturnType(target, key, args.return);
    };
}
exports.graphQlMutation = graphQlMutation;
/**
 * Decorator to set metadata for resolver.
 * @param args
 */
function graphQlNext(func) {
    return (target, key) => {
        const methods = Reflect.getOwnMetadata(exports.GRAPHQL_RESOLVER_NEXT, target, key) || [];
        methods.unshift(func);
        Reflect.defineMetadata(exports.GRAPHQL_RESOLVER_NEXT, methods, target, key);
    };
}
exports.graphQlNext = graphQlNext;
