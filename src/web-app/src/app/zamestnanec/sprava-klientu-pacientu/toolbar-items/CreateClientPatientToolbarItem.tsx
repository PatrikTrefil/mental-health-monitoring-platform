"use client";

import { usersQuery } from "@/client/queries/userManagement";
import CreateUser from "@/components/shared/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Toolbar item for creating a new client/patient. Renders a button that opens a modal for creating a new user.
 */
export default function CreateClientPatientToolbarItem() {
    const session = useSession();
    const queryClient = useQueryClient();

    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    return (
        <>
            <Button onClick={() => setShowCreateUserModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového pacienta/klienta
            </Button>
            <Modal
                show={showCreateUserModal}
                onHide={() => setShowCreateUserModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro pacienta/klienta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.KLIENT_PACIENT}
                        onChangeDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries({
                                queryKey: usersQuery.list._def,
                            });
                        }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
