"use client";

import ChangePasswordUser from "@/components/ChangePasswordUser";
import SignOutButton from "@/components/SignOutButton";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
    Accordion,
    Container,
    Modal,
    ModalBody,
    ModalTitle,
    Nav,
    Navbar,
} from "react-bootstrap";

/**
 * Navigation bar for pages accessible to assignees.
 * @param root0 - Props.
 * @param root0.children - Display ID of the user. Passed as prop so that it can be server rendered.
 */
export default function NavigationBarAssignee({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data } = useSession();
    const [isAccountDetailShowing, setIsAccountDetailShowing] = useState(false);

    const pathname = usePathname();

    return (
        <>
            <Modal
                show={isAccountDetailShowing}
                onHide={() => setIsAccountDetailShowing(false)}
            >
                <Modal.Header closeButton>
                    <ModalTitle>Detail účtu</ModalTitle>
                </Modal.Header>
                <ModalBody>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        <li>ID: {data?.user.data.id}</li>
                        <li>
                            Vytvořeno:{" "}
                            {data &&
                                new Date(data?.user.created).toLocaleString()}
                        </li>
                    </ul>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Změna hesla</Accordion.Header>
                            <Accordion.Body>
                                <ChangePasswordUser
                                    userRoleTitle={UserRoleTitles.ASSIGNEE}
                                    submissionId={data?.user._id!}
                                    userId={data?.user.data.id!}
                                    isIDFieldShowing={false}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </ModalBody>
            </Modal>
            <Navbar bg="primary" variant="dark" collapseOnSelect expand="xxl">
                <Container>
                    <Navbar.Toggle
                        data-bs-target="#navbar-scroll"
                        data-bs-toggle="collapse"
                    />
                    <Navbar.Collapse id="navbar-scroll">
                        <Nav className="align-item-center w-100 gap-3">
                            <Nav
                                variant="underline"
                                activeKey={pathname ?? ""}
                                className="align-items-center gap-3"
                            >
                                <Nav.Link href="/uzivatel/prehled">
                                    Přehled
                                </Nav.Link>
                            </Nav>
                            <Nav
                                variant="underline"
                                activeKey={pathname ?? ""}
                                className="align-items-center w-100 justify-content-end gap-2"
                            >
                                <Nav.Link
                                    className="text-white"
                                    onClick={() =>
                                        setIsAccountDetailShowing(true)
                                    }
                                >
                                    <i
                                        className="bi bi-person"
                                        style={{ paddingRight: "5px" }}
                                    ></i>
                                    {children}
                                </Nav.Link>
                                <Nav.Item>
                                    <SignOutButton
                                        variant="light"
                                        className="mx-3"
                                    />
                                </Nav.Item>
                            </Nav>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}
