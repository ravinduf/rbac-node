import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'basic',
    enum: ["basic", "supervisor", "admin"]
  },
  accessToken: {
    type: String
  }
})

const User = mongoose.model('user', UserSchema)

export default User;