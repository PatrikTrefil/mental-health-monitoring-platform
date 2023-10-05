import { Container } from "@/components/client-react-bootstrap";
import NavigationBarClientPatient from "./NavigationBar";

/**
 * Layout for pages that are accessible to clients and patients.
 * @param root0 - Props.
 * @param root0.children - Child components.
 */
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
