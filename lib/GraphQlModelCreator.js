"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlTypes = __importStar(require("graphql"));
const GraphQlType_1 = require("./GraphQlType");
const Decorators_1 = require("./Decorators");
const reflectPrefix = 'graphql_model_creator';
const GRAPHQL_TYPE = `${reflectPrefix}_type`;
const GRAPHQL_FK = `${reflectPrefix}_type_fk`;
const graphQLModelTypes = {};
/**
 * get the target type and return the GraphQL type.
 * @param target
 * @param arg
 */
function getGraphQLType(target, arg) {
    const type = Reflect.getMetadata('design:type', target, arg);
    return GraphQlType_1.getGraphQLBasicType(type === null || type === void 0 ? void 0 : type.name);
}
/**
 * define the pk graphql properties.
 * @param target
 * @param key
 */
function definePK(target, key) {
    Reflect.defineMetadata(GRAPHQL_TYPE, getGraphQLType(target, key), target, key);
}
/**
 * define the column graphql properties.
 * @param target
 * @param key
 */
function defineColumn(target, key) {
    Reflect.defineMetadata(GRAPHQL_TYPE, getGraphQLType(target, key), target, key);
}
/**
 * define the fk graphql properties.
 * @param target
 * @param key
 */
function defineFK(target, key, type) {
    const nameFkColumn = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_COLUMN, target, key);
    Reflect.defineMetadata(GRAPHQL_FK, nameFkColumn, target, key);
    Reflect.defineMetadata(GRAPHQL_TYPE, type, target, key);
}
/**
 * create an instance of class to send as param for resolverMethod of builder.
 * arg can be in two formats:
 * 1: Obj { attr1: '', attr2: '', FkModel: { id: 5 }}
 * 2: Obj { attr1: '', attr2: '', fkModelId: 5}
 *
 * @param classType the class type to create.
 * @param arg the argument received.
 * @param key the name of column of arg that match the classType instance.
 */
function resolve(classType, arg, key) {
    const fkInstance = new classType();
    let fkModel = arg[key];
    let hasPk;
    const modelKeys = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_FIELDS, fkInstance);
    // if format 2
    if (!fkModel) {
        for (const fkKey of modelKeys) {
            if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_PK, fkInstance, fkKey)) {
                hasPk = fkKey;
                let argKey = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_PK, fkInstance, fkKey);
                argKey = argKey.charAt(0).toUpperCase() + argKey.slice(1);
                fkModel = arg[`${fkInstance.constructor.name}${argKey}`];
            }
        }
    }
    if (fkModel) {
        // format 2
        if (hasPk) {
            fkInstance[hasPk] = fkModel;
        }
        else {
            // format 1
            for (const fkKey of modelKeys) {
                if (fkModel[fkKey]) {
                    if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_PK, fkInstance, fkKey)) {
                        hasPk = true;
                    }
                    fkInstance[fkKey] = fkModel[fkKey];
                }
            }
        }
    }
    else {
        console.error(`GraphQL: ModelCreator: Can't find id in model arguments to resolve the model.`);
        console.error(classType.constructor.name);
        console.error(arg);
    }
    return hasPk ? fkInstance : null;
}
/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
function getGraphQLModel(instance, resolveFunction) {
    const type = {
        name: null,
        fields: {},
    };
    if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_ENTITY, instance)) {
        type.name = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_ENTITY, instance); // get class metadata
        const modelName = type.name.toLowerCase();
        const modelKeys = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_FIELDS, instance);
        if (!graphQLModelTypes[modelName]) {
            for (const key of modelKeys) {
                // define pk, fk and column graphql metadata
                if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_PK, instance, key)) {
                    definePK(instance, key);
                }
                else if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_FK, instance, key)) {
                    const typeClassFk = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_FK, instance, key);
                    defineFK(instance, key, typeClassFk());
                }
                else if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_COLUMN, instance, key)) {
                    defineColumn(instance, key);
                }
            }
            for (const key of modelKeys) {
                // get properties metadata
                if (Reflect.hasMetadata(GRAPHQL_TYPE, instance, key)) {
                    if (Reflect.hasMetadata(GRAPHQL_FK, instance, key)) {
                        const fkTypeClass = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                        const fkType = new graphqlTypes.GraphQLList(getGraphQLModel(new fkTypeClass(), resolveFunction));
                        type.fields[key] = {
                            type: fkType.ofType,
                            resolve: (arg) => {
                                return resolveFunction(resolve(fkTypeClass, arg, key));
                            },
                        };
                    }
                    else {
                        type.fields[key] = {};
                        type.fields[key].type = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                    }
                }
            }
            graphQLModelTypes[modelName] = new graphqlTypes.GraphQLObjectType(type);
        }
        return graphQLModelTypes[modelName];
    }
    return null;
}
exports.getGraphQLModel = getGraphQLModel;
