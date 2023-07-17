/**
 * Props received by components in error.tsx or error-globa.tsx files.
 */
export default interface ErrorProps {
    error: Error;
    reset: () => void;
}
