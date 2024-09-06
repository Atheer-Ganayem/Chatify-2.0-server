"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
const http_error_1 = __importDefault(require("../utils/http-error"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const __1 = require("..");
function sendMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { content } = req.body;
            const { conversationId } = req.params;
            if (!content) {
                throw new http_error_1.default("Message content cannot be empty", 422);
            }
            const conversation = yield Conversation_1.default.findById(conversationId);
            if (!conversation) {
                throw new http_error_1.default("Conversation not found.", 404);
            }
            if (conversation.participants[0].toString() !== req.userId &&
                conversation.participants[1].toString() !== req.userId) {
                throw new http_error_1.default("Not authorized.", 401);
            }
            let message = yield Message_1.default.create({
                sender: req.userId,
                content,
                readBy: [req.userId],
                conversationId: conversationId,
            });
            message = yield message.populate({ path: "sender", select: "name avatar" });
            conversation.lastMessage = message.id;
            yield conversation.save();
            const recipient = conversation.participants[0].toString() === req.userId
                ? conversation.participants[1]
                : conversation.participants[0];
            const receiverId = __1.connectedUsers[recipient.toString()];
            if (receiverId) {
                const io = require("../socket").getIo();
                io.to(receiverId).emit("newMessage", { message, conversationId });
            }
            res.status(201).json({ message: "Message sent successfully", newMessage: message });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
