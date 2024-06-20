import express from 'express';

// Require controller modules.
import potionController from '../controllers/potionController.js';
import classificationController from '../controllers/classificationController.js';

const router = express.Router();

// GET catalog home page.
router.get('/', potionController.js.index);

// GET request for creating a potion. NOTE This must come before routes that display potion (uses id).
router.get('/potion/create', potionController.js.potion_create_get);

// POST request for creating potion.
router.post('/potion/create', potionController.js.potion_create_post);

// GET request to delete potion.
router.get('/potion/:id/delete', potionController.js.potion_delete_get);

// POST request to delete potion.
router.post('/potion/:id/delete', potionController.js.potion_delete_post);

// GET request to update potion.
router.get('/potion/:id/update', potionController.js.potion_update_get);

// POST request to update potion.
router.post('/potion/:id/update', potionController.js.potion_update_post);

// GET request for one potion.
router.get('/potion/:id', potionController.js.potion_detail);

// GET request for list of all potion items.
router.get('/potions', potionController.js.potion_list);

// GET request for creating classification. NOTE This must come before route for id (i.e. display classification).
router.get(
  '/classification/create',
  classificationController.classification_create_get,
);

// POST request for creating classification.
router.post(
  '/classification/create',
  classificationController.classification_create_post,
);

// GET request to delete classification.
router.get(
  '/classification/:id/delete',
  classificationController.classification_delete_get,
);

// POST request to delete classification.
router.post(
  '/classification/:id/delete',
  classificationController.classification_delete_post,
);

// GET request to update classification.
router.get(
  '/classification/:id/update',
  classificationController.classification_update_get,
);

// POST request to update classification.
router.post(
  '/classification/:id/update',
  classificationController.classification_update_post,
);

// GET request for one classification.
router.get(
  '/classification/:id',
  classificationController.classification_detail,
);

// GET request for list of all classifications.
router.get('/classifications', classificationController.classification_list);

export default router;
