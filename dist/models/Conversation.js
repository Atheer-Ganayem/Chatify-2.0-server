"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationSchema = new mongoose_1.default.Schema({
    participants: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    lastMessage: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
}, {
    timestamps: true,
});
const Conversation = mongoose_1.default.model("Conversation", ConversationSchema);
exports.default = Conversation;
