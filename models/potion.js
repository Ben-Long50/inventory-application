import mongoose from 'mongoose';

const { Schema } = mongoose;

const PotionSchema = new Schema({
  name: { type: String, required: true },
  classification: {
    type: Schema.Types.ObjectId,
    ref: 'Classification',
    required: true,
  },
  subClassifications: [{ type: Schema.Types.ObjectId, ref: 'Classification' }],
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantitiyInStock: { type: Number, required: true },
});

// Virtual for potion's URL
PotionSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/potion/${this._id}`;
});

// Export model
export default mongoose.model('Potion', PotionSchema);
