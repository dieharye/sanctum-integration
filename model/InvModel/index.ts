import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    userId: { type: Number, required: true},
    amount: { type: Number, required: true},
    percent: {type: Number, require: true}
});

const invModel = mongoose.model('InvModel', UserSchema);

export default invModel;
