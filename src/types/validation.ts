export type ValidationErrors = Record<string, string>;

export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationFailure = {
  success: false;
  errors: ValidationErrors;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;