import express, { Request, Response } from 'express';
import prediction_date_controler from '../controllers/prediction_date_controler';
import user_controller from '../controllers/user_controller';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult } from 'express-validator';

const prediction_date_router = express.Router();

prediction_date_router.get('/', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req: Request, res: Response) => {

    try {
        validationResult(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller.getUserIDFromJWT(userJWT);

        const { data, status, message, error } = await prediction_date_controler.get(userID);

        return res.status(status).json({ data, message, error });
    } catch (e) {
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });

    }
});

prediction_date_router.put('/', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('current_date').notEmpty().withMessage('current_date is required')
        .isDate().withMessage('current_date must be a dateType format (YYYY/MM/DD)'),

], async (req: Request, res: Response) => {

    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const { current_date } = req.body;

        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller.getUserIDFromJWT(userJWT);

        const { data, status, message, error } =
            await prediction_date_controler.update(userID, current_date);

        return res.status(status).json({ data, message, error });

    } catch (e) {
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });

    }
});

export default prediction_date_router;

