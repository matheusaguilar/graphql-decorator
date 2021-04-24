import * as graphqlTypes from 'graphql';
import { getGraphQLBasicType, isGraphQLscalarType } from './GraphQlType';
import {
  GRAPHQL_MODEL_ENTITY,
  GRAPHQL_MODEL_PK,
  GRAPHQL_MODEL_COLUMN,
  GRAPHQL_MODEL_FK,
  GRAPHQL_MODEL_FIELDS,
  GRAPHQL_MODEL_FK_NAME,
} from './Decorators';

const graphQLModelTypes = {};
const graphQLInputModelTypes = {};
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
function getGraphQLModelBasic(instance): { name: string; fields: { [key: string]: any } } | null {
  const type = {
    name: null,
    fields: {},
  };

  if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, instance)) {
    type.name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance); // get class metadata
    const modelName = type.name.toLowerCase();
    const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, instance);

    if (!graphQLBasicModelTypes[modelName]) {
      for (const key of modelKeys) {
        if (
          Reflect.hasMetadata(GRAPHQL_MODEL_PK, instance, key) ||
          Reflect.hasMetadata(GRAPHQL_MODEL_COLUMN, instance, key)
        ) {
          type.fields[key] = {};
          type.fields[key].type = getGraphQLType(instance, key);
        }
      }

      graphQLBasicModelTypes[modelName] = type;
    }

    return graphQLBasicModelTypes[modelName];
  }

  return null;
}

/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
function getGraphQLModels(models: any, resolveFunction: (model: any) => any) {
  for (const model of models) {
    const modelInstance = new model();

    if (Reflect.hasMetadata(GRAPHQL_MODEL_ENTITY, modelInstance)) {
      const type = getGraphQLModelBasic(modelInstance);
      const modelName = type.name.toLowerCase();
      const modelKeys = Reflect.getMetadata(GRAPHQL_MODEL_FIELDS, modelInstance);
      const fkFields = [];

      if (!graphQLModelTypes[modelName]) {
        for (const key of modelKeys) {
          if (Reflect.hasMetadata(GRAPHQL_MODEL_FK, modelInstance, key)) {
            const typeClassFk = Reflect.getMetadata(GRAPHQL_MODEL_FK, modelInstance, key);
            const fkTypeClass = typeClassFk();
            const fkModelBasic = getGraphQLModelBasic(new fkTypeClass());
            const fkIdColumn = Reflect.getMetadata(GRAPHQL_MODEL_FK_NAME, modelInstance, key);

            fkFields.push({
              key,
              classType: fkTypeClass,
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
                type: graphQLModelTypes[fk.type.name.toLowerCase()],
                resolve: fk.resolve,
              };
            }

            return fields;
          },
        });
      }
    }
  }

  return graphQLModelTypes;
}

/**
 * create the graphQL models
 * @param models
 * @param resolveFunction
 * @returns
 */
export function createGraphQLModels(models: any, resolveFunction: (model: any) => any) {
  // create basic models
  for (const model of models) {
    getGraphQLModelBasic(new model());
  }

  // create graphQL objects and return them
  return getGraphQLModels(models, resolveFunction);
}

/**
 * create the graphQL input models
 * @param models
 * @returns
 */
export function createGraphQLInputModels(models: any) {
  for (const model of Object.keys(models)) {
    if (model && !graphQLInputModelTypes[models[model].name.toLowerCase()]) {
      const fields = {};
      const fkFields = [];

      for (const key of Object.keys(models[model].getFields())) {
        let type = null;

        if (isGraphQLscalarType(models[model].getFields()[key].type)) {
          type = models[model].getFields()[key].type;
        } else {
          fkFields.push({
            key,
            type: models[model].getFields()[key].type,
          });
        }

        fields[key] = {
          // type: new graphqlTypes.GraphQLNonNull(modelType.getFields()[key].type)
          type,
        };
      }

      graphQLInputModelTypes[
        models[model].name.toLowerCase()
      ] = new graphqlTypes.GraphQLInputObjectType({
        name: `input${models[model].name}`,
        fields: () => {
          let modelFields = { ...fields };

          for (const fk of fkFields) {
            modelFields[fk.key] = {
              type: graphQLInputModelTypes[fk.type.name.toLowerCase()],
            };
          }

          return modelFields;
        },
      });
    }
  }

  return graphQLInputModelTypes;
}

/**
 * return the graphQL model based in an instance of the class
 * @param instance
 * @returns
 */
export function getGraphQLModel(instance: any) {
  const name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance);
  return name ? graphQLModelTypes[name.toLowerCase()] : null;
}

/**
 * return the graphQL model based in an instance of the class
 * @param instance
 * @returns
 */
export function getGraphQLInputModel(instance: any) {
  const name = Reflect.getMetadata(GRAPHQL_MODEL_ENTITY, instance);
  return name ? graphQLInputModelTypes[name.toLowerCase()] : null;
}
