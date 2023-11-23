"use client";

import { formsQuery } from "@/client/queries/formManagement";
import { usersQuery } from "@/client/queries/userManagement";
import { trpc } from "@/client/trpcClient";
import assigneeFormTag from "@/constants/assigneeFormTag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    InputGroup,
    Modal,
    Row,
} from "react-bootstrap";
import { SubmitHandler, useController, useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "react-toastify";
import { z } from "zod";

const formSchema = z
    .object({
        taskName: z.string(),
        taskDescription: z.string(),
        taskUserIds: z.object({ label: z.string(), value: z.string() }).array(),
        taskFormId: z.object({ label: z.string(), value: z.string() }),
        start: z.string().refine(
            (value) => {
                const isSet = value !== "";
                if (!isSet) return true;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(value);
                return startDate >= today;
            },
            { message: "Začátek nemůže být v minulosti" }
        ),
        repetition: z
            .object({
                frequency: z.object({
                    value: z
                        .string()
                        .superRefine(function isNumberGreaterThanOne(
                            value,
                            ctx
                        ) {
                            if (value !== "") {
                                const numberValue = Number(value);
                                if (isNaN(numberValue))
                                    ctx.addIssue({
                                        message: "Musí být číslo",
                                        code: z.ZodIssueCode.custom,
                                    });
                                if (numberValue < 1)
                                    ctx.addIssue({
                                        message: "Musí být alespoň 1",
                                        code: z.ZodIssueCode.custom,
                                    });
                            }
                        }),
                    unit: z.enum(["day", "week", "month", "year", ""]), // Must allow empty "" because the type is used for watch() calls, which should be able to return empty string
                }),
                count: z
                    .string()
                    .superRefine(function isNumberGreaterThanOne(value, ctx) {
                        if (value !== "") {
                            const numberValue = Number(value);
                            if (isNaN(numberValue))
                                ctx.addIssue({
                                    message: "Musí být číslo",
                                    code: z.ZodIssueCode.custom,
                                });
                            if (numberValue < 1)
                                ctx.addIssue({
                                    message: "Musí být alespoň 1",
                                    code: z.ZodIssueCode.custom,
                                });
                        }
                    }),
            })
            .superRefine(function isRepetitionComplete(
                { frequency: { unit, value }, count },
                ctx
            ) {
                if (unit !== "" || value !== "" || count !== "") {
                    if (unit === "")
                        ctx.addIssue({
                            message: "Vyplňte jednotku opakování",
                            path: ["frequency", "unit"],
                            code: z.ZodIssueCode.custom,
                        });
                    if (value === "")
                        ctx.addIssue({
                            message: "Vyplňte hodnotu opakování",
                            path: ["frequency", "value"],
                            code: z.ZodIssueCode.custom,
                        });
                    if (count === "")
                        ctx.addIssue({
                            message: "Vyplňte počet opakování",
                            path: ["count"],
                            code: z.ZodIssueCode.custom,
                        });
                }
            }),
        deadline: z
            .object({
                taskDueDate: z.string(),
                taskDueTime: z.string(),
                taskCanBeCompletedAfterDeadline: z.boolean(),
            })
            .superRefine(function isDeadlineComplete(
                { taskDueDate, taskDueTime },
                ctx
            ) {
                if (taskDueDate !== "" && taskDueTime === "")
                    ctx.addIssue({
                        message: "Doplňte čas deadline",
                        path: ["taskDueTime"],
                        code: z.ZodIssueCode.custom,
                    });
                if (taskDueDate === "" && taskDueTime !== "") {
                    ctx.addIssue({
                        message: "Doplňte datum deadline",
                        path: ["taskDueDate"],
                        code: z.ZodIssueCode.custom,
                    });
                }
            })
            .refine(
                function isDeadlineDateInFuture({
                    taskDueDate: taskDueDateString,
                }) {
                    if (taskDueDateString === "") return true;
                    const taskDueDate = new Date(taskDueDateString);
                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    return taskDueDate >= currentDate;
                },
                {
                    message: "Datum nemůže být v minulosti",
                    path: ["taskDueDate"],
                }
            )
            .refine(
                function isDeadlineTimeInFuture({
                    taskDueDate: taskDueDateString,
                    taskDueTime: taskDueTimeString,
                }) {
                    if (taskDueDateString === "" || taskDueTimeString === "")
                        return true;
                    const taskDueDate = new Date(taskDueDateString);
                    if (
                        taskDueDate.toISOString().split("T")[0] !==
                        new Date().toISOString().split("T")[0]
                    )
                        return true;

                    const currDate = new Date();
                    const minHours = currDate.getHours();
                    const minMinutes = currDate.getMinutes();
                    const [hours, minutes] = taskDueTimeString
                        .split(":")
                        .map(Number);
                    if (hours === undefined || minutes === undefined)
                        return false;

                    return (
                        hours > minHours ||
                        (hours === minHours && minutes >= minMinutes)
                    );
                },
                { message: "Zvolte čas v budoucnosti", path: ["taskDueTime"] }
            ),
    })
    .superRefine(function isStartAfterDeadline({ deadline, start }, ctx) {
        const isStartSet = start !== "";
        if (!isStartSet) return;

        const startDate = new Date(start);
        const deadlineDate = new Date(deadline.taskDueDate);

        if (startDate >= deadlineDate)
            ctx.addIssue({
                message: "Start nemůže být po deadline",
                path: ["start"],
                code: z.ZodIssueCode.custom,
            });
    });

type FormInput = z.infer<typeof formSchema>;

/**
 * Component for creating tasks.
 */
export default function TaskCreationForm() {
    const session = useSession();
    const router = useRouter();

    const [userFilter, setUserFilter] = useState("");
    const [formFilter, setFormFilter] = useState("");

    const {
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        data: users,
        refetch: refetchUsers,
    } = useQuery({
        ...usersQuery.list({
            formioToken: session.data?.user.formioToken!,
            pagination: { limit: 10, offset: 0 },
            filters:
                userFilter !== ""
                    ? [
                          {
                              comparedValue: userFilter,
                              operation: "contains",
                              fieldPath: "data.id",
                          },
                      ]
                    : undefined,
        }),
        enabled: !!session.data?.user.formioToken,
    });

    const userOptionsList = useMemo(() => {
        return users?.data.map((user) => ({
            value: user.data.id,
            label: user.data.id,
        }));
    }, [users]);

    const {
        isLoading: isLoadingForms,
        isError: isErrorForms,
        error: errorForms,
        data: forms,
        refetch: refetchForms,
    } = useQuery({
        ...formsQuery.list({
            formioToken: session.data?.user.formioToken!,
            tags: [assigneeFormTag],
            pagination: { limit: 10, offset: 0 },
            filters:
                formFilter !== ""
                    ? [
                          {
                              comparedValue: formFilter,
                              operation: "contains",
                              fieldPath: "name",
                          },
                      ]
                    : undefined,
        }),
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });

    const formSelectOptions = useMemo(
        () => forms?.data.map((f) => ({ value: f._id, label: f.name })),
        [forms]
    );

    const utils = trpc.useContext();

    const createTaskMutation = trpc.task.createTask.useMutation({
        onSuccess: (_, vars) => {
            console.debug("Created task task", vars);
        },
        onError: (e, vars) => {
            console.debug("Failed to create task", { e, vars });
            toast.error("Nepodařilo se vytvořit úkol.");
        },
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
        resetField,
        trigger,
    } = useForm<FormInput>({
        mode: "onTouched",
        resolver: zodResolver(formSchema),
        defaultValues: {
            deadline: {
                taskDueTime: "",
                taskDueDate: "",
            },
            repetition: {
                frequency: {
                    unit: "",
                    value: "",
                },
                count: "",
            },
        },
    });

    const [showDeadlineModal, setShowDeadlineModal] = useState(false);
    const [showRepetitionModal, setShowRepetitionModal] = useState(false);

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

    const action: SubmitHandler<FormInput> = (data) => {
        const {
            deadline,
            taskDescription,
            taskFormId,
            taskName,
            taskUserIds,
            repetition,
            start,
        } = preprocessFormData(data);
        for (const userId of taskUserIds) {
            if (deadline === undefined || repetition === undefined) {
                createTaskMutation.mutate({
                    name: taskName,
                    description: taskDescription,
                    forUserId: userId,
                    formId: taskFormId,
                    deadline,
                    start,
                });
            } else {
                const currentDueDate = new Date(deadline.dueDateTime);
                const currentStartDate =
                    start !== undefined ? new Date(start) : undefined;
                for (let i = 0; i < repetition.count; ++i) {
                    createTaskMutation.mutate({
                        name: taskName,
                        description: taskDescription,
                        forUserId: userId,
                        formId: taskFormId,
                        deadline: {
                            dueDateTime: new Date(currentDueDate),
                            canBeCompletedAfterDeadline:
                                deadline.canBeCompletedAfterDeadline,
                        },
                        start:
                            currentStartDate !== undefined
                                ? new Date(currentStartDate)
                                : undefined,
                    });
                    switch (repetition.unit) {
                        case "day":
                            currentDueDate.setDate(
                                currentDueDate.getDate() + 1
                            );
                            currentStartDate?.setDate(
                                currentStartDate.getDate() + 1
                            );
                            break;
                        case "week":
                            currentDueDate.setDate(
                                currentDueDate.getDate() + 7
                            );
                            currentStartDate?.setDate(
                                currentStartDate.getDate() + 7
                            );
                            break;
                        case "month":
                            currentDueDate.setMonth(
                                currentDueDate.getMonth() + 1
                            );
                            currentStartDate?.setMonth(
                                currentStartDate.getMonth() + 1
                            );
                            break;
                        case "year":
                            currentDueDate.setFullYear(
                                currentDueDate.getFullYear() + 1
                            );
                            currentStartDate?.setFullYear(
                                currentStartDate.getFullYear() + 1
                            );
                            break;
                    }
                }
            }
        }
        toast.success("Úkol byl úspěšně vytvořen.");
        utils.task.listTasks.invalidate();
        router.push("/zamestnanec/sprava-ukolu");
    };

    const frequencyUnitSelectOptions = useMemo(
        () => [
            { label: "Dny", value: "day" },
            { label: "Týdny", value: "week" },
            { label: "Měsíce", value: "month" },
            { label: "Roky", value: "year" },
        ],
        []
    );

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
            <Form.Group controlId="task-name">
                <Form.Label>Název úkolu</Form.Label>
                <Form.Control type="text" required {...register("taskName")} />
            </Form.Group>
            <Form.Group controlId="task-description">
                <Form.Label>
                    Popis úkolu <i>(nepovinné)</i>
                </Form.Label>
                <Form.Control type="text" {...register("taskDescription")} />
            </Form.Group>
            <Form.Label htmlFor="task-user-ids">Pro uživatele</Form.Label>
            <Select
                inputId="task-user-ids"
                required
                options={userOptionsList}
                isLoading={isLoadingUsers}
                isMulti
                isClearable
                placeholder="Vyberte uživatele"
                onInputChange={(inputValue) => setUserFilter(inputValue)}
                inputValue={userFilter}
                value={taskUserIdsValue}
                onChange={(selected) =>
                    taskUserIdsOnChange(Array.from(selected.values()))
                }
                {...restTaskUserIdsField}
            />
            <Form.Label htmlFor="task-form-id">Formulář k vyplnění</Form.Label>
            <Select
                inputId="task-form-id"
                required
                isClearable
                options={formSelectOptions}
                isLoading={isLoadingForms}
                placeholder="Vyberte formulář"
                value={taskFormIdValue}
                inputValue={formFilter}
                onInputChange={(inputValue) => setFormFilter(inputValue)}
                onChange={(selected) => taskFormIdOnChange(selected)}
                {...restTaskFormIdField}
            />
            <Form.Group controlId="start-date">
                <Form.Label>
                    Start <i>(nepovinné)</i>
                </Form.Label>
                <InputGroup hasValidation>
                    <Form.Control
                        type="date"
                        // Today
                        min={new Date().toISOString().split("T")[0]}
                        {...register("start")}
                        isInvalid={!!errors.start}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.start?.message}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
            <Card
                className="mt-3"
                onClick={() => setShowDeadlineModal(true)}
                style={{ cursor: "pointer" }}
            >
                <Card.Body className="d-flex">
                    <i
                        className="bi bi-calendar"
                        style={{ marginRight: "5px" }}
                    ></i>
                    {watch("deadline.taskDueDate") !== "" &&
                    watch("deadline.taskDueTime") &&
                    !errors.deadline ? (
                        <DeadlineText
                            taskDueDate={watch("deadline.taskDueDate")}
                            taskDueTime={watch("deadline.taskDueTime")}
                            removeDeadline={() => {
                                resetField("deadline");
                                resetField("repetition");
                            }}
                        />
                    ) : (
                        "Přidat deadline"
                    )}
                </Card.Body>
            </Card>
            <Modal
                show={showDeadlineModal}
                onHide={() => setShowDeadlineModal(false)}
                backdrop="static"
            >
                <Modal.Header>
                    <Modal.Title>
                        Deadline <i>(nepovinné)</i>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="task-due-date">
                        <Form.Label>Datum</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="date"
                                isInvalid={!!errors.deadline?.taskDueDate}
                                {...register("deadline.taskDueDate", {
                                    deps: ["deadline.taskDueTime"],
                                    onChange: (_) => {
                                        if (
                                            getValues(
                                                "deadline.taskDueTime"
                                            ) === ""
                                        )
                                            setValue(
                                                "deadline.taskDueTime",
                                                "23:59"
                                            );
                                    },
                                })}
                                // Today
                                min={new Date().toISOString().split("T")[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.deadline?.taskDueDate?.message}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="deadline-time">
                        <Form.Label>Čas</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="time"
                                {...register("deadline.taskDueTime")}
                                isInvalid={!!errors.deadline?.taskDueTime}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.deadline?.taskDueTime?.message}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Switch
                        className="mt-2"
                        id="can-task-be-completed-after-deadline"
                        label={"Může být splněn i po deadline?"}
                        checked={canTaskBeCompletedAfterDeadlineValue}
                        onChange={(e) =>
                            canTaskBeCompletedAfterDeadlineOnChange(
                                e.target.checked
                            )
                        }
                        {...restCanTaskBeCompletedAfterDeadline}
                    />
                    <Row className="mt-2">
                        <Col>
                            <Button
                                className="w-100"
                                variant="secondary"
                                onClick={() => {
                                    resetField("deadline");
                                    resetField("repetition");
                                    setShowDeadlineModal(false);
                                }}
                            >
                                Zrušit
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                className="w-100"
                                onClick={() => setShowDeadlineModal(false)}
                                disabled={
                                    !!errors.deadline ||
                                    (watch("deadline.taskDueDate") === "" &&
                                        watch("deadline.taskDueTime") === "")
                                }
                            >
                                Přidat
                            </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
            <Card
                className="mt-2"
                onClick={() => setShowRepetitionModal(true)}
                style={{ cursor: "pointer" }}
            >
                <Card.Body className="d-flex">
                    <i
                        className="bi bi-arrow-repeat"
                        style={{ marginRight: "5px" }}
                    ></i>
                    {watch("repetition.count") !== "" &&
                    watch("repetition.frequency.unit") !== "" &&
                    watch("repetition.frequency.value") !== "" &&
                    !errors.repetition ? (
                        <div className="d-flex justify-content-between w-100">
                            {`Vytvoří se ${watch(
                                "repetition.count"
                            )} úkoly s mezerami v deadline ${Number(
                                watch("repetition.frequency.value")
                            )} ${
                                frequencyUnitSelectOptions
                                    .find(
                                        ({ value }) =>
                                            value ===
                                            watch("repetition.frequency.unit")
                                    )
                                    ?.label?.toLowerCase() ?? "-"
                            }`}
                            <i
                                className="bi bi-x-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    resetField("repetition");
                                }}
                            ></i>
                        </div>
                    ) : (
                        "Přidat opakování"
                    )}
                </Card.Body>
            </Card>
            <Modal show={showRepetitionModal} backdrop="static">
                <Modal.Header>
                    <Modal.Title>Opakování</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Label htmlFor="frequency">Opakovat každé</Form.Label>
                    <Row>
                        <Col>
                            <InputGroup hasValidation>
                                <Form.Control
                                    id="frequency"
                                    min="1"
                                    {...register("repetition.frequency.value")}
                                    isInvalid={
                                        !!errors.repetition?.frequency?.value
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {
                                        errors.repetition?.frequency?.value
                                            ?.message
                                    }
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                        <Col>
                            <InputGroup hasValidation>
                                <Form.Select
                                    id="frequency-unit"
                                    placeholder="Vyberte jednotku"
                                    isInvalid={
                                        !!errors.repetition?.frequency?.unit
                                    }
                                    defaultValue={""}
                                    {...register("repetition.frequency.unit")}
                                >
                                    <option disabled hidden value="">
                                        Zvolte jednotku
                                    </option>
                                    {frequencyUnitSelectOptions.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {
                                        errors.repetition?.frequency?.unit
                                            ?.message
                                    }
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Form.Group controlId="repetition-count">
                        <Form.Label>Počet opakování</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                min="1"
                                isInvalid={!!errors.repetition?.count}
                                {...register("repetition.count")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.repetition?.count?.message}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Row className="mt-2">
                        <Col>
                            <Button
                                className="w-100"
                                variant="secondary"
                                onClick={() => {
                                    resetField("repetition");
                                    setShowRepetitionModal(false);
                                }}
                            >
                                Zrušit
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                className="w-100"
                                onClick={async () => {
                                    const isInvalid =
                                        !(await trigger("repetition.count")) ||
                                        !(await trigger(
                                            "repetition.frequency.value"
                                        )) ||
                                        !(await trigger(
                                            "repetition.frequency.unit"
                                        )) ||
                                        !(await trigger("repetition"));
                                    if (!isInvalid) {
                                        if (
                                            getValues(
                                                "deadline.taskDueDate"
                                            ) === ""
                                        ) {
                                            setValue(
                                                "deadline.taskDueDate",
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0] as string
                                            );
                                            setValue(
                                                "deadline.taskDueTime",
                                                "23:59"
                                            );
                                        }
                                        setShowRepetitionModal(false);
                                    }
                                }}
                                disabled={
                                    !!errors.repetition ||
                                    (watch("repetition.count") === "" &&
                                        watch("repetition.frequency.unit") ===
                                            "" &&
                                        watch("repetition.frequency.unit") ===
                                            "")
                                }
                            >
                                Přidat
                            </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
            <div>
                <Button
                    type="submit"
                    className="mt-3 w-100 mb-3"
                    disabled={createTaskMutation.isLoading}
                >
                    {createTaskMutation.isLoading
                        ? "Vytváření..."
                        : "Vytvořit úkol"}
                </Button>
            </div>
        </Form>
    );
}

