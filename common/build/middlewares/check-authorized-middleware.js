"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAuthorizedMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const CheckAuthorizedMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const axiosRes = yield axios_1.default.get("localhost:3000/api/users/current-user");
    if (axiosRes.status != 200) {
        throw new not_authorized_error_1.NotAuthorizedError("Not Authorized");
    }
    next();
});
exports.CheckAuthorizedMiddleware = CheckAuthorizedMiddleware;
