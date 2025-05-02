import {Schema} from 'mongoose';



export const swipeSchema = new Schema({
    userId: { type: String, required: true },
    targetUserId: { type: String, required: true },
});