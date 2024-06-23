import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Potion from '../models/potion.js';
import Classification from '../models/classification.js';
import Effect from '../models/effect.js';
import classification from '../models/classification.js';
import effect from '../models/effect.js';

const classificationController = {
  classificationList: asyncHandler(async (req, res, next) => {
    const [classificationList, potionList] = await Promise.all([
      Classification.find().sort({ modifier: -1 }).exec(),
      Potion.find().sort({ price: -1 }).populate('classification').exec(),
    ]);

    res.render('classificationList', {
      title: 'Potions By Classification',
      classificationList,
      potionList,
    });
  }),

  classificationCreateGet: asyncHandler(async (req, res, next) => {
    res.render('classificationForm', {
      title: 'Create A Classification',
      classification: undefined,
      errors: undefined,
    });
  }),

  classificationCreatePost: [
    body('title', 'Title must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),

    body('multiplier', 'Primary multiplier must be a non-negative number')
      .trim()
      .isFloat({ min: 0 })
      .escape(),

    body('subMultiplier', 'Secondary multiplier must be a non-negative number')
      .trim()
      .isFloat({ min: 0 })
      .escape(),

    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const classification = new Classification({
        title: req.body.title,
        multiplier: req.body.multiplier,
        subMultiplier: req.body.subMultiplier,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form.

        res.render('classificationForm', {
          title: 'Create A Classification',
          classification,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Save book.
        await classification.save();
        res.redirect('/catalog/classifications');
      }
    }),
  ],

  classificationUpdateGet: asyncHandler(async (req, res, next) => {
    const classification = await Classification.findById(req.params.id).exec();

    res.render('classificationForm', {
      title: 'Update Classification',
      classification,
      errors: undefined,
    });
  }),

  classificationUpdatePost: [
    body('title', 'Title must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),

    body('multiplier', 'Primary multiplier must be a non-negative number')
      .trim()
      .isFloat({ min: 0 })
      .escape(),

    body('subMultiplier', 'Secondary multiplier must be a non-negative number')
      .trim()
      .isFloat({ min: 0 })
      .escape(),

    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data.
      const classification = new Classification({
        title: req.body.title,
        multiplier: req.body.multiplier,
        subMultiplier: req.body.subMultiplier,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for form.

        res.render('classificationForm', {
          title: 'Edit Classification',
          classification,
          errors: errors.array(),
        });
      } else {
        // Data from form is valid. Save book.
        await classification.save();
        res.redirect('/catalog/classifications');
      }
    }),
  ],

  classificationDeleteGet: asyncHandler(async (req, res, next) => {
    const classification = await Classification.findById(req.params.id).exec();
    const allPotionsInClassification = await Potion.find({
      classification: req.params.id,
    }).exec();

    const deleted = false;

    res.render('classificationDelete', {
      title: 'Delete Classification',
      classification,
      allPotionsInClassification,
      deleted,
    });
  }),

  classificationDeletePost: asyncHandler(async (req, res, next) => {
    const classification = await Classification.findById(req.params.id).exec();
    const allPotionsInClassification = await Potion.find({
      classification: req.params.id,
    }).exec();

    if (allPotionsInClassification.length > 0) {
      const deleted = false;

      res.render('classificationDelete', {
        title: 'Delete Classification',
        classification,
        allPotionsInClassification,
        deleted,
      });
    } else {
      const deleted = true;

      res.render('classificationDelete', {
        title: 'Delete Classification',
        classification,
        allPotionsInClassification,
        deleted,
      });

      await Classification.findByIdAndDelete(req.params.id);
    }
  }),
};

export default classificationController;
