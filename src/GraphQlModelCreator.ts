import * as graphqlTypes from 'graphql';
import { getGraphQLBasicType } from './GraphQlType';
import { GRAPHQL_MODEL_ENTITY, GRAPHQL_MODEL_PK, GRAPHQL_MODEL_COLUMN, GRAPHQL_MODEL_FK} from './Decorators';

const reflectPrefix = 'graphql_model_creator';
const GRAPHQL_TYPE = `${reflectPrefix}_type`;
const GRAPHQL_RESOLVE = `${reflectPrefix}_resolve`;
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
function defineFK(target: any, key: any) {
  const classType: any = Reflect.getMetadata('design:type', target, key);
  const nameFkColumn: any = Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, target, key);
  const type = new classType();
  const typeList = new graphqlTypes.GraphQLList(getGraphQLModel(type));
  const resolver = async (arg) => {
    let fkId = null;

    // if response from database
    if (arg[nameFkColumn]) {
      fkId = arg[nameFkColumn];
    }

    Object.keys(type).forEach((prop) => {
      if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, type, prop)) {
        // fkId in object
        if (fkId) {
          type[prop] = fkId;
          // fkId in toGraphQL() object
        } else if (arg[key]) {
          type[prop] = arg[key][Reflect.getMetadata(GRAPHQL_MODEL_COLUMN, type, prop)];
        }
      }
    });

    return type;
    // return (await ORM.getInstance(type).read()) ? type.toGraphQL() : [];
  };
  Reflect.defineMetadata(GRAPHQL_TYPE, typeList, target, key);
  Reflect.defineMetadata(GRAPHQL_RESOLVE, resolver, target, key);
}

/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
export function getGraphQLModel(instance): graphqlTypes.GraphQLObjectType {
  const type = {
    name: null,
    fields: {},
  };

  if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, instance)) {
    type.name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance); // get class metadata
    const modelName = type.name.toLowerCase();

    if (!graphQLModelTypes[modelName]) {
      for (const key of Object.keys(instance)) {
        // define pk, fk and column graphql metadata
        if (Reflect.hasMetadata(GRAPHQL_MODEL_PK, instance, key)) {
          definePK(instance, key);
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_FK, instance, key)) {
          defineFK(instance, key);
        } else if (Reflect.hasMetadata(GRAPHQL_MODEL_COLUMN, instance, key)) {
          defineColumn(instance, key);
        }
      }

      for (const key of Object.keys(instance)) {
        // get properties metadata
        if (Reflect.hasMetadata(GRAPHQL_TYPE, instance, key)) {
          if (
            Reflect.getMetadata(GRAPHQL_TYPE, instance, key) instanceof graphqlTypes.GraphQLList
          ) {
            const fkType = Reflect.getMetadata(GRAPHQL_TYPE, instance, key);
            type.fields[key] = {
              type: fkType.ofType,
              resolve: Reflect.getMetadata(GRAPHQL_RESOLVE, instance, key),
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
