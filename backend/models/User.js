import mongoose from 'mongoose';

const claimedCouponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now },
  description: { type: String, default: 'Free Traditional Masala Chai' }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 65
  },
  claimedCoupons: [claimedCouponSchema]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
