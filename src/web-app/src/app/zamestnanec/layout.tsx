import { Container } from "@/components/ClientReactBootstrap";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import NavigationBarEmployee from "./NavigationBar";

/**
 * Layout for pages that are accessible to employees.
 * @param root0 - Props.
 * @param root0.children - Child components.
 */
export default async function ZamestnanecLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    return (
        <>
            <NavigationBarEmployee>
                {session?.user.data.id}
            </NavigationBarEmployee>
            <Container className="mt-3">
                <main>{children}</main>
            </Container>
        </>
    );
}
