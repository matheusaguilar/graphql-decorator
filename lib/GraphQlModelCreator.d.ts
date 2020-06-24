import * as graphqlTypes from 'graphql';
/**
 * get GraphQL model for an object instance entity.
 * @param instance
 */
export declare function getGraphQLModel(instance: any, resolveFunction: (model: any) => any): graphqlTypes.GraphQLObjectType;
