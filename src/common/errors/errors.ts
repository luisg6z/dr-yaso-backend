

export class AppError extends Error {
    statusCode: number;
    message: string;
    details?: string | object | any[];

    constructor(statusCode: number, message: string, details?: string | object | any[]) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
    }
}