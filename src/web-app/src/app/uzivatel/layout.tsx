import { Container } from "@/components/ClientReactBootstrap";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import NavigationBarAssignee from "./NavigationBar";

/**
 * Layout for pages that are accessible to assignees.
 * @param root0 - Props.
 * @param root0.children - Child components.
 */
export default async function AssigneeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    return (
        <>
            <NavigationBarAssignee>
                {session?.user.data.id}
            </NavigationBarAssignee>
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}
