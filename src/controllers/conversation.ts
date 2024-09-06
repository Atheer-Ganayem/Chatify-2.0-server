import { NextFunction, Request, Response } from "express";
import HttpError from "../utils/http-error";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { connectedUsers } from "..";

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { content } = req.body;
    const { conversationId } = req.params;
    if (!content) {
      throw new HttpError("Message content cannot be empty", 422);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new HttpError("Conversation not found.", 404);
    }

    if (
      conversation.participants[0].toString() !== req.userId &&
      conversation.participants[1].toString() !== req.userId
    ) {
      throw new HttpError("Not authorized.", 401);
    }

    let message = await Message.create({
      sender: req.userId,
      content,
      readBy: [req.userId],
      conversationId: conversationId,
    });
    message = await message.populate({ path: "sender", select: "name avatar" });
    conversation.lastMessage = message.id;
    await conversation.save();

    const recipient =
      conversation.participants[0].toString() === req.userId
        ? conversation.participants[1]
        : conversation.participants[0];

    const receiverId = connectedUsers[recipient.toString()];
    if (receiverId) {
      const io = require("../socket").getIo();
      io.to(receiverId).emit("newMessage", { message, conversationId });
    }

    res.status(201).json({ message: "Message sent successfully", newMessage: message });
  } catch (err) {
    console.log(err);

    next(err);
  }
}
