import mongoose from "mongoose";
require("./User");

export interface IMessage extends mongoose.Document {
  sender: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  readBy: mongoose.Schema.Types.ObjectId[];
  conversationId: mongoose.Schema.Types.ObjectId;
}

const MessageSchema: mongoose.Schema<IMessage> = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
});

const Message: mongoose.Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
