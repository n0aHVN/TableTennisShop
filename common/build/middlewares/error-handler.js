"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlerMiddleware = void 0;
const custom_error_1 = require("../errors/custom-error");
const ErrorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof custom_error_1.CustomError) {
        res.status(err.statusCode).send({ errors: err.serializeErrors() });
        return;
    }
    res.status(400).send({ errors: [{ message: "Something is wrong" }] });
    return;
};
exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;
