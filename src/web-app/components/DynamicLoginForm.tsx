import { useAppDispatch } from "../redux/hooks";
import DynamicForm from "./DynamicForm";

/**
 * Dynamically loaded login form. If the user logs in successfully,
 * the user is stored in the redux store.
 * There is no additional logic around redirects and permissions.
 * This form must not be rendered if the user is already logged in.
 */
export default function DynamicLoginForm() {
    const dispatch = useAppDispatch();

    return (
        <DynamicForm
            src="/login"
            onSubmitDone={async (submission: any) => {
                const formioReact = await import("@formio/react");
                console.debug("Setting user in redux store...");
                dispatch(formioReact.setUser(submission));
            }}
        />
    );
}
