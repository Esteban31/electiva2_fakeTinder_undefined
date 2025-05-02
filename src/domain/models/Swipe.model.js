import { Schema } from "mongoose";

export const swipeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  action: { type: String, required: true },
});
