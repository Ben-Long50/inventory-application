import express from 'express';

// Require controller modules.
import potionController from '../controllers/potionController.js';
import classificationController from '../controllers/classificationController.js';

const router = express.Router();

// GET request for list of all potion items.
router.get('/potions', potionController.potionList);

// GET catalog home page.
// router.get('/', potionController.index);

// GET request for creating a potion. NOTE This must come before routes that display potion (uses id).
router.get('/potion/create', potionController.potionCreateGet);

// // POST request for creating potion.
// router.post('/potion/create', potionController.potionCreatePost);

// // GET request to delete potion.
// router.get('/potion/:id/delete', potionController.potionDeleteGet);

// // POST request to delete potion.
// router.post('/potion/:id/delete', potionController.potionDeletePost);

// // GET request to update potion.
// router.get('/potion/:id/update', potionController.potionUpdateGet);

// // POST request to update potion.
// router.post('/potion/:id/update', potionController.potionUpdatePost);

// // GET request for one potion.
// router.get('/potion/:id', potionController.potionDetail);

// GET request for creating classification. NOTE This must come before route for id (i.e. display classification).
// router.get(
//   '/classification/create',
//   classificationController.classificationCreateGet,
// );

// // POST request for creating classification.
// router.post(
//   '/classification/create',
//   classificationController.classificationCreatePost,
// );

// // GET request to delete classification.
// router.get(
//   '/classification/:id/delete',
//   classificationController.classificationDeleteGet,
// );

// // POST request to delete classification.
// router.post(
//   '/classification/:id/delete',
//   classificationController.classificationDeletePost,
// );

// // GET request to update classification.
// router.get(
//   '/classification/:id/update',
//   classificationController.classificationUpdateGet,
// );

// // POST request to update classification.
// router.post(
//   '/classification/:id/update',
//   classificationController.classificationUpdatePost,
// );

// // GET request for one classification.
// router.get(
//   '/classification/:id',
//   classificationController.classificationDetail,
// );

// // GET request for list of all classifications.
// router.get('/classifications', classificationController.classificationList);

export default router;
