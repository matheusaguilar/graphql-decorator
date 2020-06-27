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
/**
 * Define types name and return the GraphQlType
 */
const basicTypesMap = {
    string: graphqlTypes.GraphQLString,
    number: graphqlTypes.GraphQLFloat,
    boolean: graphqlTypes.GraphQLBoolean,
};
/**
 * return if a type is graphQL scalar, the basic types, int, string, boolean.
 * @param type
 */
function isGraphQLscalarType(type) {
    switch (type) {
        case graphqlTypes.GraphQLFloat:
        case graphqlTypes.GraphQLString:
        case graphqlTypes.GraphQLBoolean:
            return true;
        default:
            return false;
    }
}
exports.isGraphQLscalarType = isGraphQLscalarType;
/**
 * return a basic graphQL type.
 * @param type
 */
function getGraphQLBasicType(type) {
    if (typeof type === 'string') {
        return basicTypesMap[type.toLowerCase()] || null;
    }
    return null;
}
exports.getGraphQLBasicType = getGraphQLBasicType;