/**
 * Component for displaying deadline as localized text.
 * @param root0 - Props for the component.
 * @param root0.taskDueDate - Date of the deadline to show.
 * @param root0.taskDueTime - Time of the deadline to show.
 * @param root0.removeDeadline - Callback called when the deadline is removed.
 * @throws {Error} - If taskDueTime is invalid.
 */
function DeadlineText({
    taskDueDate,
    taskDueTime,
    removeDeadline,
}: {
    taskDueDate: string;
    taskDueTime: string;
    removeDeadline: () => void;
}) {
    const date = new Date(taskDueDate);
    const [hours, minutes, seconds, milliseconds] = taskDueTime.split(":");

    if (hours === undefined) throw new Error("hours is undefined");
    if (minutes === undefined) throw new Error("minutes is undefined");

    date.setHours(
        Number(hours),
        Number(minutes),
        seconds ? Number(seconds) : date.getSeconds(),
        milliseconds ? Number(milliseconds) : date.getMilliseconds()
    );

    return (
        <div className="d-flex justify-content-between w-100">
            <span>Deadline {date.toLocaleString()}</span>
            <i
                className="bi bi-x-lg ml-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    removeDeadline();
                }}
            ></i>
        </div>
    );
}

/**
 * Preprocess form data to make the object more idiomatic. Replace empty strings with undefined etc.
 * @param data - Form data to preprocess.
 * @throws {Error} - If data.repetition.count is not empty and data.repetition.frequency.unit is empty.
 */
