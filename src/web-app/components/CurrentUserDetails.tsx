import { useAppSelector } from "@/redux/hooks";

/**
 * Display information about currently logged in user.
 */
export default function CurrentUserDetails() {
    const user = useAppSelector((state) => state?.auth?.user);

    return (
        <div>
            ID: <strong>{user?.data.id ?? "Načítání..."}</strong>
        </div>
    );
}
