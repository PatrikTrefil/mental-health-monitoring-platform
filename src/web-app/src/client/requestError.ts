/**
 * Options for creating a new {@link RequestError}.
 */
export type RequestErrorOptions = ErrorOptions & {
    /**
     * Status code of the failed request.
     */
    status?: number;
};

/**
 * Error thrown when an http request returns a non-ok status code.
 */
export class RequestError extends Error {
    /**
     * Status code of the failed request.
     */
    status?: number;
    constructor(message: string, opts?: RequestErrorOptions) {
        super(message, opts);
        this.status = opts?.status;
    }
}
