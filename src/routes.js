import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import ShowController from './app/controllers/ShowController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliveryController from './app/controllers/DeliveryController';
import WithdrawController from './app/controllers/WithdrawController';
import DeliverController from './app/controllers/DeliverController';
import FileController from './app/controllers/FileController';

import auth from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/deliveries', ShowController.index);
routes.put(
  '/deliveryman/:deliveryman_id/deliveries/:delivery_id',
  upload.single('file'),
  DeliverController.update
);
routes.put(
  '/deliveryman/:deliveryman_id/withdraw/:delivery_id',
  WithdrawController.update
);

routes.post(
  '/deliveries/:delivery_id/problems',
  DeliveryProblemController.store
);

routes.use(auth);

routes.get('/problems', DeliveryProblemController.index);
routes.get('/problems/:id', DeliveryProblemController.show);
routes.put('/problems/:id/cancel-delivery', DeliveryProblemController.update);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.destroy);

routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.destroy);

routes.post('/recipients', RecipientController.store);
routes.get('/recipients/:id', RecipientController.show);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.destroy);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
