import express, { Request, Response } from 'express';
import user_controller from '../controllers/user_controller';
import { Operation, op_type } from '../types';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult, matchedData } from 'express-validator';
import wallet_op_controller from '../controllers/wallet_op_controller';

const wallet_operation_router = express.Router();


//later we will refactor the code on the validation chain

const isOperation = (operation: any): operation is Operation => {
    return (
        operation.name !== undefined &&
        operation.wallet_id !== undefined &&
        operation.description !== undefined &&
        operation.operation_type !== undefined &&
        operation.value !== undefined &&
        operation.date !== undefined
    )
}

//need to see later if the user id matchs with the operation user id
wallet_operation_router.post('/create', [
    header('authorization').escape().notEmpty().withMessage('authorization header is required')
        .isJWT().withMessage('authorization header must be a JWT'),
    body('operation').notEmpty().withMessage('operation.value is required')
        .isObject().withMessage('operation must be an object'),
    body('operation.name').escape().notEmpty().withMessage('operation.name is required'),
    body('operation.value').escape().notEmpty().withMessage('operation.value is required')
        .isNumeric().withMessage('operation.value must be a number').toFloat(),
    body('operation.description').escape().notEmpty().withMessage('operation.description is required'),
    body('operation.wallet_id').escape().notEmpty().withMessage('operation.wallet_id is required')
        .isInt().withMessage('operation.wallet_id must be a Integer').toInt(),
    body('operation.operation_type').escape().notEmpty().withMessage('operation.operation_type is required')
        .isIn(['income', 'expense']).withMessage('operation.operation_type must be income or expense'),
    body('operation.op_sub_type_id').escape().toInt(),
    body('operation.date').escape().notEmpty().withMessage('operation.date is required')
        .isDate().withMessage('operation.date must be a  date')
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { name, value, description, wallet_id, operation_type, operation_type_id, date } = req.body;

        const { data, error, status, message } = await wallet_op_controller.
            create(name, value, description, wallet_id, operation_type, operation_type_id, date, user_id)
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


wallet_operation_router.delete('/delete', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('operation_id').escape().notEmpty().withMessage('Operation_id is required')
        .isInt().withMessage('operation_id must be a Integer').toInt(),
    body('value').escape().notEmpty().withMessage('value is required')
        .isNumeric().withMessage('operation.value must be a number').toFloat(),
    body('operation_type').escape().notEmpty().withMessage('operation_type is required')
        .isIn(['income', 'expense']).withMessage('operation_type must be income or expense'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { operation_id, value, operation_type } = req.body;
        const { data, error, status, message } = await wallet_op_controller.remove(
            user_id, operation_id as number, operation_type as op_type, value as number);
        return res.status(status).json({ data, error, message });
        //delete implementation
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts delete router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
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

        //delete implementation
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});


wallet_operation_router.get('/get_all_type', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('operation_type').escape().notEmpty().withMessage('operation.operation_type is required')
        .isIn(['income', 'expense']).withMessage('operation.operation_type must be income or expense'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { operation_type } = req.body;
        const { data, status, message, error } = await wallet_op_controller.getAllType
            (user_id, operation_type as op_type);
        return res.status(status).json({ data, message, error });
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts getAll router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});



wallet_operation_router.get('/get_all_between_dates', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('start_date').escape().notEmpty().withMessage('start_date is required')
        .isDate().withMessage('operation.date must be a  date'),
    body('end_date').escape().notEmpty().withMessage('operation.date is required')
        .isDate().withMessage('operation.date must be a  date'),

], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { start_date, end_date, operation_type } = req.body;
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

export default wallet_operation_router;