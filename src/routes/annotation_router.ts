import express, { Request, Response, query } from 'express';
import dayjs from 'dayjs'
import user_controller from '../controllers/user_controller';
import { Annotation, AnnotationStatus, AnnotationType, op_type, AnnotationRepeat } from '../types';
import { routerErrorHandler } from '../error_system/index'
import { body, header, validationResult, matchedData, check } from 'express-validator';
import annotation_controller from '../controllers/annotation_controller';

import { getFirstAndLastDayOfMonth } from '../lib/functions/date';

const annotation_router = express.Router();

annotation_router.post('/create', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('name').escape().notEmpty().withMessage('annotation name is required'),
    body('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
    body('description').escape().notEmpty().withMessage('annotation description is required')
        .isString().withMessage('annotation description must be a string'),
    body('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    body('repeat').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['never', 'daily', 'weekly', 'monthly']).withMessage('invalid annotation repeat'),
    body('date').notEmpty().withMessage('date is required')
        .isDate().withMessage('date must be a dateType format (YYYY/MM/DD)'),
    body('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bill or payment'),
    body('annon_type_id').escape().toInt(),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { name, description, value, repeat, status: annon_status, date, annon_type, annon_type_id } = req.body;

        const { data, error, status, message } = await annotation_controller
            .create(user_id, name, description, value, repeat, annon_status, date, annon_type, annon_type_id);

        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts post router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, error, message });
    }
});
annotation_router.put('/update', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('name').escape().notEmpty().withMessage('annotation name is required'),
    body('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),
    body('description').escape().notEmpty().withMessage('annotation description is required')
        .isString().withMessage('annotation description must be a string'),
    body('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    body('repeat').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['never', 'daily', 'weekly', 'monthly']).withMessage('invalid annotation repeat '),
    body('date').notEmpty().withMessage('date is required')
        .isDate().withMessage('date must be a dateType format (YYYY/MM/DD)'),
    body('id').escape().notEmpty().withMessage('annotation id is required')
        .isInt().withMessage('annotation id must be a number'),
    body('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bills or payment'),
    body('annon_type_id').escape().toInt(),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { id, name, description, value, repeat, status: annon_status, date, annon_type, annon_type_id } = req.body;

        const { data, error, status, message } = await annotation_controller
            .update(id, user_id, name, description, value, date, repeat, annon_status, annon_type, annon_type_id);

        //we should not return user_id back to client...
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts update router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, error, message });
    }
});

annotation_router.put('/confirm_status', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    body('id').escape().notEmpty().withMessage('annotation_id is required')
        .isInt().withMessage('annotation id must be a number'),
    body('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
    body('annon_type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bills or payment'),
    body('name').escape().notEmpty().withMessage('annotation name is required'),
    body('value').escape().notEmpty().withMessage('annotation value is required')
        .isNumeric().withMessage('annotation value must be a number').toFloat(),

], async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { id: annotation_id, name, value, status: annon_status, annon_type } = req.body;

        const { data, error, status, message } = await annotation_controller
            .confirmStatus(
                user_id as string,
                annotation_id as number,
                name as string,
                value as number,
                annon_status as AnnotationStatus,
                annon_type as AnnotationType
            );
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts delete router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});


annotation_router.delete('/delete', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('annotation_id').escape().notEmpty().withMessage('annotation_id is required')
        .isInt().withMessage('annotation_id must be a number'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const annotation_id = parseInt(req.query.annotation_id as string, 10);

        const { data, error, status, message } = await annotation_controller
            .remove(annotation_id, user_id);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts delete router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const { data, error, status, message } = await annotation_controller.getAll(user_id);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all_by_type', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('type').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['bill', 'payment']).withMessage('annotation type must be bill or payment'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { type } = req.query;

        const { data, error, status, message } = await annotation_controller.getAllType(user_id, type as AnnotationType);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});
annotation_router.get('/get_all_by_status', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('status').escape().notEmpty().withMessage('annotation type is required')
        .isIn(['pendent', 'expired', 'payed', 'recived']).withMessage('invalid annotation status'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);
        const { status: annon_status } = req.query;

        const { data, error, status, message } = await annotation_controller.getAllStatus(user_id, annon_status as AnnotationStatus);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all_between_dates', [
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
        const { data, status, message, error } = await annotation_controller.getAllBetweenDates
            (user_id, start_date as string, end_date as string);
        return res.status(status).json({ data, message, error });

    } catch (e) {
        console.error(`A Error Ocurred in annontation_router.js get all between dates router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all_from_month', [
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

        const { firstDay, lastDay } = getFirstAndLastDayOfMonth(year, month);
        const { data, status, message, error } = await annotation_controller.getAllBetweenDates
            (user_id, firstDay as string, lastDay as string);
        return res.status(status).json({ data, message, error });

    } catch (e) {
        console.error(`A Error Ocurred in annontation_router.ts get all from month router!
        TimeStamp: ${Date.now().toLocaleString('en-US')}
        Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all_warnings', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('time_interval').notEmpty().withMessage('time_interval is required')
        .isInt().withMessage('time_interval must be a integer number'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const time_interval = parseInt(req.query.time_interval as string, 10);
        const offsetDate = dayjs().add(time_interval as number, 'day').format('YYYY-MM-DD');

        const { data, error, status, message } = await annotation_controller
            .getAllPendentOrExpired(user_id, offsetDate);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(`A Error Ocurred in annotation_router.ts get_all by type router!
    TimeStamp: ${Date.now().toLocaleString('en-US')}
    Error: ${e}`);
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});

annotation_router.get('/get_all_warnings_for_date', [
    header('authorization').escape().notEmpty()
        .withMessage('Authorization header is required')
        .contains('Bearer').withMessage('Authorization header must have Bearer'),
    check('offset_date').notEmpty().withMessage('offset_date is required')
        .isDate().withMessage('offset_date must be a date type'),
], async (req: Request, res: Response) => {
    try {
        validationResult(req).throw();

        const { headers: { authorization }, } = req;
        const userJWT = authorization?.split(' ')[1] || '';
        const user_id = await user_controller.getUserIDFromJWT(userJWT);

        const offsetDate = req.query.offset_date as string;

        const { data, error, status, message } = await annotation_controller
            .getAllPendentOrExpired(user_id, offsetDate);
        return res.status(status).json({ data, error, message });
    }
    catch (e) {
        console.error(
            `A Error Ocurred in annotation_router.ts get_all by type router!
            TimeStamp: ${Date.now().toLocaleString('en-US')}
            Error: ${e}`
        );
        const { data, status, message, error } = routerErrorHandler(e);
        return res.status(status).json({ data, message, error });
    }
});





export default annotation_router;