"use client";

import { assigneeQuery } from "@/client/queries/userManagement";
import CreateUser from "@/components/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Toolbar item for creating a new assignee. Renders a button that opens a modal for creating a new user.
 */
export default function CreateAssigneeToolbarItem() {
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
                        userRoleTitle={UserRoleTitles.ASSIGNEE}
                        onChangeDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries({
                                queryKey: assigneeQuery.list._def,
                            });
                        }}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
