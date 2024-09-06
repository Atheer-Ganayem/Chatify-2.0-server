import { NextFunction, Request, Response } from "express";
import HttpError from "../utils/http-error";
import { decode } from "next-auth/jwt";

export const isAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw new HttpError("Not authenticated.", 403);
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await decode({ token: token, secret: process.env.authSecret as string });
    if (!decodedToken) {
      throw new HttpError("Not authenticated.", 403);
    }

    req.userId = decodedToken.id as string;
    next();
  } catch (err) {
    next(err);
  }
};
