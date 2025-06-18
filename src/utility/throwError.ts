import { HttpException, HttpStatus } from '@nestjs/common';

export function throwException(statusCode: HttpStatus, errorMessage: any) {
  const errorResponse = {
    statusCode: statusCode,
    status: 'Failure',
    error: errorMessage,
  };
  // Throw the HttpException with the constructed error response
  throw new HttpException(errorResponse, statusCode);
}
