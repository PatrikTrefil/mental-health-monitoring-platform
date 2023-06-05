"use client";

import { trpc } from "@/client/trpcClient";

export default function TrpcExampleComponent() {
    const hello = trpc.hello.useQuery({ text: "client" });

    if (!hello.data) return <div>Loading...</div>;

    return (
        <div>
            <p>{hello.data.greeting}</p>
        </div>
    );
}
