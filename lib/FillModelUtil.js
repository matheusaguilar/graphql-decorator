"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Decorators_1 = require("./Decorators");
class FillModelUtil {
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
    static fillModelFromRequest(input, modelClass) {
        let model = null;
        if (input && modelClass) {
            model = new modelClass();
            Object.keys(model.constructor.prototype).forEach((key) => {
                if (Reflect.hasMetadata(Decorators_1.GRAPHQL_MODEL_FK, model, key)) {
                    const childClass = Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_FK, model, key);
                    model[key] = this.fillModelFromRequest(input[key], childClass);
                }
                else if (Reflect.getMetadata(Decorators_1.GRAPHQL_MODEL_COLUMN, model, key) &&
                    input[key] !== undefined) {
                    // if null input, transform to undefined
                    if (input[key] === null) {
                        input[key] = undefined;
                    }
                    model[key] = input[key];
                }
            });
        }
        return model;
    }
}
exports.FillModelUtil = FillModelUtil;
