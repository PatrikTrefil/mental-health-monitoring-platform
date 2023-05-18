import { useAppDispatch } from "@/redux/hooks";
import { useEffect } from "react";

/**
 * Asynchronously initialize authentication of the application.
 */
export default function AsyncAuthInit() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // asynchronously initialize authentication
        import("@formio/react").then((formioReact) => {
            console.debug("Initializing authentication...");
            dispatch(formioReact.initAuth());
        });
    }, [dispatch]);

    return <></>;
}