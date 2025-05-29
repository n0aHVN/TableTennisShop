"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRequestMiddleware = void 0;
const express_validator_1 = require("express-validator");
const request_validate_error_1 = require("../errors/request-validate-error");
const ValidateRequestMiddleware = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new request_validate_error_1.RequestValidateError(errors.array());
    }
    next();
};
exports.ValidateRequestMiddleware = ValidateRequestMiddleware;
