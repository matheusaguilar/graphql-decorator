import * as graphqlTypes from 'graphql';

/**
 * Define types name and return the GraphQlType
 */
const basicTypesMap = {
    string: graphqlTypes.GraphQLString,
    number: graphqlTypes.GraphQLFloat,
    boolean: graphqlTypes.GraphQLBoolean
}

/**
 * return if a type is graphQL scalar, the basic types, int, string, boolean.
 * @param type
 */
export function isGraphQLscalarType(type) {
  switch (type) {
    case graphqlTypes.GraphQLFloat:
    case graphqlTypes.GraphQLString:
    case graphqlTypes.GraphQLBoolean:
      return true;
    default:
      return false;
  }
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