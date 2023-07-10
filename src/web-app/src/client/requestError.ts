/**
 * Error thrown when a fetch request fails.
 */
export class RequestError extends Error {
    /**
     * Status code of the failed request.
     */
    statusCode: number;
    constructor(status: number) {
        super();
        this.statusCode = status;
    }
}
