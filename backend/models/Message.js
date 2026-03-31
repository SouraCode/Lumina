import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, // Storing only encrypted ciphertext
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeletedForEveryone: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
