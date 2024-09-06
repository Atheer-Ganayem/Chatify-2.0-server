import mongoose from "mongoose";

export interface IConversation extends mongoose.Document {
  participants: mongoose.Schema.Types.ObjectId[];
  lastMessage: mongoose.Schema.Types.ObjectId;
}

const ConversationSchema: mongoose.Schema<IConversation> = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const Conversation: mongoose.Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
