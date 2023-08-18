"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_controller_1 = __importDefault(require("../controllers/wallet_controller"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const index_1 = require("../error_system/index");
const express_validator_1 = require("express-validator");
const wallet_router = express_1.default.Router();
wallet_router.get('/', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, status, message, error } = await wallet_controller_1.default.get(userID);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
exports.default = wallet_router;
//# sourceMappingURL=wallet_router.js.map