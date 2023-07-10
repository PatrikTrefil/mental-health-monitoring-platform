/**
 * Error thrown when an http request fails or the received
 * response was unexpected.
 */
export class RequestError extends Error {
    /**
     * Status code of the failed request.
     */
    statusCode?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.statusCode = status;
    }
}
