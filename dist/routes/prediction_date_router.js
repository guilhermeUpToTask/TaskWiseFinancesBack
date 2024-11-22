"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prediction_date_controler_1 = __importDefault(require("../controllers/prediction_date_controler"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const index_1 = require("../error_system/index");
const express_validator_1 = require("express-validator");
const prediction_date_router = express_1.default.Router();
prediction_date_router.get('/', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, status, message, error } = await prediction_date_controler_1.default.get(userID);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
prediction_date_router.put('/', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('current_date').notEmpty().withMessage('current_date is required')
        .isDate().withMessage('current_date must be a dateType format (YYYY/MM/DD)'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const { current_date } = req.body;
        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, status, message, error } = await prediction_date_controler_1.default.update(userID, current_date);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
exports.default = prediction_date_router;
//# sourceMappingURL=prediction_date_router.js.map