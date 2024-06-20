import mongoose from 'mongoose';

const { Schema } = mongoose;

const ClassificationSchema = new Schema({
  classification: { type: String, required: true },
});

// Virtual for classification's URL
ClassificationSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/classification/${this._id}`;
});

// Export model
export default mongoose.model('Classification', ClassificationSchema);
