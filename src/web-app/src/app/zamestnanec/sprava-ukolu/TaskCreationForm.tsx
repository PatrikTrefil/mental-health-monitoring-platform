"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import { trpc } from "@/client/trpcClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import {
    Alert,
    Button,
    Card,
    Form,
    InputGroup,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import { SubmitHandler, useController, useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { z } from "zod";

const formSchema = z.object({
    taskName: z.string(),
    taskDescription: z.string(),
    taskUserIds: z.string().array(),
    taskFormId: z.string(),
    deadline: z
        .object({
            taskDueDate: z.string(),
            taskDueTime: z.string(),
            taskCanBeCompletedAfterDeadline: z.boolean(),
        })
        .refine(
            (data) => {
                if (data.taskDueDate !== "" && data.taskDueTime === "")
                    return false;
                return true;
            },
            {
                message: "Doplňte čas deadline",
                path: ["taskDueTime"],
            }
        ),
});

type FormInput = z.infer<typeof formSchema>;

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

    const {
        handleSubmit,
        formState: { errors },
        watch,
        register,
        control,
        setValue,
        getValues,
    } = useForm<FormInput>({
        mode: "onTouched",
        resolver: zodResolver(formSchema),
    });

    const {
        field: {
            value: taskUserIdsValue,
            onChange: taskUserIdsOnChange,
            ...restTaskUserIdsField
        },
    } = useController<FormInput, "taskUserIds">({
        name: "taskUserIds",
        control,
        defaultValue: [],
    });

    const {
        field: {
            value: taskFormIdValue,
            onChange: taskFormIdOnChange,
            ...restTaskFormIdField
        },
    } = useController<FormInput, "taskFormId">({ name: "taskFormId", control });

    const {
        field: {
            value: canTaskBeCompletedAfterDeadlineValue,
            onChange: canTaskBeCompletedAfterDeadlineOnChange,
            ...restCanTaskBeCompletedAfterDeadline
        },
    } = useController<FormInput, "deadline.taskCanBeCompletedAfterDeadline">({
        name: "deadline.taskCanBeCompletedAfterDeadline",
        defaultValue: false,
        control,
    });

    const action: SubmitHandler<FormInput> = ({
        deadline: { taskCanBeCompletedAfterDeadline, taskDueDate, taskDueTime },
        taskDescription,
        taskFormId,
        taskName,
        taskUserIds,
    }) => {
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
                formId: taskFormId,
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
        <Form onSubmit={handleSubmit(action)}>
            <Form.Label htmlFor="task-name">Název úkolu</Form.Label>
            <Form.Control
                type="text"
                id="task-name"
                required
                {...register("taskName")}
            />
            <Form.Label htmlFor="task-description">
                Popis úkolu <i>(nepovinné)</i>
            </Form.Label>
            <Form.Control
                type="text"
                id="task-description"
                {...register("taskDescription")}
            />
            <Form.Label htmlFor="task-user-ids">Pro uživatele</Form.Label>
            <Select
                id="task-user-ids"
                required
                options={userOptionsList}
                isLoading={isLoadingUsers}
                isSearchable
                isMulti
                placeholder="Vyberte uživatele"
                value={userOptionsList?.filter((item) =>
                    taskUserIdsValue.includes(item.value)
                )}
                onChange={(selected) =>
                    taskUserIdsOnChange(
                        Array.from(selected.values()).map((item) => item.value)
                    )
                }
                {...restTaskUserIdsField}
            />
            <Form.Label htmlFor="task-form-id">Formulář k vyplnění</Form.Label>
            <Select
                id="task-form-id"
                required
                options={formOptionsList}
                isLoading={isLoadingForms}
                placeholder="Vyberte formulář"
                value={
                    taskFormIdValue
                        ? formOptionsList?.find(
                              (item) => item.value === taskFormIdValue
                          )
                        : taskFormIdValue
                }
                onChange={(selected) => {
                    if (typeof selected === "object")
                        taskFormIdOnChange(selected?.value);
                    else taskFormIdOnChange(selected);
                }}
                {...restTaskFormIdField}
            />
            <Card className="mt-3 mb-1">
                <Card.Body>
                    <Card.Title>
                        Deadline <i>(nepovinné)</i>
                    </Card.Title>
                    <Form.Label htmlFor="task-due-date">Datum</Form.Label>
                    <Form.Control
                        id="task-due-date"
                        type="date"
                        {...register("deadline.taskDueDate", {
                            deps: ["deadline.taskDueTime"],
                            onChange: (e) => {
                                if (getValues("deadline.taskDueDate") === "") {
                                    setValue("deadline.taskDueTime", "");
                                    setValue(
                                        "deadline.taskCanBeCompletedAfterDeadline",
                                        false
                                    );
                                } else if (
                                    getValues("deadline.taskDueTime") === ""
                                )
                                    setValue("deadline.taskDueTime", "23:59");
                            },
                        })}
                        min={new Date().toISOString().split("T")[0]}
                    />
                    <Form.Label htmlFor="deadline-time">Čas</Form.Label>
                    <InputGroup hasValidation>
                        <OverlayTrigger
                            overlay={
                                <Tooltip>
                                    Toto pole lze vyplnit pouze pokud je
                                    nastaven deadline.
                                </Tooltip>
                            }
                            trigger={
                                watch("deadline.taskDueDate") === ""
                                    ? ["hover", "focus"]
                                    : []
                            }
                            placement="top"
                        >
                            <Form.Control
                                id="deadline-time"
                                type="time"
                                {...register("deadline.taskDueTime")}
                                disabled={watch("deadline.taskDueDate") === ""}
                                min={
                                    watch("deadline.taskDueDate") ===
                                    new Date().toISOString().split("T")[0] // current time string
                                        ? `${new Date().getHours()}:${new Date().getMinutes()}`
                                        : undefined
                                }
                                isInvalid={!!errors.deadline}
                            />
                        </OverlayTrigger>
                        <Form.Control.Feedback type="invalid">
                            {errors.deadline?.taskDueTime?.message}
                        </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Check
                        className="mt-2"
                        type="switch"
                        label={
                            <OverlayTrigger
                                overlay={
                                    <Tooltip>
                                        Toto pole lze vyplnit pouze pokud je
                                        nastaven deadline.
                                    </Tooltip>
                                }
                                trigger={
                                    watch("deadline.taskDueDate") === ""
                                        ? ["hover", "focus"]
                                        : []
                                }
                                placement="top"
                            >
                                <span>Může být splněn i po deadline?</span>
                            </OverlayTrigger>
                        }
                        disabled={watch("deadline.taskDueDate") === ""}
                        checked={canTaskBeCompletedAfterDeadlineValue}
                        onChange={(e) =>
                            canTaskBeCompletedAfterDeadlineOnChange(
                                e.target.checked
                            )
                        }
                        {...restCanTaskBeCompletedAfterDeadline}
                    />
                </Card.Body>
            </Card>
            <Form.Control
                type="submit"
                value={createTask.isLoading ? "Vytváření..." : "Vytvořit úkol"}
                className="mt-3"
                disabled={createTask.isLoading}
            />
        </Form>
    );
}
