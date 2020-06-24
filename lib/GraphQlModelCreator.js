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
function defineFK(target, key) {
    const classType = Reflect.getMetadata('design:type', target, key);
    const nameFkColumn = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_COLUMN, target, key);
    Reflect.defineMetadata(GRAPHQL_FK, nameFkColumn, target, key);
    Reflect.defineMetadata(GRAPHQL_TYPE, classType, target, key);
    // const classType: any = Reflect.getMetadata('design:type', target, key);
    // const nameFkColumn: any = Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, target, key);
    // const type = new classType();
    // const typeList = new graphqlTypes.GraphQLList(getGraphQLModel(type));
    // const resolver = async (arg) => {
    // console.log(arg);
    // let fkId = null;
    // // if response from database
    // console.log(arg[nameFkColumn]);
    // if (arg[nameFkColumn]) {
    //   fkId = arg[nameFkColumn];
    // }
    // Object.keys(type).forEach((prop) => {
    //   if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, type, prop)) {
    //     console.log(arg[key]);
    //     console.log(Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, type, prop));
    //     // fkId in object
    //     if (fkId) {
    //       type[prop] = fkId;
    //       // fkId in toGraphQL() object
    //     } else if (arg[key]) {
    //       type[prop] = arg[key][Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, type, prop)];
    //     }
    //   }
    // });
    // console.log(type);
    // console.log(arg[nameFkColumn]);
    // return [arg[nameFkColumn]];
    // return (await ORM.getInstance(type).read()) ? type.toGraphQL() : [];
    // };
    // Reflect.defineMetadata(GRAPHQL_TYPE, typeList, target, key);
    // Reflect.defineMetadata(GRAPHQL_RESOLVE, resolver, target, key);
}
function resolver(arg, key) {
    console.log(arg[key]);
    return [arg[key]];
}
/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
function getGraphQLModel(instance) {
    const type = {
        name: null,
        fields: {},
    };
    if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_ENTITY, instance)) {
        type.name = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_ENTITY, instance); // get class metadata
        const modelName = type.name.toLowerCase();
        if (!graphQLModelTypes[modelName]) {
            for (const key of Object.keys(instance)) {
                // define pk, fk and column graphql metadata
                if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_PK, instance, key)) {
                    definePK(instance, key);
                }
                else if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_FK, instance, key)) {
                    defineFK(instance, key);
                }
                else if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_COLUMN, instance, key)) {
                    defineColumn(instance, key);
                }
            }
            for (const key of Object.keys(instance)) {
                // get properties metadata
                if (Reflect.hasMetadata(GRAPHQL_TYPE, instance, key)) {
                    if (Reflect.hasMetadata(GRAPHQL_FK, instance, key)) {
                        const keyName = Reflect.getMetadata(GRAPHQL_FK, instance, key);
                        const fkTypeClass = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                        const fkType = new graphqlTypes.GraphQLList(getGraphQLModel(new fkTypeClass()));
                        type.fields[key] = {
                            type: fkType.ofType,
                            resolve: (arg) => {
                                return resolver(arg, keyName);
                            },
                        };
                    }
                    else {
                        type.fields[key] = {};
                        type.fields[key].type = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                    }
                    // if (
                    //   Reflect.getMetadata(GRAPHQL_TYPE, instance, key) instanceof graphqlTypes.GraphQLList
                    // ) {
                    //   const fkType = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                    //   type.fields[key] = {
                    //     type: fkType.ofType,
                    //     // resolve: Reflect.getMetadata(GRAPHQL_RESOLVE, instance, key),
                    //     resolve:
                    //   };
                    // } else {
                    //   type.fields[key] = {};
                    //   type.fields[key].type = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
                    // }
                }
            }
            graphQLModelTypes[modelName] = new graphqlTypes.GraphQLObjectType(type);
        }
        return graphQLModelTypes[modelName];
    }
    return null;
}
exports.getGraphQLModel = getGraphQLModel;
