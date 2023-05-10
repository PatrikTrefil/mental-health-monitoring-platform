import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { roleIdSelector } from "../redux/selectors";
import { UserRoleTitle } from "../redux/users";

/**
 * Wrap a component with authentication logic. The wrapped component is only displayed if the user is logged in and has
 * required permissions. Otherwise, the user is redirected to the specified page.
 * @param componentToWrap component to protect with authentication
 * @param ifNotAuthenticatedRedirectTo page to redirect to if the user is not logged in or does not have required permissions
 * @param requiredRole role required to access the wrapped component
 */
export default function WithAuth(
    componentToWrap: React.ReactElement,
    ifNotAuthenticatedRedirectTo: string,
    requiredRole: UserRoleTitle
) {
    const WrappedComponent = () => {
        const router = useRouter();
        const isAuthInitialized = useAppSelector((state) => state?.auth?.init);
        /* I can't find any description of the state.auth.isActive property,
           but based on the library's source code, it seems to be a flag that indicates
           whether there is an ongoing request to the backend. */
        const isThereAnOngoingAuthRequest = useAppSelector(
            (state) => state?.auth?.isActive
        );
        const user = useAppSelector((state) => state?.auth?.user);
        const allowedRoleId = useAppSelector(roleIdSelector(requiredRole));

        useEffect(() => {
            const isUserLoggedIn = !!user; // convert to bool

            if (isUserLoggedIn) {
                const hasUserRequiredPermissions = user.roles.some(
                    (role: string) => allowedRoleId && allowedRoleId == role
                );

                if (!hasUserRequiredPermissions) {
                    console.debug(
                        "The user does not have required permissions. Redirecting..."
                    );
                    router.push(ifNotAuthenticatedRedirectTo);
                }
            } else if (isAuthInitialized && !isThereAnOngoingAuthRequest) {
                console.debug(
                    "The user is not logged in and the auth is initialized. Redirecting..."
                );
                router.push(ifNotAuthenticatedRedirectTo);
            }
        }, [
            user,
            allowedRoleId,
            router,
            isAuthInitialized,
            isThereAnOngoingAuthRequest,
        ]);

        return componentToWrap;
    };

    return WrappedComponent;
}
