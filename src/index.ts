import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Socket } from "socket.io";
import mongoose from "mongoose";
import HttpError from "./utils/http-error";
import { isAuth } from "./middlewares/auth";
import { decode } from "next-auth/jwt";
import { sendMessage } from "./controllers/conversation";
import helmet from "helmet";
require("dotenv").config();

const app = express();
const MONGO_URL = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@cluster0.znjli.mongodb.net/${process.env.mongodb_database}?retryWrites=true&w=majority`;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({ origin: process.env.frontend_domain, credentials: true, optionsSuccessStatus: 200 })
);
app.use(helmet());
app.use(isAuth);

app.post("/conversation/:conversationId", sendMessage);
app.get("/", (_req, res) => {
  res.json({ message: "Hello world" });
});

app.use((err: Error | HttpError, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.code).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Server error occurred, please try again later." });
  }
});

type SocketMap = { [key: string]: string };
export const connectedUsers: SocketMap = {};

mongoose
  .connect(MONGO_URL)
  .then(_ => {
    const server = app.listen(process.env.POST || 5000);
    const io = require("./socket").init(server);

    io.on("connection", async (socket: Socket) => {
      try {
        const { token } = socket.handshake.query;
        const decodedToken = await decode({
          token: token as string,
          secret: process.env.authSecret as string,
        });
        if (!decodedToken) {
          throw new HttpError("Not authenticated", 403);
        }
        connectedUsers[decodedToken.id as string] = socket.id;

        io.emit("getOnlineUsers", Object.keys(connectedUsers));
        socket.on("disconnect", () => {
          delete connectedUsers[decodedToken.id as string];
          io.emit("getOnlineUsers", Object.keys(connectedUsers));
        });
      } catch (error) {
        socket.disconnect(true);
      }
    });

    console.log(`app listeing on port ${process.env.POST || 5000} and mongodb connected`);
  })
  .catch(err => console.log(err));
