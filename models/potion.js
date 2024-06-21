import mongoose from 'mongoose';

const { Schema } = mongoose;

const PotionSchema = new Schema({
  name: { type: String, required: true },
  classification: {
    type: Schema.Types.ObjectId,
    ref: 'Classification',
    required: true,
  },
  description: { type: String },
  effect: { type: Schema.Types.ObjectId, ref: 'Effect', required: true },
  subEffects: [{ type: Schema.Types.ObjectId, ref: 'Effect' }],
  price: { type: Number, required: true },
  quantityInStock: { type: Number, required: true },
  lore: { type: String },
  image: { type: Buffer },
});

PotionSchema.pre('save', async function (next) {
  // await this.populate('classification').exec();
  // await this.populate('effect').exec();
  // await this.populate('subEffects').exec();

  const { title, multiplier, subMultiplier } = this.classification;
  const { statBonus, title: effectTitle, duration } = this.effect;
  let subEffectString = '';

  this.subEffects.forEach((subEffect) => {
    subEffectString += `, ${subMultiplier * subEffect.statBonus} ${subEffect.title} for ${subMultiplier * subEffect.duration} seconds`;
  });

  if (this.subEffects.length > 0) {
    this.description = `Grants the consumer ${multiplier * statBonus} ${effectTitle} for ${multiplier * duration} seconds${subEffectString}`;
  } else {
    this.description = `Grants the consumer ${multiplier * statBonus} ${effectTitle} for ${multiplier * duration} seconds`;
  }

  this.name = `${title} Potion of ${effectTitle}`;

  next();
});

// Virtual for potion's URL
PotionSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/potion/${this._id}`;
});

// Export model
export default mongoose.model('Potion', PotionSchema);
