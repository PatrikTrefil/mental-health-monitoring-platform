"use client";

import CreateUser from "@/components/shared/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Renders a toolbar item for creating a new user with the role of {@link UserRoleTitles.SPRAVCE_DOTAZNIKU}.
 */
export default function CreateSpravceDotaznikuToolbarItem() {
    const [
        showCreateSpravceDotaznikuModal,
        setShowCreateSpravceDotaznikuModal,
    ] = useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateSpravceDotaznikuModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového správce dotazníků
            </Button>
            <Modal
                show={showCreateSpravceDotaznikuModal}
                onHide={() => setShowCreateSpravceDotaznikuModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro správce dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.SPRAVCE_DOTAZNIKU}
                        onChangeDone={() =>
                            setShowCreateSpravceDotaznikuModal(false)
                        }
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
