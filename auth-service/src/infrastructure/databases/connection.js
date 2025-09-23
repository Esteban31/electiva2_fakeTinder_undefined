import mongoose from 'mongoose';
import { userSchema } from '../../domain/models/User.model.js';
import { swipeSchema } from '../../domain/models/Swipe.model.js';
import { matchSchema } from '../../domain/models/match.model.js';


const User = mongoose.model('User', userSchema);
const Swipe = mongoose.model('Swipe', swipeSchema);
const Match = mongoose.model('Match', matchSchema);

export const mongooseConnection = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection Auth MS to MongoDB established");

};

export { User, Swipe, Match };
