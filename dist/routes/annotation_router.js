"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dayjs_1 = __importDefault(require("dayjs"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const commun_fns_1 = require("../lib/functions/commun_fns");
const annotation_fns_1 = require("../lib/functions/annotation_fns");
const index_1 = require("../error_system/index");
const express_validator_1 = require("express-validator");
const annotation_controller_1 = __importDefault(require("../controllers/annotation_controller"));
const prediction_date_controler_1 = __importDefault(require("../controllers/prediction_date_controler"));
const date_1 = require("../lib/functions/date");
const annotation_router = express_1.default.Router();
annotation_router.post('/create', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('name').escape().notEmpty().withMessage('annotation name is required'),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
    (0, express_validator_1.body)('description').escape().notEmpty().withMessage('annotation description is required')
        .isString().withMessage('annotation description must be a string'),
    (0, express_validator_1.body)('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    (0, express_validator_1.body)('repeat').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['never', 'day', 'week', 'month', 'year']).withMessage('invalid annotation repeat'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('date is required')
        .isDate().withMessage('date must be a dateType format (YYYY/MM/DD)'),
    (0, express_validator_1.body)('type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bill or payment'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { name, description, value, repeat, status: annon_status, date, type } = req.body;
        const { data, error, status, message } = await annotation_controller_1.default
            .create(user_id, name, description, value, repeat, annon_status, date, type);
        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, error, message });
    }
});
annotation_router.post('/bulk_create', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('name').escape().notEmpty().withMessage('annotation name is required'),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
    (0, express_validator_1.body)('description').escape().notEmpty().withMessage('annotation description is required')
        .isString().withMessage('annotation description must be a string'),
    (0, express_validator_1.body)('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    (0, express_validator_1.body)('repeat').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['never', 'day', 'week', 'month', 'year']).withMessage('invalid annotation repeat'),
    (0, express_validator_1.body)('date').notEmpty().withMessage('date is required')
        .isDate().withMessage('date must be a dateType format (YYYY/MM/DD)'),
    (0, express_validator_1.body)('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bill or payment'),
    (0, express_validator_1.body)('annon_type_id').escape().toInt(),
    (0, express_validator_1.body)('quantity').escape().notEmpty().withMessage('quantity is required')
        .isNumeric().withMessage('quantity must be a number').toInt(),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { name, description, value, repeat, status: annon_status, date, annon_type, annon_type_id, quantity } = req.body;
        const repeatedAnnotations = (0, annotation_fns_1.getRepeatedAnnotations)({
            name, description, value, repeat, status: annon_status, date, annon_type, annon_type_id, user_id,
        }, quantity);
        const { data, error, status, message } = await annotation_controller_1.default
            .bulkCreate(repeatedAnnotations);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts bulk create post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, error, message });
    }
});
annotation_router.put('/update', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('name').escape().notEmpty().withMessage('annotation name is required'),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
    (0, express_validator_1.body)('description').escape().notEmpty().withMessage('annotation description is required')
        .isString().withMessage('annotation description must be a string'),
    (0, express_validator_1.body)('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    (0, express_validator_1.body)('repeat').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['never', 'day', 'week', 'month', 'year']).withMessage('invalid annotation repeat '),
    (0, express_validator_1.body)('date').notEmpty().withMessage('date is required')
        .isDate().withMessage('date must be a dateType format (YYYY/MM/DD)'),
    (0, express_validator_1.body)('id').escape().notEmpty().withMessage('annotation id is required')
        .isInt().withMessage('annotation id must be a number'),
    (0, express_validator_1.body)('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bills or payment'),
    (0, express_validator_1.body)('annon_type_id').escape().toInt(),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { id, name, description, value, repeat, status: annon_status, date, annon_type, annon_type_id } = req.body;
        const { data, error, status, message } = await annotation_controller_1.default
            .update(id, user_id, name, description, value, date, repeat, annon_status, annon_type, annon_type_id);
        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts update router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, error, message });
    }
});
annotation_router.put('/confirm_status', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.body)('id').escape().notEmpty().withMessage('annotation_id is required')
        .isInt().withMessage('annotation id must be a number'),
    (0, express_validator_1.body)('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    (0, express_validator_1.body)('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bills or payment'),
    (0, express_validator_1.body)('name').escape().notEmpty().withMessage('annotation name is required'),
    (0, express_validator_1.body)('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
], async (req, res) => {
    try {
        console.log(req.body);
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { id: annotation_id, name, value, status: annon_status, annon_type } = req.body;
        const { data, error, status, message } = await annotation_controller_1.default
            .confirmStatus(user_id, annotation_id, name, value, annon_status, annon_type);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts delete router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.delete('/delete', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('annotation_id').escape().notEmpty().withMessage('annotation_id is required')
        .isInt().withMessage('annotation_id must be a number'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const annotation_id = parseInt(req.query.annotation_id, 10);
        const { data, error, status, message } = await annotation_controller_1.default
            .remove(annotation_id, user_id);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.delete('/bulk_delete', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('annotation_ids').escape().notEmpty().withMessage('annotation_ids is required')
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const annotation_ids_str = JSON.parse(req.query.annotation_ids);
        const annotation_ids_num = (0, commun_fns_1.parseArrOfStrToInt)(annotation_ids_str);
        const { data, error, status, message } = await annotation_controller_1.default
            .bulkRemove(user_id, annotation_ids_num);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts bulk delete router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, error, status, message } = await annotation_controller_1.default.getAll(user_id);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_by_type', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bill or payment'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { type } = req.query;
        const { data, error, status, message } = await annotation_controller_1.default.getAllType(user_id, type);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_by_status', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { status: annon_status } = req.query;
        const { data, error, status, message } = await annotation_controller_1.default.getAllStatus(user_id, annon_status);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_between_dates', [
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
        const { data, status, message, error } = await annotation_controller_1.default.getAllBetweenDates(user_id, start_date, end_date);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in annontation_router.js get all between dates router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, error, message });
    }
});
annotation_router.get('/get_all_from_month', [
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
        const { data, status, message, error } = await annotation_controller_1.default.getAllBetweenDates(user_id, firstDay, lastDay);
        return res.status(status).json({ data, message, error });
    }
    catch (e) {
        console.error(`A Error Ocurred in annontation_router.ts get all from month router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_warnings', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    (0, express_validator_1.check)('time_interval').notEmpty().withMessage('time_interval is required')
        .isInt().withMessage('time_interval must be a integer number'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const time_interval = parseInt(req.query.time_interval, 10);
        const offsetDate = (0, dayjs_1.default)().add(time_interval, 'day').format('YYYY-MM-DD');
        const { data, error, status, message } = await annotation_controller_1.default
            .getAllPendentOrExpired(user_id, offsetDate);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_warnings_for_prediction_date', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data: offsetDate } = await prediction_date_controler_1.default.get(user_id);
        const { data, error, status, message } = await annotation_controller_1.default
            .getAllPendentOrExpired(user_id, offsetDate);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by preditcion date router!
            TimeStamp: ${Date.now().toLocaleString('en-US')}
            Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/all', [
    (0, express_validator_1.header)('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req, res) => {
    try {
        (0, express_validator_1.validationResult)(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller_1.default.getUserIDFromJWT(userJWT);
        const { data, error, status, message } = await annotation_controller_1.default
            .getAll(user_id);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = (0, index_1.routerErrorHandler)(e);
        return res.status(status).json({ data, message, error });
    }
});
exports.default = annotation_router;
//# sourceMappingURL=annotation_router.js.map