import { useAppSelector } from "@/redux/hooks";
import { roleIdSelector } from "@/redux/selectors";
import { UserRoleTitle } from "@/redux/users";
import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import LogoutButton from "./LogoutButton";
import DynamicLoginForm from "./dynamicFormio/DynamicLoginForm";

/**
 * Login form with logic around redirects and permissions.
 *
 * If user is not logged in, a login form is displayed.
 * If user is logged in, but does not have required permissions, a logout button is displayed and
 * the user is notified about the insufficient permissions.
 * If the user logs in successfully and has required permissions, the onSucessfullAuth callback is called.
 * If the user is already logged in and has required permissions, the onSucessfullAuth callback is called.
 */
export default function Login({
    onSucessfullAuth,
    allowedRoleTitle,
}: LoginProps) {
    const user = useAppSelector((state: any) => state?.auth?.user);
    const allowedRoleId = useAppSelector(roleIdSelector(allowedRoleTitle));
    const [showLogout, setShowLogout] = useState(false);
    const isThereAnOngoingAuthRequest = useAppSelector(
        (state) => state?.auth?.isActive
    );
    const isAuthInitialized = useAppSelector((state) => state?.auth?.init);

    useEffect(() => {
        const isUserLoggedIn = !!user;

        if (isUserLoggedIn) {
            const hasUserRequiredPermissions = user.roles.some(
                (role: string) => allowedRoleId && allowedRoleId === role
            );

            if (hasUserRequiredPermissions) onSucessfullAuth();
            else setShowLogout(true);
        } else setShowLogout(false);
    }, [user, allowedRoleId, onSucessfullAuth]);

    if (showLogout)
        return (
            <>
                <Alert variant="danger">
                    Váš účet nemá přístup do této sekce. První se odhlaste a
                    poté se přihlaste jako &quot;{allowedRoleTitle}&quot;.
                </Alert>
                <LogoutButton />
            </>
        );

    const isUserLoggedIn = !!user;
    // if the user is already logged in, we still want don't want to display the login form,
    // because the user will either be redirected or notified about insufficient permissions.
    if (!isAuthInitialized || isThereAnOngoingAuthRequest || isUserLoggedIn)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    // This form must not be rendered if the user is already logged in.
    return <DynamicLoginForm />;
}

/**
 * Props for {@link Login}
 */
export interface LoginProps {
    onSucessfullAuth: () => void;
    allowedRoleTitle: UserRoleTitle;
}
