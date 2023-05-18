import { useAppDispatch } from "@/redux/hooks";
import { Button } from "react-bootstrap";

/**
 * Button which triggers logout action. The redux store is updated if the button is clicked.
 */
export default function LogoutButton() {
    const dispatch = useAppDispatch();

    return (
        <Button
            onClick={async () => {
                const formioReact = await import("@formio/react");
                console.debug("Logging out...");
                dispatch(formioReact.logout());
            }}
        >
            Odhlásit se
        </Button>
    );
}