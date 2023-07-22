import express, { Request, Response } from 'express';
import wallet_controller from '../controllers/wallet_controller';
import user_controller from '../controllers/user_controller';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult } from 'express-validator';

const wallet_router = express.Router();

wallet_router.get('/', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req: Request, res: Response) => {

    try {
        validationResult(req).throw();
        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const userID = await user_controller.getUserIDFromJWT(userJWT);
        const { data, status, message, error } = await wallet_controller.get(userID);

        return res.status(status).json({ data, message, error });
    } catch (e) {
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });

    }
});


export default wallet_router;