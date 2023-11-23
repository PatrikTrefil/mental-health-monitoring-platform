"use client";

import CreateUser from "@/components/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Renders a toolbar item for creating a new user with the role of {@link UserRoleTitles.ASSIGNER}.
 */
export default function CreateAssignerToolbarItem() {
    const [showCreateAssignerModal, setShowCreateAssignerModal] =
        useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateAssignerModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového zadavatele dotazníků
            </Button>

            <Modal
                show={showCreateAssignerModal}
                onHide={() => setShowCreateAssignerModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro zadavatele dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.ASSIGNER}
                        onChangeDone={() => setShowCreateAssignerModal(false)}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