function preprocessFormData(data: FormInput) {
    let start: Date | undefined = undefined;
    if (data.start !== "") {
        start = new Date(data.start);
        start.setHours(0, 0, 0, 0);
    }

    if (data.repetition.count !== "" && data.repetition.frequency.unit === "")
        throw new Error(
            "Unit is empty which should never happen when data.repetition.count is not empty"
        );

    return {
        ...data,
        taskUserIds: data.taskUserIds.map((user) => user.value),
        taskFormId: data.taskFormId.value,
        start,
        repetition:
            data.repetition.count === ""
                ? undefined
                : {
                      count: Number(data.repetition.count),
                      value: Number(data.repetition.frequency.value),
                      unit: data.repetition.frequency.unit,
                  },
        deadline:
            data.deadline.taskDueDate === ""
                ? undefined
                : {
                      canBeCompletedAfterDeadline:
                          data.deadline.taskCanBeCompletedAfterDeadline,
                      dueDateTime: combineDueDateAndDueTime(
                          data.deadline.taskDueDate,
                          data.deadline.taskDueTime
                      ),
                  },
    };
}

/**
 * Combine two instances of Date into one, where one holds information about date
 * and the other about time.
 * @param taskDueDate - Date of the deadline.
 * @param taskDueTime - Time of the deadline.
 */
function combineDueDateAndDueTime(taskDueDate: string, taskDueTime: string) {
    const dueDateTime = new Date(taskDueDate);
    const [hours, minutes, seconds, milliseconds] = taskDueTime.split(":");
    dueDateTime.setHours(
        hours ? parseInt(hours) : dueDateTime.getHours(),
        minutes ? parseInt(minutes) : dueDateTime.getMinutes(),
        seconds ? parseInt(seconds) : dueDateTime.getSeconds(),
        milliseconds ? parseInt(milliseconds) : dueDateTime.getMilliseconds()
    );
    return dueDateTime;
}
