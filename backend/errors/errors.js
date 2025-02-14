class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class BadRequestError extends BaseError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Not Found') {
    super((message = 'Not Found'), 404);
  }
}

class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

class ServerError extends BaseError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
};
