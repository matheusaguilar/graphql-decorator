export declare class FillModelUtil {
    /**
     * given an input object that has an model properties,
     * this return a model with all values set.
     * input in graphQL format.
     * input example:
     * {
     *   email: '...',
     *   password: '...',
     *   address {
     *      id: '...'
     *   }
     * }
     * @param input the object input
     * @param modelClass the class of the object to fill
     */
    static fillModelFromRequest(input: any, modelClass: new () => any): any;
}
