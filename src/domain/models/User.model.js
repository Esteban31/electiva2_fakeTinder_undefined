import {Schema} from 'mongoose';



export const userSchema = new Schema({
    fullName: { type: String, required: true}, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },
    isNewUser: { type: Boolean },
    interesting: { type: Array},
    profilePicture:{ type: String},
    description: { type: String },
    location: { type: String },
    likes: { type: Array}
});