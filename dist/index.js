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
exports.connectedUsers = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_error_1 = __importDefault(require("./utils/http-error"));
const auth_1 = require("./middlewares/auth");
const jwt_1 = require("next-auth/jwt");
const conversation_1 = require("./controllers/conversation");
const helmet_1 = __importDefault(require("helmet"));
require("dotenv").config();
const app = (0, express_1.default)();
const MONGO_URL = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@cluster0.znjli.mongodb.net/${process.env.mongodb_database}?retryWrites=true&w=majority`;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({ origin: process.env.frontend_domain, credentials: true, optionsSuccessStatus: 200 }));
app.use((0, helmet_1.default)());
app.use(auth_1.isAuth);
app.post("/conversation/:conversationId", conversation_1.sendMessage);
app.get("/", (_req, res) => {
    res.json({ message: "Hello world" });
});
app.use((err, _req, res, _next) => {
    if (err instanceof http_error_1.default) {
        res.status(err.code).json({ message: err.message });
    }
    else {
        res.status(500).json({ message: "Server error occurred, please try again later." });
    }
});
exports.connectedUsers = {};
mongoose_1.default
    .connect(MONGO_URL)
    .then(_ => {
    const server = app.listen(process.env.POST || 5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = socket.handshake.query;
            const decodedToken = yield (0, jwt_1.decode)({
                token: token,
                secret: process.env.authSecret,
            });
            if (!decodedToken) {
                throw new http_error_1.default("Not authenticated", 403);
            }
            exports.connectedUsers[decodedToken.id] = socket.id;
            io.emit("getOnlineUsers", Object.keys(exports.connectedUsers));
            socket.on("disconnect", () => {
                delete exports.connectedUsers[decodedToken.id];
                io.emit("getOnlineUsers", Object.keys(exports.connectedUsers));
            });
        }
        catch (error) {
            socket.disconnect(true);
        }
    }));
})
    .catch(err => console.log(err));
