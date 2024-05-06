"use client";

import CreateUser from "@/components/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Renders a toolbar item for creating a new user with the role of {@link UserRoleTitles.FORM_MANAGER}.
 */
export default function CreateFormManagerToolbarItem() {
    const [showCreateFormManagerModal, setShowCreateFormManagerModal] =
        useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateFormManagerModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového správce dotazníků
            </Button>
            <Modal
                show={showCreateFormManagerModal}
                onHide={() => setShowCreateFormManagerModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro správce dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.FORM_MANAGER}
                        onChangeDone={() =>
                            setShowCreateFormManagerModal(false)
                        }
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
