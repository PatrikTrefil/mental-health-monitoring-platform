import DynamicFormBuilder from "@/components/shared/formio/DynamicFormBuilder";
import DynamicFormEdit from "@/components/shared/formio/DynamicFormEdit";
import { Role } from "@/types/role";
import { UserRoleTitles } from "@/types/users";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import {
    Alert,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";

/**
 * Status of form creation
 */
enum CreationStatus {
    /**
     * User has not attempted to save form yet (or has reset the status)
     */
    NOT_SUBMITTED,
    /**
     * User has attempted to save form, but saving failed.
     */
    CREATION_FAILED,
    /**
     * User has attempted to save form, and saving succeeded.
     */
    CREATION_SUCCEEDED,
}
/**
 * Page for creating a form.
 */
export default function CreateFormPage() {
    const [creationStatus, setCreationStatus] = useState(
        CreationStatus.NOT_SUBMITTED
    );
    const session = useSession();
    const fetchRoles = async () => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}role`,
            {
                headers: {
                    "x-jwt-token": session.data!.user.formioToken, // token won't be null, because the query is disabled when it is
                },
            }
        );
        const roles = (await response.json()) as Role[];
        return roles;
    };
    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["roles"],
        queryFn: fetchRoles,
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });
    const router = useRouter();
    const errorResult = <Alert variant="danger">Načítání rolí selhalo.</Alert>;

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );
    else if (isError) {
        console.error(error);
        return errorResult;
    } else {
        const klientPacientRoleId = data?.find(
            (role) => role.title === UserRoleTitles.KLIENT_PACIENT
        )?._id;
        const zamestnanecRoleId = data?.find(
            (role) => role.title === UserRoleTitles.ZAMESTNANEC
        )?._id;
        if (!klientPacientRoleId || !zamestnanecRoleId) return errorResult;

        return (
            <>
                <DynamicFormEdit
                    saveText="Vytvořit formulář"
                    saveForm={async (formSchema: unknown) => {
                        const response = await fetch(
                            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/form`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "x-jwt-token":
                                        session.data!.user.formioToken,
                                },
                                body: JSON.stringify(formSchema),
                            }
                        );

                        if (!response.ok)
                            setCreationStatus(CreationStatus.CREATION_FAILED);

                        setCreationStatus(CreationStatus.CREATION_SUCCEEDED);
                    }}
                    // Make clients/patients able to fill out the form
                    // and make the employees able to see their submissions
                    form={{
                        access: [
                            {
                                type: "read_all",
                                roles: [zamestnanecRoleId, klientPacientRoleId],
                            },
                        ],
                        submissionAccess: [
                            {
                                type: "create_own",
                                roles: [klientPacientRoleId],
                            },
                        ],
                        tags: ["klientPacient"],
                    }}
                >
                    <DynamicFormBuilder />
                </DynamicFormEdit>
                <Modal show={creationStatus === CreationStatus.CREATION_FAILED}>
                    <ModalHeader>
                        <ModalTitle>Vytvoření selhalo</ModalTitle>
                    </ModalHeader>
                    <ModalBody>Odeslání nového formuláře selhalo</ModalBody>
                    <ModalFooter>
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setCreationStatus(CreationStatus.NOT_SUBMITTED)
                            }
                        >
                            Zavřít
                        </Button>
                    </ModalFooter>
                </Modal>
                <Modal
                    show={creationStatus === CreationStatus.CREATION_SUCCEEDED}
                >
                    <ModalHeader>
                        <ModalTitle>Formulář vytvořen</ModalTitle>
                    </ModalHeader>
                    <ModalBody>Formulář byl úspěšně vytvořen.</ModalBody>
                    <ModalFooter>
                        <Button
                            variant="secondary"
                            onClick={() => router.push("/zamestnanec/prehled")}
                        >
                            Zavřít
                        </Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}
