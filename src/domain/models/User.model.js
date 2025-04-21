import {Schema} from 'mongoose';



export const userSchema = new Schema({
    fullName: String, 
    email: { type: String, required: true, unique: true },
    password: String,
    birthDate: Date,
    interesting:Array,
    likes: Object
});