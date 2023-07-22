import express, { Request, Response } from 'express';
import user_controller from '../controllers/user_controller';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult } from 'express-validator';
import wallet_op_controller from '../controllers/wallet_op_controller';

const wallet_operation_router = express.Router();


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
    body('operation.user_id').escape().notEmpty().withMessage('operation.user_id is required')
        .isInt().withMessage('operation.user_id must be a Integer').toInt(),
    body('operation.operation_type').escape().notEmpty().withMessage('operation.operation_type is required')
        .isIn(['income', 'expense']).withMessage('operation.operation_type must be income or expense'),
    body('operation.op_sub_type_id').escape().toInt(),
    body('operation.date').escape().notEmpty().withMessage('operation.date is required')
        .isDate().withMessage('operation.date must be a  date')
], (req: Request, res: Response) => {
    try {
        validationResult(req).throw();
    } catch (e) {
        console.error(`A Error Ocurred in wallet_operation_router.ts post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

export default wallet_operation_router;