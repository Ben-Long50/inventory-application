import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Potion from '../models/potion.js';
import Classification from '../models/classification.js';
import Effect from '../models/effect.js';

const potionController = {
  potionList: asyncHandler(async (req, res, next) => {
    const allPotions = await Potion.find(
      {},
      'name classification price quantityInStock description image',
    )
      .populate('classification')
      .sort({ price: -1 })
      .exec();
    res.render('potionList', {
      title: 'Potions in Stock',
      potionList: allPotions,
    });
  }),

  potionCreateGet: asyncHandler(async (req, res, next) => {
    const [classifications, effects] = await Promise.all([
      Classification.find().sort({ title: 1 }).exec(),
      Effect.find().sort({ title: 1 }).exec(),
    ]);

    res.render('potionForm', {
      title: 'Create Potion',
      classifications,
      effects,
      errors: undefined,
    });
  }),
};

export default potionController;
