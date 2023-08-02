/**
 * Find out if the code is running on the server.
 * @returns True if the code is running on the server, false otherwise.
 */
function isRunningOnServer() {
    return typeof window === "undefined";
}

/**
 * Get the base url of formio based on the environment (server or client).
 * @returns Base url of formio.
 */
export default function getFormioUrl() {
    return isRunningOnServer()
        ? process.env.FORMIO_SERVER_URL
        : process.env.NEXT_PUBLIC_FORMIO_BASE_URL;
}
