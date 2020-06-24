import * as graphqlTypes from 'graphql';
export declare class SchemaBuilder {
    private resolverInstances;
    private modelTypesResolver;
    private inputModelTypes;
    private resolverModelFunction;
    constructor(resolver: (model: any) => any);
    /**
     * register all the models that will be used in the system.
     * @param models
     */
    registerModels(...models: [new () => any]): this;
    /**
     * register all the resolvers for graphQL.
     * @param resolvers the resolvers classes.
     */
    registerResolvers(...resolvers: any): this;
    /**
     * build and return the GraphQLSchema
     */
    buildSchema(): Promise<graphqlTypes.GraphQLSchema>;
    /**
     * create queries for every resolver.
     * @param resolver the resolver.
     * @param modelType the modelType of resolver.
     */
    private createQueries;
    /**
     * create mutations for every resolver.
     * @param resolver the resolver.
     * @param modelType the modelType of resolver.
     */
    private createMutations;
    /**
     * return the model for parse the arguments as correct type in resolver.
     * @param name
     */
    private getModelForFillAsArg;
    /**
     * call next functions before call resolver
     */
    private validateNextFunctions;
    /**
     * return graphQL arg types for function arguments in queries and mutations.
     * @param resolver
     * @param method
     * @param argNames
     */
    private getArgsTypes;
    /**
     * create model type input for resolver if not exists.
     * @param resolver
     * @param modelType
     */
    private createModelTypeForResolver;
    /**
     * return the model type input for resolver.
     * @param modelType
     */
    private getModelTypeForResolver;
    /**
     * if an argument has object type, create an GraphQLInputObjectType to be the type.
     * @param modelType
     */
    private createModelTypeInput;
    /**
     * define type for function arguments in queries or mutations.
     * @param type the type to check.
     */
    private graphQLgetArgType;
    /**
     * return if a type is graphQL scalar, the basic types, int, string, boolean.
     */
    private isGraphQLscalarType;
    /**
     * return function parameters names.
     * @param func the function to look.
     */
    private getFunctionArgsNames;
}
