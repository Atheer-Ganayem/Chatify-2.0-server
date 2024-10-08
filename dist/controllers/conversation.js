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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
var http_error_1 = __importDefault(require("../utils/http-error"));
var Conversation_1 = __importDefault(require("../models/Conversation"));
var Message_1 = __importDefault(require("../models/Message"));
var __1 = require("..");
function sendMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var content, conversationId, conversation, message, recipient, receiverId, io_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    content = req.body.content;
                    conversationId = req.params.conversationId;
                    if (!content) {
                        throw new http_error_1.default("Message content cannot be empty", 422);
                    }
                    return [4 /*yield*/, Conversation_1.default.findById(conversationId)];
                case 1:
                    conversation = _a.sent();
                    if (!conversation) {
                        throw new http_error_1.default("Conversation not found.", 404);
                    }
                    if (conversation.participants[0].toString() !== req.userId &&
                        conversation.participants[1].toString() !== req.userId) {
                        throw new http_error_1.default("Not authorized.", 401);
                    }
                    return [4 /*yield*/, Message_1.default.create({
                            sender: req.userId,
                            content: content,
                            readBy: [req.userId],
                            conversationId: conversationId,
                        })];
                case 2:
                    message = _a.sent();
                    return [4 /*yield*/, message.populate({ path: "sender", select: "name avatar" })];
                case 3:
                    message = _a.sent();
                    conversation.lastMessage = message.id;
                    return [4 /*yield*/, conversation.save()];
                case 4:
                    _a.sent();
                    recipient = conversation.participants[0].toString() === req.userId
                        ? conversation.participants[1]
                        : conversation.participants[0];
                    receiverId = __1.connectedUsers[recipient.toString()];
                    if (receiverId) {
                        io_1 = require("../socket").getIo();
                        io_1.to(receiverId).emit("newMessage", { message: message, conversationId: conversationId });
                    }
                    res.status(201).json({ message: "Message sent successfully", newMessage: message });
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.log(err_1);
                    next(err_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
