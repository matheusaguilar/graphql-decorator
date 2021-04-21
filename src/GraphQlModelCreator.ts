import * as graphqlTypes from 'graphql';
import { getGraphQLBasicType } from './GraphQlType';
import {
  GRAPHQL_MODEL_ENTITY,
  GRAPHQL_MODEL_PK,
  GRAPHQL_MODEL_COLUMN,
  GRAPHQL_MODEL_FK,
  GRAPHQL_MODEL_FIELDS,
  GRAPHQL_MODEL_FK_NAME,
} from './Decorators';

const reflectPrefix = 'graphql_model_creator';
const GRAPHQL_TYPE = `${reflectPrefix}_type`;
const GRAPHQL_FK = `${reflectPrefix}_type_fk`;
const GRAPHQL_FK_ID_COLUMN = `${reflectPrefix}_type_fk_idcolumn`;
const graphQLModelTypes = {};
const graphQLBasicModelTypes = {};

/**
 * get the target type and return the GraphQL type.
 * @param target
 * @param arg
 */
function getGraphQLType(target, arg) {
  const type = Reflect.getMetadata('design:type', target, arg);
  return getGraphQLBasicType(type?.name);
}

/**
 * define the pk graphql properties.
 * @param target
 * @param key
 */
function definePK(target: any, key: any) {
  Reflect.defineMetadata(GRAPHQL_TYPE, getGraphQLType(target, key), target, key);
}

/**
 * define the column graphql properties.
 * @param target
 * @param key
 */
function defineColumn(target: any, key: any) {
  Reflect.defineMetadata(GRAPHQL_TYPE, getGraphQLType(target, key), target, key);
}

/**
 * define the fk graphql properties.
 * @param target
 * @param key
 */
function defineFK(target: any, key: any, type: any, idColumnFk: any) {
  const nameFkColumn: any = Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, target, key);
  Reflect.defineMetadata(GRAPHQL_FK, nameFkColumn, target, key);
  Reflect.defineMetadata(GRAPHQL_TYPE, type, target, key);
  Reflect.defineMetadata(GRAPHQL_FK_ID_COLUMN, idColumnFk, target, key);
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
function resolve(classType: any, arg: any, key: any, fkIdColumn: any) {
  const fkInstance = new classType();
  let fkModel = arg[key];
  let hasPk;

  Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, fkInstance)?.forEach((fkKey) => {
    if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, fkInstance, fkKey)) {
      hasPk = fkKey;
    }
  });

  if (hasPk) {
    if (fkIdColumn) {
      // format 2
      fkInstance[hasPk] = arg[fkIdColumn];
      return fkInstance;
    } else if (fkModel) {
      // format 1
      fkInstance[hasPk] = fkModel[hasPk];
      return fkInstance;
    }
  }

  return null;
}

/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
export function getGraphQLModel(instance: any, resolveFunction: (model: any) => any) {
  let type = null;
  const fkFields = [];

  if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, instance)) {
    type = getGraphQLModelBasic(instance);
    const modelName = type.name.toLowerCase();
    const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, instance);

    if (!graphQLModelTypes[modelName]) {
      for (const key of modelKeys) {
        if (
          Reflect.hasMetadata(GRAPHQL_TYPE, instance, key) &&
          Reflect.hasMetadata(GRAPHQL_FK, instance, key)
        ) {
          const fkTypeClass = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
          const fkModelBasic = getGraphQLModelBasic(new fkTypeClass());
          const fkIdColumn = Reflect.getMetadata(GRAPHQL_FK_ID_COLUMN, instance, key);

          fkFields.push({
            key,
            type: fkModelBasic,
            resolve: (arg) => {
              return resolveFunction(resolve(fkTypeClass, arg, key, fkIdColumn));
            },
          });
        }
      }

      graphQLModelTypes[modelName] = new graphqlTypes.GraphQLObjectType({
        name: type.name,
        fields: () => {
          let fields = { ...type.fields };

          for (const fk of fkFields) {
            fields[fk.key] = {
              type: new graphqlTypes.GraphQLList(new graphqlTypes.GraphQLObjectType(fk.type)),
              resolve: fk.resolve,
            };
          }

          return fields;
        },
      });
    }

    return graphQLModelTypes[modelName];
  }

  return null;
}

/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
export function getGraphQLModelBasic(
  instance
): { name: string; fields: { [key: string]: any } } | null {
  const type = {
    name: null,
    fields: {},
  };

  if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, instance)) {
    type.name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance); // get class metadata
    const modelName = type.name.toLowerCase();
    const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, instance);

    if (!graphQLBasicModelTypes[modelName]) {
      // define pk, fk and column graphql metadata
      for (const key of modelKeys) {
        if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, instance, key)) {
          definePK(instance, key);
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_FK, instance, key)) {
          const typeClassFk = Reflect.getMetadata(GRAPHQL_MODEL_FK, instance, key);
          const idColumnFk = Reflect.getMetadata(GRAPHQL_MODEL_FK_NAME, instance, key);
          defineFK(instance, key, typeClassFk(), idColumnFk);
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_COLUMN, instance, key)) {
          defineColumn(instance, key);
        }
      }

      // define basic types
      for (const key of modelKeys) {
        if (
          Reflect.hasMetadata(GRAPHQL_TYPE, instance, key) &&
          !Reflect.hasMetadata(GRAPHQL_FK, instance, key)
        ) {
          type.fields[key] = {};
          type.fields[key].type = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
        }
      }

      graphQLBasicModelTypes[modelName] = type;
    }

    return graphQLBasicModelTypes[modelName];
  }

  return null;
}
