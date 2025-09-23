import { Schema } from "mongoose";

export const matchSchema = new Schema({
  firstUser: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  secondUser: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  chatsHistory: {
    type: Array,
  }
});
