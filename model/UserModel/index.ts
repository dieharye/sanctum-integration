import mongoose from 'mongoose';

export enum UserRole {
  Admin,
  Manager,
  User,
}

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nonce: { type: String, required: true },
  role: { type: Number, required: true, default: UserRole.User },
  lastLogin: { type: Date, required: true, default: Date.now },
  deletedAt: { type: Date, required: false },
});

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;
