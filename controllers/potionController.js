import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import Potion from '../models/potion.js';
import Classification from '../models/classification.js';
import Effect from '../models/effect.js';
import cloudinary from '../utils/cloudinary.js';
import upload from '../utils/multer.js';

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
    upload.single('image'),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path);
          req.imageURL = result.secure_url;
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Error uploading to Cloudinary',
          });
        }
      }
      next();
    }),
    body('classification', 'Classification must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom(async (value, { req }) => {
        const classification = await Classification.findById(value);
        if (!classification) {
          return Promise.reject('Invalid classification');
        }
        req.classification = classification;
      }),
    body('effect', 'Primary Effect must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom(async (value, { req }) => {
        const effect = await Effect.findById(value);
        if (!effect) {
          return Promise.reject('Invalid effect');
        }
        req.effect = effect;
      }),
    body('subEffect')
      .optional()
      .escape()
      .customSanitizer((value) => (Array.isArray(value) ? value : [value]))
      .custom(async (value, { req }) => {
        req.subEffects = [];
        for (const effectId of value) {
          const effect = await Effect.findById(effectId);
          if (!effect) {
            return Promise.reject('Invalid subEffect');
          }
          req.subEffects.push(effect);
        }
      }),
    body('price', 'Price must not be empty').trim().isInt({ min: 0 }).escape(),
    body('quantityInStock', 'In Stock must not be empty')
      .trim()
      .isInt({ min: 0 })
      .escape(),
    body('lore').optional().trim().escape(),

    asyncHandler(async (req, res) => {
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
          const subEffectDesc =
            subEffect.duration > 0
              ? `${subBonus} ${subEffect.title} for ${subMultiplier * subEffect.duration} seconds`
              : `${subBonus} ${subEffect.title} immediately`;
          description.push(subEffectDesc);
        });
      }

      const name = `${title} Potion of ${effectTitle}`;

      const potion = new Potion({
        image: req.imageURL,
        name,
        classification: req.classification._id,
        description,
        effect: req.effect._id,
        subEffects: req.subEffects
          ? req.subEffects.map((effect) => effect._id)
          : null,
        price: req.body.price,
        quantityInStock: req.body.quantityInStock,
        lore: req.body.lore,
      });

      if (!errors.isEmpty()) {
        const [classifications, effects] = await Promise.all([
          Classification.find().sort({ title: 1 }).exec(),
          Effect.find().sort({ title: 1 }).exec(),
        ]);

        effects.forEach((item) => {
          if (potion.subEffects && potion.subEffects.includes(item._id)) {
            item.checked = 'true';
          }
        });

        res.render('potionForm', {
          title: 'Create A Potion',
          classifications,
          effects,
          potion,
          errors: errors.array(),
        });
      } else {
        await potion.save();
        res.redirect(potion.url);
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
    upload.single('image'),
    asyncHandler(async (req, res, next) => {
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path);
          req.imageURL = result.secure_url;
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Error uploading to Cloudinary',
          });
        }
      }
      next();
    }),
    body('classification', 'Classification must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom(async (value, { req }) => {
        const classification = await Classification.findById(value);
        if (!classification) {
          return Promise.reject('Invalid classification');
        }
        req.classification = classification;
      }),
    body('effect', 'Primary Effect must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .custom(async (value, { req }) => {
        const effect = await Effect.findById(value);
        if (!effect) {
          return Promise.reject('Invalid effect');
        }
        req.effect = effect;
      }),
    body('subEffect')
      .optional()
      .escape()
      .customSanitizer((value) => (Array.isArray(value) ? value : [value]))
      .custom(async (value, { req }) => {
        req.subEffects = [];
        for (const effectId of value) {
          const effect = await Effect.findById(effectId);
          if (!effect) {
            return Promise.reject('Invalid subEffect');
          }
          req.subEffects.push(effect);
        }
      }),
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
      }

      const name = `${title} Potion of ${effectTitle}`;

      const potionData = {
        _id: req.params.id, // Ensure the _id is set correctly for the update
        name,
        classification: req.classification._id,
        description,
        effect: req.effect._id,
        subEffects: req.subEffects
          ? req.subEffects.map((effect) => effect._id)
          : null,
        price: req.body.price,
        quantityInStock: req.body.quantityInStock,
        lore: req.body.lore,
      };

      if (req.imageURL) {
        potionData.image = req.imageURL;
      }

      if (!errors.isEmpty()) {
        const [classifications, effects] = await Promise.all([
          Classification.find().sort({ title: 1 }).exec(),
          Effect.find().sort({ title: 1 }).exec(),
        ]);

        res.render('potionForm', {
          title: 'Edit Potion',
          classifications,
          effects,
          potion: potionData,
          errors: errors.array(),
        });
      } else {
        const updatedPotion = await Potion.findByIdAndUpdate(
          req.params.id,
          potionData,
          { new: true },
        );
        res.redirect(updatedPotion.url);
      }
    }),
  ],
};

export default potionController;
