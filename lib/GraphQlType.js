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
const GraphQlModelCreator_1 = require("./GraphQlModelCreator");
/**
 * Define types name and return the GraphQlType
 */
const basicTypesMap = {
    string: graphqlTypes.GraphQLString,
    number: graphqlTypes.GraphQLFloat,
    boolean: graphqlTypes.GraphQLBoolean
};
/**
 * return a basic graphQL type.
 * @param type
 */
function getGraphQLBasicType(type) {
    if (typeof type === 'string') {
        return basicTypesMap[type.toLowerCase()] || null;
    }
    else {
        console.error('GraphQL: GraphQLType Error: type isnt basic type.');
    }
    return null;
}
exports.getGraphQLBasicType = getGraphQLBasicType;
/**
 * get graphQL object type.
 * @param type
 */
function graphQLgetType(type, resolver) {
    if (typeof type === 'string') {
        return getGraphQLBasicType(type);
    }
    else {
        const name = type.constructor.name.toLowerCase();
        if (basicTypesMap[name]) {
            return getGraphQLBasicType(name);
        }
        else {
            const modelType = GraphQlModelCreator_1.getGraphQLModel(type);
            if (modelType) {
                return modelType;
            }
            else {
                console.error('GraphQL Meta: no type was defined in graphQLgetType.');
                return null;
            }
        }
    }
}
exports.graphQLgetType = graphQLgetType;
