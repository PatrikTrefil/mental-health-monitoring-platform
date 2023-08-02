"use client";

import ChangePasswordUser from "@/components/shared/ChangePasswordUser";
import SignOutButton from "@/components/shared/SignOutButton";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Accordion,
    Container,
    Modal,
    ModalBody,
    ModalTitle,
    Nav,
    Navbar,
    Spinner,
} from "react-bootstrap";

/**
 * Navigation bar for pages accessible to employees.
 */
export default function NavigationBarEmployee() {
    const { data } = useSession();
    const [isAccountDetailShowing, setIsAccountDetailShowing] = useState(false);

    const pathname = usePathname();

    const mainRoleTitle = data?.user.roleTitles.includes(
        UserRoleTitles.SPRAVCE_DOTAZNIKU
    )
        ? UserRoleTitles.SPRAVCE_DOTAZNIKU
        : UserRoleTitles.ZADAVATEL_DOTAZNIKU;

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
                        <li>Role: {mainRoleTitle}</li>
                    </ul>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Změna hesla</Accordion.Header>
                            <Accordion.Body>
                                <ChangePasswordUser
                                    userRoleTitle={mainRoleTitle}
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
                    <Navbar.Brand
                        href="/zamestnanec/prehled"
                        style={{
                            fontSize: "2rem",
                            fontWeight: 600,
                        }}
                    >
                        NUDZ
                    </Navbar.Brand>
                    <Navbar.Toggle
                        data-bs-target="#navbar-scroll"
                        data-bs-toggle="collapse"
                    />
                    <Navbar.Collapse id="navbar-scroll">
                        <Nav className="align-item-center w-100 gap-3">
                            <Nav
                                variant="underline"
                                activeKey={pathname ?? ""}
                                className="align-items-center w-100"
                            >
                                <Nav.Link href="/zamestnanec/prehled">
                                    Přehled
                                </Nav.Link>
                                <Nav.Link href="/zamestnanec/sprava-ukolu">
                                    Správa&nbsp;úkolů
                                </Nav.Link>
                                <Nav.Link href="/zamestnanec/sprava-klientu-pacientu">
                                    Správa&nbsp;klientů/pacientů
                                </Nav.Link>
                                <Nav.Link href="/zamestnanec/sprava-zamestnancu">
                                    Správa&nbsp;zaměstnanců
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
                                    {data?.user.data.id ?? (
                                        <Spinner
                                            animation="border"
                                            role="status"
                                            size="sm"
                                        >
                                            <span className="visually-hidden">
                                                Načítání...
                                            </span>
                                        </Spinner>
                                    )}
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
