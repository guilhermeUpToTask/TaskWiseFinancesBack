import express, { Request, Response, query } from 'express';
import dayjs from 'dayjs'
import user_controller from '../controllers/user_controller';
import { Operation, op_type } from '../types';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult, matchedData, check } from 'express-validator';
import wallet_op_controller from '../controllers/wallet_op_controller';
import { getFirstAndLastDayOfMonth } from '../lib/functions/date';

const wallet_operation_router = express.Router();
//later we will refactor the code on the validation chain



wallet_operation_router.post('/create', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('name').escape().notEmpty().withMessage('operation name is required'),
    body('value').escape().notEmpty().withMessage('operation value is required')
        .isNumeric().withMessage('operation value must be a number').toFloat(),
    body('description').escape().notEmpty().withMessage('operation description is required')
        .isString().withMessage('operation description must be a string'),
    body('operation_type').escape().notEmpty().withMessage('operation_type is required')
        .isIn(['income', 'expanse']).withMessage('operation_type must be income or expanse'),
    body('operation_type_id').escape().toInt(),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { name, value, description, operation_type, operation_type_id } = req.body;

        const { data, error, status, message } = await wallet_op_controller.
            create(name, value, description, operation_type, user_id,operation_type_id);

        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

//if we delete first we dont need all this values we can change wallet after operation
wallet_operation_router.delete('/delete', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('operation_id').escape().notEmpty().withMessage('Operation_id is required')
        .isInt().withMessage('operation_id must be a Integer'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const operation_id = parseInt(req.query.operation_id as string, 10);

        const { data, error, status, message } = await wallet_op_controller.remove(
            user_id, operation_id);


        return res.status(status).json({ data, error, message });
        //delete implementation
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${dayjs().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

wallet_operation_router.get('/get_all', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { data, status, message, error } = await wallet_op_controller.getAll(user_id);
        return res.status(status).json({ data, message, error });

    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp: ${dayjs().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});


wallet_operation_router.get('/get_all_by_type', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('operation_type').escape().notEmpty().withMessage('operation.operation_type is required')
        .isIn(['income', 'expanse']).withMessage('operation.operation_type must be income or expense'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { operation_type } = req.query;
        const { data, status, message, error } = await wallet_op_controller.getAllType
            (user_id, operation_type as op_type);
        return res.status(status).json({ data, message, error });
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp:${dayjs().toLocaleString()}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});



wallet_operation_router.get('/get_all_between_dates', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('start_date').notEmpty().withMessage('start_date is required')
        .isDate().withMessage('start_date must be a  date'),
    check('end_date').notEmpty().withMessage('end_date is required')
        .isDate().withMessage('end_date must be a  date'),

], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { start_date, end_date } = req.query;
        const { data, status, message, error } = await wallet_op_controller.getAllBetweenDates
            (user_id, start_date as string, end_date as string);
        return res.status(status).json({ data, message, error });

    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

wallet_operation_router.get('/get_all_from_month', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('year').notEmpty().withMessage('year is required')
    .isInt().withMessage('year must be a integer number'),
    check('month').notEmpty().withMessage('month is required')
    .isInt().withMessage('month must be a integer number'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const year = parseInt(req.query.year as string, 10);
        const month = parseInt(req.query.month as string, 10);

        const {firstDay, lastDay} = getFirstAndLastDayOfMonth(year, month);
        const { data, status, message, error } = await wallet_op_controller.getAllBetweenDates
            (user_id, firstDay as string, lastDay as string);
        return res.status(status).json({ data, message, error });

    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

export default wallet_operation_router;