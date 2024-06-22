import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Potion from '../models/potion.js';
import Classification from '../models/classification.js';
import Effect from '../models/effect.js';
import classification from '../models/classification.js';
import effect from '../models/effect.js';

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

  potionDetail: asyncHandler(async (req, res, next) => {
    const potion = await Potion.findById(req.params.id)
      .populate('classification')
      .populate('effect')
      .populate('subEffects')
      .exec();
    res.render('potionDetail', {
      title: potion.name,
      potion,
    });
  }),

  potionCreateGet: asyncHandler(async (req, res, next) => {
    const [classifications, effects] = await Promise.all([
      Classification.find().sort({ title: 1 }).exec(),
      Effect.find().sort({ title: 1 }).exec(),
    ]);

    res.render('potionForm', {
      title: 'Create A Potion',
      classifications,
      effects,
      subEffectTitles: [],
      potion: undefined,
      errors: undefined,
    });
  }),

  potionCreatePost: [
    // Convert the genre to an array.
    (req, res, next) => {
      if (!Array.isArray(req.body.subEffect)) {
        req.body.subEffect =
          typeof req.body.subEffect === 'undefined' ? [] : [req.body.subEffect];
      }
      console.log(req.body.subEffect);
      next();
    },

    // Validate and sanitize fields.
    body('classification', 'Classification must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom((value, { req }) =>
        Classification.findById(value).then((classification) => {
          if (!classification) {
            return Promise.reject('Invalid classification');
          }
          req.classification = classification;
        }),
      ),
    body('effect', 'Primary Effect must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom((value, { req }) =>
        Effect.findById(value).then((effect) => {
          if (!effect) {
            return Promise.reject('Invalid effect');
          }
          req.effect = effect;
        }),
      ),
    body('subEffect.*')
      .optional()
      .escape()
      .custom((value, { req }) =>
        Effect.findById(value).then((effect) => {
          if (!effect) {
            return Promise.reject('Invalid subEffect');
          }
          req.subEffects = req.subEffects || [];
          req.subEffects.push(effect);
        }),
      ),
    body('price', 'Price must not be empty').trim().isInt({ min: 0 }).escape(),
    body('quantityInStock', 'In Stock must not be empty')
      .trim()
      .isInt({ min: 0 })
      .escape(),
    body('lore').optional().trim().escape(),

    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      const { title, multiplier, subMultiplier } = req.classification;
      const { statBonus, title: effectTitle, duration } = req.effect;

      const mainBonus = statBonus > 0 ? multiplier * statBonus : '';
      const mainEffectDesc =
        duration > 0
          ? `${mainBonus} ${effectTitle} for ${multiplier * duration} seconds`
          : `${mainBonus} ${effectTitle} immediately`;

      const description = [mainEffectDesc];

      if (req.subEffects) {
        req.subEffects.forEach((subEffect) => {
          const subBonus =
            subEffect.statBonus > 0 ? subMultiplier * subEffect.statBonus : '';
          if (subEffect.duration > 0) {
            description.push(
              `${subBonus} ${subEffect.title} for ${subMultiplier * subEffect.duration} seconds`,
            );
          } else {
            description.push(`${subBonus} ${subEffect.title} immediately`);
          }
        });

        const name = `${title} Potion of ${effectTitle}`;

        // Create a Book object with escaped and trimmed data.
        const potion = new Potion({
          name,
          classification: req.classification._id,
          description,
          effect: req.effect._id,
          subEffects: !req.subEffects
            ? null
            : req.subEffects.map((effect) => effect._id),
          price: req.body.price,
          quantityInStock: req.body.quantityInStock,
          lore: req.body.lore,
        });

        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all authors and genres for form.
          const [classifications, effects] = await Promise.all([
            Classification.find().sort({ title: 1 }).exec(),
            Effect.find().sort({ title: 1 }).exec(),
          ]);

          effects.forEach((item) => {
            if (potion.subEffects.includes(item._id)) {
              subEffect.checked = 'true';
            }
          });

          res.render('potionForm', {
            title: 'Create A Potion',
            classifications,
            effects,
            errors: errors.array(),
          });
        } else {
          // Data from form is valid. Save book.
          await potion.save();
          res.redirect(potion.url);
        }
      }
    }),
  ],

  potionDeleteGet: asyncHandler(async (req, res, next) => {
    const potion = await Potion.findById(req.params.id).exec();
    const deleted = false;

    res.render('potionDelete', {
      title: 'Delete Potion',
      potion,
      deleted,
    });
  }),

  potionDeletePost: asyncHandler(async (req, res, next) => {
    const potion = await Potion.findById(req.params.id).exec();
    const deleted = true;
    res.render('potionDelete', {
      title: 'Delete Potion',
      potion,
      deleted,
    });

    await Potion.findByIdAndDelete(req.params.id);
  }),

  potionUpdateGet: asyncHandler(async (req, res, next) => {
    const potion = await Potion.findById(req.params.id)
      .populate('classification')
      .populate('effect')
      .populate('subEffects')
      .exec();
    const [classifications, effects] = await Promise.all([
      Classification.find().sort({ title: 1 }).exec(),
      Effect.find().sort({ title: 1 }).exec(),
    ]);
    let subEffectTitles = [];

    if (potion.subEffects) {
      subEffectTitles = potion.subEffects.map((effect) => effect.title);
    }

    res.render('potionForm', {
      title: 'Edit Potion',
      classifications,
      effects,
      subEffectTitles,
      potion,
      errors: undefined,
    });
  }),

  potionUpdatePost: [
    (req, res, next) => {
      if (!Array.isArray(req.body.subEffect)) {
        req.body.subEffect =
          typeof req.body.subEffect === 'undefined' ? [] : [req.body.subEffect];
      }
      console.log(req.body.subEffect);
      next();
    },

    // Validate and sanitize fields.
    body('classification', 'Classification must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom((value, { req }) =>
        Classification.findById(value).then((classification) => {
          if (!classification) {
            return Promise.reject('Invalid classification');
          }
          req.classification = classification;
        }),
      ),
    body('effect', 'Primary Effect must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom((value, { req }) =>
        Effect.findById(value).then((effect) => {
          if (!effect) {
            return Promise.reject('Invalid effect');
          }
          req.effect = effect;
        }),
      ),
    body('subEffect.*')
      .optional()
      .escape()
      .custom((value, { req }) =>
        Effect.findById(value).then((effect) => {
          if (!effect) {
            return Promise.reject('Invalid subEffect');
          }
          req.subEffects = req.subEffects || [];
          req.subEffects.push(effect);
        }),
      ),
    body('price', 'Price must be a non-negative number')
      .trim()
      .isInt({ min: 0 })
      .escape(),
    body('quantityInStock', 'In Stock must be a non-negative number')
      .trim()
      .isInt({ min: 0 })
      .escape(),
    body('lore').optional().trim().escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      const { title, multiplier, subMultiplier } = req.classification;
      const { statBonus, title: effectTitle, duration } = req.effect;

      const mainBonus = statBonus > 0 ? multiplier * statBonus : '';
      const mainEffectDesc =
        duration > 0
          ? `${mainBonus} ${effectTitle} for ${multiplier * duration} seconds`
          : `${mainBonus} ${effectTitle} immediately`;

      const description = [mainEffectDesc];

      if (req.subEffects) {
        req.subEffects.forEach((subEffect) => {
          const subBonus =
            subEffect.statBonus > 0 ? subMultiplier * subEffect.statBonus : '';
          if (subEffect.duration > 0) {
            description.push(
              `${subBonus} ${subEffect.title} for ${subMultiplier * subEffect.duration} seconds`,
            );
          } else {
            description.push(`${subBonus} ${subEffect.title} immediately`);
          }
        });

        const name = `${title} Potion of ${effectTitle}`;

        // Create a Book object with escaped and trimmed data.
        const potion = new Potion({
          name,
          classification: req.classification._id,
          description,
          effect: req.effect._id,
          subEffects: !req.subEffects
            ? null
            : req.subEffects.map((effect) => effect._id),
          price: req.body.price,
          quantityInStock: req.body.quantityInStock,
          lore: req.body.lore,
          _id: req.params.id,
        });

        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/error messages.

          // Get all authors and genres for form.
          const [classifications, effects] = await Promise.all([
            Classification.find().sort({ title: 1 }).exec(),
            Effect.find().sort({ title: 1 }).exec(),
          ]);

          let subEffectTitles = [];

          if (potion.subEffects) {
            subEffectTitles = potion.subEffects.map((effect) => effect.title);
          }

          res.render('potionForm', {
            title: 'Edit Potion',
            classifications,
            effects,
            subEffectTitles,
            potion,
            errors: errors.array(),
          });
        } else {
          const updatedPotion = await Potion.findByIdAndUpdate(
            req.params.id,
            potion,
          );
          res.redirect(updatedPotion.url);
        }
      }
    }),
  ],
};

export default potionController;
