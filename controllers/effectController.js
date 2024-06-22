import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Potion from '../models/potion.js';
import Classification from '../models/classification.js';
import Effect from '../models/effect.js';
import classification from '../models/classification.js';
import effect from '../models/effect.js';

const effectController = {
  effectList: asyncHandler(async (req, res, next) => {
    const [effectList, potionList] = await Promise.all([
      Effect.find().sort({ title: 1 }).exec(),
      Potion.find().sort({ price: -1 }).populate('effect').exec(),
    ]);

    res.render('effectList', {
      title: 'Potions By effect',
      effectList,
      potionList,
    });
  }),

  effectCreateGet: asyncHandler(async (req, res, next) => {
    res.render('effectForm', {
      title: 'Create An Effect',
      effect: undefined,
      errors: undefined,
    });
  }),

  effectCreatePost: [
    body('title', 'Title must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),

    body('statBonus', 'Stat Bonus must be a non-negative number')
      .trim()
      .isInt({ min: 0 })
      .escape(),

    body('duration', 'Duration must be a non-negative number')
      .trim()
      .isInt({ min: 0 })
      .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      const effect = new Effect({
        title: req.body.title,
        statBonus: req.body.statBonus,
        duration: req.body.duration,
      });

      if (!errors.isEmpty()) {
        res.render('effectForm', {
          title: 'Create An Effect',
          effect,
          errors: errors.array(),
        });
      } else {
        await effect.save();
        res.redirect('/catalog/effects');
      }
    }),
  ],

  effectUpdateGet: asyncHandler(async (req, res, next) => {
    const effect = await Effect.findById(req.params.id).exec();

    res.render('effectForm', {
      title: 'Update Effect',
      effect,
      errors: undefined,
    });
  }),

  effectUpdatePost: [
    body('title', 'Title must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),

    body('statBonus').trim().escape(),

    body('duration', 'Duration must be a non-negative number')
      .trim()
      .isInt({ min: 0 })
      .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      const effect = new Effect({
        title: req.body.title,
        statBonus: req.body.statBonus,
        duration: req.body.duration,
      });

      if (!errors.isEmpty()) {
        res.render('effectForm', {
          title: 'Create An Effect',
          effect,
          errors: errors.array(),
        });
      } else {
        await effect.save();
        res.redirect('/catalog/effects');
      }
    }),
  ],

  effectDeleteGet: asyncHandler(async (req, res, next) => {
    const effect = await Effect.findById(req.params.id).exec();
    const allPotionsInEffect = await Potion.find({
      effect: req.params.id,
    }).exec();

    const deleted = false;

    res.render('effectDelete', {
      title: 'Delete Effect',
      effect,
      allPotionsInEffect,
      deleted,
    });
  }),

  effectDeletePost: asyncHandler(async (req, res, next) => {
    const effect = await Effect.findById(req.params.id).exec();
    const allPotionsInEffect = await Potion.find({
      effect: req.params.id,
    }).exec();

    if (allPotionsInEffect.length > 0) {
      const deleted = false;

      res.render('effectDelete', {
        title: 'Delete Effect',
        effect,
        allPotionsInEffect,
        deleted,
      });
    } else {
      const deleted = true;

      res.render('effectDelete', {
        title: 'Delete Effect',
        effect,
        allPotionsInEffect,
        deleted,
      });

      await Effect.findByIdAndDelete(req.params.id);
    }
  }),
};

export default effectController;
