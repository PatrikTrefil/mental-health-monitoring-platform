"use client";

import CreateUser from "@/components/CreateUser";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

/**
 * Renders a toolbar item for creating a new user with the role of {@link UserRoleTitles.ZADAVATEL_DOTAZNIKU}.
 */
export default function CreateZadavatelDotaznikuToolbarItem() {
    const [
        showCreateZadavatelDotaznikuModal,
        setShowCreateZadavatelDotaznikuModal,
    ] = useState(false);

    return (
        <>
            <Button onClick={() => setShowCreateZadavatelDotaznikuModal(true)}>
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Založit účet nového zadavatele dotazníků
            </Button>

            <Modal
                show={showCreateZadavatelDotaznikuModal}
                onHide={() => setShowCreateZadavatelDotaznikuModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Založení nového účtu pro zadavatele dotazníků
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateUser
                        userRoleTitle={UserRoleTitles.ZADAVATEL_DOTAZNIKU}
                        onChangeDone={() =>
                            setShowCreateZadavatelDotaznikuModal(false)
                        }
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
