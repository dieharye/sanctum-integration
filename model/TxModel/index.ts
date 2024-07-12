import mongoose from 'mongoose';

const TxSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  amount: { type: String, required: true },
  hash: { type: String, required: true },
});

const TxModel = mongoose.model('tx', TxSchema);

export default TxModel;
