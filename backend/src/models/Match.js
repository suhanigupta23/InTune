import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userALiked: { type: Boolean, default: false },
    userBLiked: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'matched'], default: 'pending' },
    matchScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Ensure uniqueness of user combinations
matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

export default mongoose.model('Match', matchSchema);
