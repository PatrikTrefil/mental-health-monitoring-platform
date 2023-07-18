import { RequestError } from "./requestError";

/**
 * Safe version of fetch that throws if a request returns a non-OK status code.
 * @throws {RequestError} if the http request fails or the response status is not OK
 * @throws {TypeError} when a network error is encountered or CORS is misconfigured on the server-side
 */
const safeFetch: typeof fetch = async (url, opts) => {
    const response = await fetch(url, opts);
    if (!response.ok)
        throw new RequestError(
            `Request to ${url} failed with status ${response.status}`,
            { status: response.status }
        );
    return response;
};

export default safeFetch;
