"use client";

import {
    assigneeQuery,
    assignerQuery,
    employeeQuery,
    formManagerQuery,
} from "@/client/queries/userManagement";
import { createUser } from "@/client/userManagementClient";
import UserRoleTitles from "@/constants/userRoleTitles";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

// These are the same as in the Formio form.
export const userDataSchema = z.object({
    id: z.string(),
    password: z
        .string()
        .refine((password) => password.length >= 8, {
            message: "Heslo musí mít alespoň 8 znaků.",
        })
        .refine((password) => /[0-9]/.test(password), {
            message: "Heslo musí obsahovat alespoň jedno číslo.",
        })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Heslo musí obsahovat alespoň jedno velké písmeno.",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Heslo musí obsahovat alespoň jedno malé písmeno.",
        }),
});

// Icons for showing/hiding password.
const eyeIconClassName = "bi-eye";
const eyeSlashIconClassName = "bi-eye-slash";

/**
 * Data to be submitted to the change password form.
 */
type FormInputs = z.infer<typeof userDataSchema>;

/**
 * Form for creating a user.
 * @param root0 - Props.
 * @param root0.onChangeDone - Callback to call when the password is changed.
 * @param root0.userRoleTitle - Title of the role to assign to the created user.
 */
export default function CreateUser({
    onChangeDone,
    userRoleTitle,
}: {
    /**
     * Callback to call when the password is changed.
     */
    onChangeDone?: () => void;
    userRoleTitle: UserRoleTitle;
}) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { data } = useSession();
    const queryClient = useQueryClient();

    const { mutate: createUserMutate, isLoading: isLoadingCreateUser } =
        useMutation({
            mutationFn: async ({
                userId,
                password: password,
            }: {
                userId: string;
                password: string;
            }) => {
                await createUser(
                    {
                        id: userId,
                        password,
                    },
                    userRoleTitle,
                    data?.user.formioToken!
                );
            },
            onMutate: ({ userId }) => {
                console.debug("Creating user...", { userId });
            },
            onSuccess: (_, { userId }) => {
                console.debug("Created user.", { userId });
                toast.success("Uživatel vytvořen");
                switch (userRoleTitle) {
                    case UserRoleTitles.ASSIGNER:
                        queryClient.invalidateQueries(assignerQuery.list._def);
                        queryClient.invalidateQueries(
                            employeeQuery.infiniteList._def
                        );
                        break;
                    case UserRoleTitles.FORM_MANAGER:
                        queryClient.invalidateQueries(
                            formManagerQuery.list._def
                        );
                        queryClient.invalidateQueries(
                            employeeQuery.infiniteList._def
                        );
                        break;
                    case UserRoleTitles.ASSIGNEE:
                        queryClient.invalidateQueries(assigneeQuery.list._def);
                        break;
                }
                onChangeDone?.();
            },
            onError: (e, { userId }) => {
                console.error("Failed to create user", {
                    userId,
                    error: e,
                });
                toast.error("Nepodařilo se vytvořit uživatele");
            },
        });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormInputs>({
        resolver: zodResolver(userDataSchema),
        mode: "onTouched",
    });

    const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
        createUserMutate({
            userId: formData.id,
            password: formData.password,
        });
        onChangeDone?.();
    };

    const onInvalidSubmit: SubmitErrorHandler<FormInputs> = (formData) => {
        console.debug("Invalid form data.", { formData });
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} noValidate>
            <Form.Label htmlFor="id">
                ID <i>(nelze změnit)</i>
            </Form.Label>
            <Form.Control type="text" id="id" {...register("id")} />
            <Form.Label htmlFor="password">Nové heslo</Form.Label>
            <InputGroup>
                <Form.Control
                    id="password"
                    {...register("password", {
                        required: true,
                    })}
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    isInvalid={!!errors.password}
                />
                <InputGroup.Text>
                    <i
                        className={`bi ${
                            isPasswordVisible
                                ? eyeSlashIconClassName
                                : eyeIconClassName
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={function togglePasswordVisibility() {
                            setIsPasswordVisible(!isPasswordVisible);
                        }}
                    ></i>
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                </Form.Control.Feedback>
            </InputGroup>
            <Button
                type="submit"
                disabled={isLoadingCreateUser}
                className="mt-2"
            >
                {isLoadingCreateUser ? "Odesílání" : "Vytvořit uživatele"}
            </Button>
        </Form>
    );
}
