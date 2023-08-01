"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import { trpc } from "@/client/trpcClient";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FormEventHandler, useMemo, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";

/**
 * Props for {@link TaskCreation}.
 */
export interface TaskCreationProps {
    /**
     * Callback called when the task is created or the creation is cancelled.
     */
    onSettled: () => void;
}

/**
 * Component for creating tasks.
 */
export default function TaskCreation({ onSettled }: TaskCreationProps) {
    const session = useSession();

    const {
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        data: userList,
        refetch: refetchUsers,
    } = useQuery({
        ...usersQuery.list(session.data?.user.formioToken!),
        enabled: !!session.data?.user.formioToken,
    });

    const userOptionsList = useMemo(() => {
        return userList?.map((user) => ({
            value: user.data.id,
            label: user.data.id,
        }));
    }, [userList]);

    const {
        isLoading: isLoadingForms,
        isError: isErrorForms,
        error: errorForms,
        data: forms,
        refetch: refetchForms,
    } = useQuery({
        ...formsQuery.list(session.data?.user.formioToken!, ["klientPacient"]),
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });

    const formOptionsList = useMemo(
        () => forms?.map((f) => ({ value: f._id, label: f.name })),
        [forms]
    );

    const utils = trpc.useContext();

    const createTask = trpc.task.createTask.useMutation({
        onSuccess: () => {
            toast.success("Úkol byl úspěšně vytvořen.");
            utils.task.listTasks.invalidate();
        },
        onError: () => {
            toast.error("Nepodařilo se vytvořit úkol.");
        },
        onSettled,
    });

    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [taskUserIds, setTaskUserIds] = useState<string[]>([]);
    const [taskFormId, setTaskFormId] = useState<string | null>();

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        for (const userId of taskUserIds)
            createTask.mutate({
                name: taskName,
                description: taskDescription,
                forUserId: userId,
                formId: taskFormId!, // formId is required
            });
    };

    if (isErrorUsers) {
        console.error(errorUsers);
        return (
            <>
                <Alert variant="danger">
                    <Alert.Heading>Nastala chyba</Alert.Heading>
                    <p>Nepodařilo se načíst seznam uživatelů</p>
                </Alert>
                <Button onClick={() => refetchUsers()}>
                    Zkusit načíst znovu
                </Button>
                <Button as="a" href="/zamestnanec/prehled" className="ms-2">
                    Zpět na přehled
                </Button>
            </>
        );
    }

    if (isErrorForms) {
        console.error(errorForms);
        return (
            <>
                <Alert variant="danger">
                    <Alert.Heading>Nastala chyba</Alert.Heading>
                    <p>Nepodařilo se načíst seznam formulářů</p>
                </Alert>
                <Button onClick={() => refetchForms()}>
                    Zkusit načíst znovu
                </Button>
                <Button as="a" href="/zamestnanec/prehled" className="ms-2">
                    Zpět na přehled
                </Button>
            </>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Label htmlFor="nazev-ukolu">Název úkolu</Form.Label>
            <Form.Control
                type="text"
                id="nazev-ukolu"
                onChange={(e) => setTaskName(e.target.value)}
                value={taskName}
                required
            />
            <Form.Label htmlFor="popis-ukolu">
                Popis úkolu <i>(nepovinné)</i>
            </Form.Label>
            <Form.Control
                type="text"
                id="popis-ukolu"
                onChange={(e) => setTaskDescription(e.target.value)}
                value={taskDescription}
            />
            <Form.Label htmlFor="pro-uzivatele">Pro uživatele</Form.Label>
            <Select
                id="pro-uzivatele"
                required
                options={userOptionsList}
                isLoading={isLoadingUsers}
                isSearchable
                isMulti
                placeholder="Vyberte uživatele"
                onChange={(selected) =>
                    setTaskUserIds(
                        Array.from(selected.values()).map((item) => item.value)
                    )
                }
            />
            <Form.Label htmlFor="form-id">Formulář k vyplnění</Form.Label>
            <Select
                id="form-id"
                required
                options={formOptionsList}
                isLoading={isLoadingForms}
                onChange={(newValue) => setTaskFormId(newValue?.value)}
                placeholder="Vyberte formulář"
            />
            <Form.Control
                type="submit"
                value={createTask.isLoading ? "Vytváření..." : "Vytvořit úkol"}
                className="mt-3"
                disabled={createTask.isLoading}
            />
        </Form>
    );
}
