"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button, Container, Nav, Navbar, Spinner } from "react-bootstrap";

export default function NavigationBar() {
    const { data } = useSession();

    const pathname = usePathname();

    return (
        <Navbar bg="primary" variant="dark" collapseOnSelect expand="xxl">
            <Container>
                <Navbar.Brand href="/zamestnanec/prehled">NUDZ</Navbar.Brand>
                <Navbar.Toggle
                    data-bs-target="#navbar-scroll"
                    data-bs-toggle="collapse"
                />
                <Navbar.Collapse id="navbar-scroll">
                    <Nav
                        variant="underline"
                        activeKey={pathname ?? ""}
                        className="align-items-center gap-3"
                    >
                        <Nav.Link href="/zamestnanec/prehled">Přehled</Nav.Link>
                        <Nav.Link href="/zamestnanec/sprava-ukolu">
                            Správa&nbsp;úkolů
                        </Nav.Link>
                        <Nav.Link href="/zamestnanec/formular/vytvorit">
                            Vytvořit&nbsp;formulář
                        </Nav.Link>
                        <Nav.Link href="/zamestnanec/sprava-klientu-pacientu">
                            Správa&nbsp;klientů/pacientů
                        </Nav.Link>
                        <Nav.Link href="/zamestnanec/registrace-zamestnance">
                            Registrace&nbsp;zaměstnance
                        </Nav.Link>
                        <Nav.Item>
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
                            <Button
                                variant="secondary"
                                className="mx-2"
                                onClick={async () => {
                                    await signOut();
                                }}
                            >
                                Odhlásit&nbsp;se
                            </Button>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
