import { Container } from "@/components/shared/client-react-bootstrap";
import NavigationBarClientPatient from "./NavigationBar";

export default function ZamestnanecLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavigationBarClientPatient />
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}