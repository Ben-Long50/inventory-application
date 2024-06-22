import express from 'express';

// Require controller modules.
import potionController from '../controllers/potionController.js';
import classificationController from '../controllers/classificationController.js';
import effectController from '../controllers/effectController.js';

const router = express.Router();

router.get('/potions', potionController.potionList);

router.get('/potion/create', potionController.potionCreateGet);

router.post('/potion/create', potionController.potionCreatePost);

router.get('/potion/:id/delete', potionController.potionDeleteGet);

router.post('/potion/:id/delete', potionController.potionDeletePost);

router.get('/potion/:id/update', potionController.potionUpdateGet);

router.post('/potion/:id/update', potionController.potionUpdatePost);

router.get('/potion/:id', potionController.potionDetail);

router.get('/classifications', classificationController.classificationList);

router.get(
  '/classification/create',
  classificationController.classificationCreateGet,
);

router.post(
  '/classification/create',
  classificationController.classificationCreatePost,
);

router.get(
  '/classification/:id/delete',
  classificationController.classificationDeleteGet,
);

router.post(
  '/classification/:id/delete',
  classificationController.classificationDeletePost,
);

router.get(
  '/classification/:id/update',
  classificationController.classificationUpdateGet,
);

router.post(
  '/classification/:id/update',
  classificationController.classificationUpdatePost,
);

router.get('/effects', effectController.effectList);

router.get('/effect/create', effectController.effectCreateGet);

router.post('/effect/create', effectController.effectCreatePost);

router.get('/effect/:id/update', effectController.effectUpdateGet);

router.post('/effect/:id/update', effectController.effectUpdatePost);

router.get('/effect/:id/delete', effectController.effectDeleteGet);

router.post('/effect/:id/delete', effectController.effectDeletePost);

export default router;
