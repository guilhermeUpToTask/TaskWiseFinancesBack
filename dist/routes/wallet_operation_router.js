"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dayjs_1 = __importDefault(require("dayjs"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const index_1 = require("../error_system/index");
const express_validator_1 = require("express-validator");
const wallet_op_controller_1 = __importDefault(require("../controllers/wallet_op_controller"));
const date_1 = require("../lib/functions/date");
const wallet_operation_router = express_1.default.Router();
//later we will refactor the code on the validation chain
wallet_operation_router.post('/create', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('name').escape().notEmpty().withMessage('operation name is required'),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('operation value is required')
        .isNumeric().withMessage('operation value must be a number').toFloat(),
    (0, express_validator_1.body)('description').escape().notEmpty().withMessage('operation description is required')
        .isString().withMessage('operation description must be a string'),
    (0, express_validator_1.body)('operation_type').escape().notEmpty().withMessage('operation_type is required')
        .isIn(['income', 'expanse']).withMessage('operation_type must be income or expanse'),
    (0, express_validator_1.body)('operation_type_id').escape().toInt(),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { name, value, description, operation_type, operation_type_id } = req.body;
        const { data, error, status, message } = await wallet_op_controller_1.default.
            create(name, value, description, operation_type, user_id, operation_type_id);
        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
//if we delete first we dont need all this values we can change wallet after operation
wallet_operation_router.delete('/delete', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('operation_id').escape().notEmpty().withMessage('Operation_id is required')
        .isInt().withMessage('operation_id must be a Integer').toInt(),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('value is required')
        .isNumeric().withMessage('operation.value must be a number').toFloat(),
    (0, express_validator_1.body)('operation_type').escape().notEmpty().withMessage('operation_type is required')
        .isIn(['income', 'expense']).withMessage('operation_type must be income or expense'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { operation_id } = req.body;
        const { data, error, status, message } = await wallet_op_controller_1.default.remove(user_id, operation_id);
        return res.status(status).json({ data, error, message });
        //delete implementation
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${(0, dayjs_1.default)().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
wallet_operation_router.get('/get_all', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, status, message, error } = await wallet_op_controller_1.default.getAll(user_id);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp: ${(0, dayjs_1.default)().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
wallet_operation_router.get('/get_all_by_type', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('operation_type').escape().notEmpty().withMessage('operation.operation_type is required')
        .isIn(['income', 'expanse']).withMessage('operation.operation_type must be income or expense'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { operation_type } = req.query;
        const { data, status, message, error } = await wallet_op_controller_1.default.getAllType(user_id, operation_type);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp:${(0, dayjs_1.default)().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
wallet_operation_router.get('/get_all_between_dates', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('start_date').notEmpty().withMessage('start_date is required')
        .isDate().withMessage('start_date must be a  date'),
    (0, express_validator_1.check)('end_date').notEmpty().withMessage('end_date is required')
        .isDate().withMessage('end_date must be a  date'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { start_date, end_date } = req.query;
        const { data, status, message, error } = await wallet_op_controller_1.default.getAllBetweenDates(user_id, start_date, end_date);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
wallet_operation_router.get('/get_all_from_month', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('year').notEmpty().withMessage('year is required')
        .isInt().withMessage('year must be a integer number'),
    (0, express_validator_1.check)('month').notEmpty().withMessage('month is required')
        .isInt().withMessage('month must be a integer number'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const year = parseInt(req.query.year, 10);
        const month = parseInt(req.query.month, 10);
        const { firstDay, lastDay } = (0, date_1.getFirstAndLastDayOfMonth)(year, month);
        const { data, status, message, error } = await wallet_op_controller_1.default.getAllBetweenDates(user_id, firstDay, lastDay);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
exports.default = wallet_operation_router;
//# sourceMappingURL=wallet_operation_router.js.map