import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['photo', 'video'], required: true },
  caption: { type: String, default: '' },
  isTimeCapsule: { type: Boolean, default: false },
  unlockDate: { type: Date },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
