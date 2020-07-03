import * as graphqlTypes from 'graphql';
import { getGraphQLBasicType } from './GraphQlType';
import {
  GRAPHQL_MODEL_ENTITY,
  GRAPHQL_MODEL_PK,
  GRAPHQL_MODEL_COLUMN,
  GRAPHQL_MODEL_FK,
  GRAPHQL_MODEL_FIELDS,
} from './Decorators';

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
function defineFK(target: any, key: any, type: any) {
  const nameFkColumn: any = Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, target, key);
  Reflect.defineMetadata(GRAPHQL_FK, nameFkColumn, target, key);
  Reflect.defineMetadata(GRAPHQL_TYPE, type, target, key);
}

/**
 * create an instance of class to send as param for resolverMethod of builder.
 * @param classType the class type to create.
 * @param arg the argument received.
 * @param key the name of column of arg that match the classType instance.
 */
function resolve(classType: any, arg: any, key: any) {
  const fkInstance = new classType();
  const fkModel = arg[key];
  let hasPk = false;
  const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, fkInstance);
  for (const fkKey of modelKeys) {
    if (fkModel[fkKey] !== undefined && fkModel[fkKey] !== null) {
      if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, fkInstance, fkKey)) {
        hasPk = true;
      }
      fkInstance[fkKey] = fkModel[fkKey];
    }
  }
  return hasPk ? fkInstance : null;
}

/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
export function getGraphQLModel(
  instance,
  resolveFunction: (model: any) => any
): graphqlTypes.GraphQLObjectType {
  const type = {
    name: null,
    fields: {},
  };

  if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, instance)) {
    type.name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance); // get class metadata
    const modelName = type.name.toLowerCase();
    const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, instance);

    if (!graphQLModelTypes[modelName]) {
      for (const key of modelKeys) {
        // define pk, fk and column graphql metadata
        if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, instance, key)) {
          definePK(instance, key);
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_FK, instance, key)) {
          defineFK(instance, key, Reflect.getMetadata(GRAPHQL_MODEL_FK, instance, key));
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_COLUMN, instance, key)) {
          defineColumn(instance, key);
        }
      }

      for (const key of modelKeys) {
        // get properties metadata
        if (Reflect.hasMetadata(GRAPHQL_TYPE, instance, key)) {
          if (Reflect.hasMetadata(GRAPHQL_FK, instance, key)) {
            const fkTypeClass = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
            const fkType = new graphqlTypes.GraphQLList(
              getGraphQLModel(new fkTypeClass(), resolveFunction)
            );
            type.fields[key] = {
              type: fkType.ofType,
              resolve: (arg) => {
                return resolveFunction(resolve(fkTypeClass, arg, key));
              },
            };
          } else {
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
