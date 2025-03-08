export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(`Status: ${status}, Data: ${message}`);
    this.name = 'ApiError';
    this.status = status;
  }
}
