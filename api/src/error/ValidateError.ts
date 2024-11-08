import { ValidationError } from "express-validator";

export class ValidateError extends Error {
  status = 400;
  errors: ValidationError[] = [];

  constructor(errors: ValidationError[]) {
    super();
    this.message = "Validation Failed: " + errors.map(error => error.msg).join(", ");
    this.errors = errors;
  }
}
