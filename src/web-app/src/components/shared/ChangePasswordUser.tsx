"use client";

import { updateUser } from "@/client/userManagementClient";
import { UserRoleTitle } from "@/types/userManagement/UserRoleTitle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SignInResponse, signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { userDataSchema } from "./CreateUser";

// Icons for showing/hiding password.
const eyeIconClassName = "bi-eye";
const eyeSlashIconClassName = "bi-eye-slash";

/**
 * Data to be submitted to the change password form.
 */
type FormInputs = z.infer<typeof userDataSchema>;

/**
 * Form for changing password of a user.
 */
export default function ChangePasswordUser({
    userId,
    submissionId,
    onChangeDone,
    userRoleTitle,
    isIDFieldShowing = true,
}: {
    /**
     * ID of the user to change password for.
     */
    userId: string;
    /**
     * ID of the submission of the user to change password for.
     */
    submissionId: string;
    /**
     * Callback to call when the password is changed.
     */
    onChangeDone?: () => void;
    userRoleTitle: UserRoleTitle;
    isIDFieldShowing?: boolean;
}) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { data } = useSession();

    const { mutate: updateUserMutate, isLoading: isLoadingUpdateUser } =
        useMutation({
            mutationFn: async ({
                submissionId,
                userId,
                newPassword,
            }: {
                submissionId: string;
                userId: string;
                newPassword: string;
            }) => {
                await updateUser(
                    submissionId,
                    { id: userId, password: newPassword },
                    userRoleTitle,
                    data?.user.formioToken!
                );
            },
            onMutate: ({ userId }) => {
                console.debug("Changing password for user...", { userId });
            },
            onSuccess: (_, { userId }) => {
                console.debug("User password changed.", { userId });
                toast.success("Heslo úspěšně změněno.");
                onChangeDone?.();
            },
            onError: (e, { userId }) => {
                console.error("Failed to change password for user", {
                    userId,
                    error: e,
                });
                toast.error("Nepodařilo se změnit heslo.");
            },
        });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormInputs>({
        resolver: zodResolver(userDataSchema),
        mode: "onTouched",
        defaultValues: {
            id: userId,
        },
    });

    const { mutate: loginMutation } = useMutation({
        mutationFn: async ({
            id,
            password,
        }: {
            id: string;
            password: string;
        }) => {
            const result = await signIn("credentials", {
                ID: id,
                password,
                redirect: false,
            });
            if (result?.error) throw result.error;
        },
        onMutate: ({ id }) => {
            console.debug("Signing in after password change...", { id });
        },
        onSuccess: (_, { id }) => {
            console.debug("Signed in after password change.", { id });
        },
        onError: (e: SignInResponse["error"] & { error: string }) => {
            console.error("Failed to sign in after password change", e);
            toast.error(
                "Nepodařilo se přihlásit po změně hesla. Musíte se znovu přihlásit"
            );
            signOut();
        },
    });

    const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
        updateUserMutate({
            submissionId,
            userId: formData.id,
            newPassword: formData.password,
        });
        loginMutation({
            id: formData.id,
            password: formData.password,
        });
        onChangeDone?.();
    };

    const onInvalidSubmit: SubmitErrorHandler<FormInputs> = (formData) => {
        console.debug("Invalid form data.", { formData });
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} noValidate>
            <Form.Label hidden={!isIDFieldShowing} htmlFor="id">
                ID <i>(nelze změnit)</i>
            </Form.Label>
            <Form.Control
                type="text"
                id="id"
                {...register("id")}
                disabled
                hidden={!isIDFieldShowing}
            />
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
                disabled={isLoadingUpdateUser}
                className="mt-2"
            >
                {isLoadingUpdateUser ? "Odesílání" : "Změnit heslo"}
            </Button>
        </Form>
    );
}
