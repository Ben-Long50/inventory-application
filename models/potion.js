import mongoose from 'mongoose';

const { Schema } = mongoose;

const PotionSchema = new Schema({
  name: { type: String },
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
});

// Virtual for potion's URL
PotionSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/potion/${this._id}`;
});

// Export model
export default mongoose.model('Potion', PotionSchema);
