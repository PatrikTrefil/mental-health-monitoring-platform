import { Container } from "@/components/shared/client-react-bootstrap";
import NavigationBarEmployee from "./NavigationBar";

/**
 * Layout for pages that are accessible to employees.
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
            <NavigationBarEmployee />
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}
