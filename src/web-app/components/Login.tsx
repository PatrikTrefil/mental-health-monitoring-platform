import { useEffect, useState } from "react";
import { useAppSelector } from "../redux/hooks";
import { roleIdSelector } from "../redux/selectors";
import { UserRoleTitle } from "../redux/users";
import LogoutButton from "./LogoutButton";
import DynamicLoginForm from "./dynamicFormio/DynamicLoginForm";

type Props = {
    onSucessfullAuth: () => void;
    allowedRoleTitle: UserRoleTitle;
};

/**
 * Login form with logic around redirects and permissions.
 *
 * If user is not logged in, a login form is displayed.
 * If user is logged in, but does not have required permissions, a logout button is displayed and
 * the user is notified about the insufficient permissions.
 * If the user logs in successfully and has required permissions, the onSucessfullAuth callback is called.
 * If the user is already logged in and has required permissions, the onSucessfullAuth callback is called.
 */
export default function Login({ onSucessfullAuth, allowedRoleTitle }: Props) {
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
                <span>
                    Váš účet nemá přístup do této sekce. První se odhlaste a
                    poté se přihlaste jako &quot;{allowedRoleTitle}&quot;.
                </span>
                <LogoutButton />
            </>
        );

    const isUserLoggedIn = !!user;
    // if the user is already logged in, we still want don't want to display the login form,
    // because the user will either be redirected or notified about insufficient permissions.
    if (!isAuthInitialized || isThereAnOngoingAuthRequest || isUserLoggedIn)
        return <div>Načítání...</div>;

    // This form must not be rendered if the user is already logged in.
    return <DynamicLoginForm />;
}
