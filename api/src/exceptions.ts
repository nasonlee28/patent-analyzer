import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "./NotfoundError";

export const errorHandler = (
  error: Error | NotFoundError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  if (error instanceof NotFoundError) {
    res.status(400).json({
      error,
      message: error.message
    });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
};
