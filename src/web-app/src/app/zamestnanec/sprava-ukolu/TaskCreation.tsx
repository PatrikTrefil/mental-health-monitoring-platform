"use client";

import { trpc } from "@/client/trpcClient";
import { Form as FormioForm } from "@/types/form";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FormEventHandler, useCallback, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import AsyncSelect from "react-select/async";
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

    // TODO: make client class
    const fetchUsers = useCallback(async () => {
        if (!session.data?.user.formioToken)
            throw new Error("No token in session");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission`,
            {
                headers: {
                    "x-jwt-token": session.data.user.formioToken,
                },
            }
        );

        return (await response.json()) as UserFormSubmission[];
    }, [session.data?.user.formioToken]);

    const {
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        data: userList,
        refetch: refetchUsers,
    } = useQuery({
        queryKey: ["users"],
        queryFn: () => fetchUsers(),
        enabled: !!session.data?.user.formioToken,
    });

    const fetchForms = useCallback(async () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}form/`);
        url.searchParams.set("type", "form");
        url.searchParams.set("tags", "klientPacient");

        const response = await fetch(url, {
            headers: {
                "x-jwt-token": session.data!.user.formioToken, // token won't be null, because the query is disabled when it is
            },
        });

        return (await response.json()) as FormioForm[];
    }, [session.data]);

    const {
        isLoading: isLoadingForms,
        isError: isErrorForms,
        error: errorForms,
        data: forms,
        refetch: refetchForms,
    } = useQuery({
        queryKey: ["forms"],
        queryFn: () => fetchForms(),
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });

    const utils = trpc.useContext();

    const createTask = trpc.createTask.useMutation({
        onSuccess: () => {
            toast.success("Úkol byl úspěšně vytvořen.");
            utils.listTasks.invalidate();
        },
        onError: () => {
            toast.error("Nepodařilo se vytvořit úkol.");
        },
        onSettled,
    });

    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [taskUserIds, setTaskUserIds] = useState<string[]>([]);
    const [taskFormId, setTaskFormId] = useState("");

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        for (const userId of taskUserIds)
            createTask.mutate({
                name: taskName,
                description: taskDescription,
                forUserId: userId,
                formId: taskFormId,
            });
    };

    if (isLoadingUsers || isLoadingForms)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    if (isErrorUsers) {
        console.error(errorUsers);
        return (
            <>
                <Alert variant="danger">
                    Nepodařilo se načíst seznam uživatelů
                </Alert>
                <Button onClick={() => refetchUsers()}>
                    Zkusit načíst znovu
                </Button>
                <Button as="a" href="/zamestnanec/prehled">
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
                    Nepodařilo se načíst seznam formulářů
                </Alert>
                <Button onClick={() => refetchForms()}>
                    Zkusit načíst znovu
                </Button>
                <Button as="a" href="/zamestnanec/prehled">
                    Zpět na přehled
                </Button>
            </>
        );
    }

    if (userList.length === 0)
        return (
            <>
                <Alert variant="danger">Žádní uživatelé</Alert>
                <Button as="a" href="/zamestnanec/prehled">
                    Zpět na přehled
                </Button>
            </>
        );

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
            <Form.Label htmlFor="popis-ukolu">Popis úkolu</Form.Label>
            <Form.Control
                type="text"
                id="popis-ukolu"
                onChange={(e) => setTaskDescription(e.target.value)}
                value={taskDescription}
            />
            <Form.Label htmlFor="pro-uzivatele">Pro uživatele</Form.Label>
            <AsyncSelect
                id="pro-uzivatele"
                required
                loadOptions={async (inputValue: string) => {
                    const users = await fetchUsers();
                    return users
                        .map((user) => ({
                            value: user.data.id,
                            label: user.data.id,
                        }))
                        .filter((item) => item.label.includes(inputValue));
                }}
                defaultOptions={true}
                isMulti
                placeholder="Vyberte uživatele"
                onChange={(item) =>
                    setTaskUserIds(
                        Array.from(item.values()).map((item) => item.value)
                    )
                }
            />
            <Form.Label htmlFor="form-id">Formulář k vyplnění</Form.Label>
            <Form.Select
                id="form-id"
                required
                value={taskFormId}
                onChange={(e) => setTaskFormId(e.target.value)}
            >
                <option disabled hidden value="">
                    Vyberte název formuláře
                </option>
                {forms.map((form) => (
                    <option key={form._id} value={form._id}>
                        {form.name}
                    </option>
                ))}
            </Form.Select>
            <Form.Control
                type="submit"
                value="Vytvořit úkol"
                className="mt-2"
                disabled={createTask.isLoading}
            />
        </Form>
    );
}
