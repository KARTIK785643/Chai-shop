import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});


reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
