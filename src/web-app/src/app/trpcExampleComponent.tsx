"use client";

import { trpc } from "@/client/trpcClient";

export default function TrpcExampleComponent() {
    const allTasks = trpc.listTasks.useQuery();
    const singleTask = trpc.getTask.useQuery({ id: 1 });

    const utils = trpc.useContext();
    const createTask = trpc.createTask.useMutation({
        onSuccess: () => {
            utils.listTasks.invalidate();
        },
    });

    if (!allTasks.data || !singleTask.data) return <div>Loading...</div>;

    return (
        <div>
            <p>{allTasks.data.map((task) => task.id)}</p>
            <p>{singleTask.data.id}</p>
            <button onClick={() => createTask.mutate({ name: "test" })}>
                Create task
            </button>
        </div>
    );
}
