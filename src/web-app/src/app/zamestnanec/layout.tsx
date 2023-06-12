import { Container } from "@/components/shared/client-react-bootstrap";
import NavigationBarEmployee from "./NavigationBar";

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
