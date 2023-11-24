import { Container } from "@/components/ClientReactBootstrap";
import NavigationBarAssignee from "./NavigationBar";

/**
 * Layout for pages that are accessible to assignees.
 * @param root0 - Props.
 * @param root0.children - Child components.
 */
export default function AssigneeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavigationBarAssignee />
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}
