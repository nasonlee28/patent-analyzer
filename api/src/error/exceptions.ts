import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

import { NotFoundError } from "./NotfoundError";
import { ValidateError } from "./ValidateError";

export const errorHandler = (
  error: Error | NotFoundError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  if (error instanceof NotFoundError) {
    res.status(404).json({
      error,
      message: error.message
    });
    return;
  } else if (error instanceof ValidateError) {
    res.status(400).json({
      errors: error.errors,
      message: error.message
    });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const validateErrors = validationResult(req).array();
  if (validateErrors.length > 0) {
    throw new ValidateError(validateErrors);
  }
  next();
};
