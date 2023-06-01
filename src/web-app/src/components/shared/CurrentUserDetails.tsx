"use client";

import { useSession } from "next-auth/react";
import Spinner from "react-bootstrap/Spinner";

/**
 * Display information about currently logged in user.
 */
export default function CurrentUserDetails() {
    const { data } = useSession();

    return (
        <div className="d-flex align-items-center gap-1">
            <span>ID:</span>
            <strong>
                {data?.user.data.id ?? (
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                )}
            </strong>
        </div>
    );
}
