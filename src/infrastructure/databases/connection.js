import mongoose from 'mongoose';
import { userSchema } from '../../domain/models/User.model.js';
import { swipeSchema } from '../../domain/models/Swipe.model.js';


const User = mongoose.model('User', userSchema);
const Swipe = mongoose.model('Swipe', swipeSchema);

export const mongooseConnection = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection to MongoDB established");
};

export { User };
