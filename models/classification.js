import mongoose from 'mongoose';

const { Schema } = mongoose;

const ClassificationSchema = new Schema({
  title: { type: String, required: true },
  multiplier: { type: Number, required: true },
  subMultiplier: { type: Number, required: true },
});

// Virtual for classification's URL
ClassificationSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/classification/${this._id}`;
});

// Export model
export default mongoose.model('Classification', ClassificationSchema);
