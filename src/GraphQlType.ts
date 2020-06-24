import * as graphqlTypes from 'graphql';
import { getGraphQLModel } from './GraphQlModelCreator';

/**
 * Define types name and return the GraphQlType
 */
const basicTypesMap = {
    string: graphqlTypes.GraphQLString,
    number: graphqlTypes.GraphQLFloat,
    boolean: graphqlTypes.GraphQLBoolean
}

/**
 * return a basic graphQL type.
 * @param type 
 */
export function getGraphQLBasicType(type) {
    if (typeof type === 'string') {
        return basicTypesMap[type.toLowerCase()] || null;
    } else {
        console.error('GraphQL: GraphQLType Error: type isnt basic type.');
    }
    return null;
}

/**
 * get graphQL object type.
 * @param type
 */
export function graphQLgetType(type, resolver?: any) {
    if (typeof type === 'string') {
        return getGraphQLBasicType(type);
    } else {
      const name = type.constructor.name.toLowerCase();
      if (basicTypesMap[name]) {
        return getGraphQLBasicType(name);
      } else {
        const modelType = getGraphQLModel(type);
        if (modelType) {
          return modelType;
        } else {
          console.error('GraphQL Meta: no type was defined in graphQLgetType.');
          return null;
        }
      }
    }
}