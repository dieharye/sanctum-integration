import mongoose from 'mongoose';

const TxSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  amount: { type: String },
  hash: { type: String },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const TxModel = mongoose.model('tx', TxSchema);

export default TxModel;
