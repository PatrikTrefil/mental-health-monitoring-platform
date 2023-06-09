import { Container } from "@/components/shared/client-react-bootstrap";
import Navigationbar from "./Navigationbar";

export default function ZamestnanecLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navigationbar />
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}
