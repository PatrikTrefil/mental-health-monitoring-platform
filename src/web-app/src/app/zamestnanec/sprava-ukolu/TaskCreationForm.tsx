"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import { trpc } from "@/client/trpcClient";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FormEventHandler, useMemo, useState } from "react";
import { Alert, Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";

/**
 * Props for {@link TaskCreationForm}.
 */
export interface TaskCreationFormProps {
    /**
     * Callback called when the task is created or the creation is cancelled.
     */
    onSettled: () => void;
}

/**
 * Component for creating tasks.
 * @param root0 - Props for the component.
 * @param root0.onSettled - Callback called when the task is created or the creation is cancelled.
 */
export default function TaskCreationForm({ onSettled }: TaskCreationFormProps) {
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
        onSuccess: (_, vars) => {
            console.debug("Created task task", vars);
            toast.success("Úkol byl úspěšně vytvořen.");
            utils.task.listTasks.invalidate();
        },
        onError: (e, vars) => {
            console.debug("Failed to create task", { e, vars });
            toast.error("Nepodařilo se vytvořit úkol.");
        },
        onSettled,
        onMutate: (vars) => {
            console.debug("Creating task", vars);
        },
    });

    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [taskUserIds, setTaskUserIds] = useState<string[]>([]);
    const [taskFormId, setTaskFormId] = useState<string>();
    const [taskDueDate, setTaskDueDate] = useState<string>("");
    const [taskDueTime, setTaskDueTime] = useState<string>("");
    const [
        taskCanBeCompletedAfterDeadline,
        setTaskCanBeCompletedAfterDeadline,
    ] = useState<boolean>(false);

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        for (const userId of taskUserIds) {
            let deadline:
                | { dueDateTime: Date; canBeCompletedAfterDeadline: boolean }
                | undefined;

            if (taskDueDate !== "") {
                const dueDateTime = new Date(taskDueDate);
                const [hours, minutes, seconds, milliseconds] =
                    taskDueTime.split(":");
                dueDateTime.setHours(
                    hours ? parseInt(hours) : dueDateTime.getHours(),
                    minutes ? parseInt(minutes) : dueDateTime.getMinutes(),
                    seconds ? parseInt(seconds) : dueDateTime.getSeconds(),
                    milliseconds
                        ? parseInt(milliseconds)
                        : dueDateTime.getMilliseconds()
                );
                deadline = {
                    dueDateTime,
                    canBeCompletedAfterDeadline:
                        taskCanBeCompletedAfterDeadline,
                };
            }
            createTask.mutate({
                name: taskName,
                description: taskDescription,
                forUserId: userId,
                formId: taskFormId!, // formId is required
                deadline,
            });
        }
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
                <Button as="a" href="/zamestnanec/" className="ms-2">
                    Zpět
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
                <Button as="a" href="/zamestnanec/" className="ms-2">
                    Zpět
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
            <Form.Label htmlFor="deadline-date">
                Deadline datum <i>(nepovinné)</i>
            </Form.Label>
            <Form.Control
                id="deadline-date"
                type="date"
                value={taskDueDate}
                onChange={(e) => {
                    if (e.target.value === "") {
                        setTaskCanBeCompletedAfterDeadline(false);
                        setTaskDueTime("");
                    } else if (taskDueDate === "") {
                        setTaskDueTime("23:59");
                    }
                    setTaskDueDate(e.target.value);
                }}
                min={new Date().toISOString().split("T")[0]}
            />
            <Form.Label htmlFor="deadline-time">Deadline čas</Form.Label>
            <OverlayTrigger
                overlay={
                    <Tooltip>
                        Toto pole lze vyplnit pouze pokud je nastaven deadline.
                    </Tooltip>
                }
                trigger={taskDueDate === "" ? ["hover", "focus"] : []}
                placement="top"
            >
                <Form.Control
                    id="deadline-time"
                    type="time"
                    value={taskDueTime}
                    disabled={taskDueDate === ""}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    min={
                        taskDueDate === new Date().toISOString().split("T")[0] // current time
                            ? `${new Date().getHours()}:${new Date().getMinutes()}`
                            : undefined
                    }
                />
            </OverlayTrigger>
            <Form.Check
                className="mt-2"
                type="switch"
                label={
                    <OverlayTrigger
                        overlay={
                            <Tooltip>
                                Toto pole lze vyplnit pouze pokud je nastaven
                                deadline.
                            </Tooltip>
                        }
                        trigger={taskDueDate === "" ? ["hover", "focus"] : []}
                        placement="top"
                    >
                        <span>Může být splněn i po deadline?</span>
                    </OverlayTrigger>
                }
                checked={taskCanBeCompletedAfterDeadline}
                disabled={taskDueDate === ""}
                onChange={(e) =>
                    setTaskCanBeCompletedAfterDeadline(e.target.checked)
                }
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
