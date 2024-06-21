import mongoose from 'mongoose';

const { Schema } = mongoose;

const EffectSchema = new Schema({
  title: { type: String, required: true },
  statBonus: { type: Number },
  duration: { type: Number },
});

// Virtual for classification's URL
EffectSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/effect/${this._id}`;
});

// Export model
export default mongoose.model('Effect', EffectSchema);
