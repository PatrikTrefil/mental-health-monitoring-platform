"use client";

import SignOutButton from "@/components/shared/SignOutButton";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Container, Nav, Navbar, Spinner } from "react-bootstrap";

export default function NavigationBarEmployee() {
    const { data } = useSession();

    const pathname = usePathname();

    return (
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
                            <Nav.Item className="text-white">
                                Přihlášen&nbsp;jako:&nbsp;
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
                            </Nav.Item>
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
    );
}
