import WithAuth from "@/components/WithAuth";
import DynamicFormBuilder from "@/components/dynamicFormio/DynamicFormBuilder";
import DynamicFormEdit from "@/components/dynamicFormio/DynamicFormEdit";
import { useAppSelector } from "@/redux/hooks";
import { roleIdSelector } from "@/redux/selectors";
import { UserRoleTitles } from "@/redux/users";
import { useRouter } from "next/router";
import { useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";

export default WithAuth(
    <CreateFormPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

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
function CreateFormPage() {
    const [creationStatus, setCreationStatus] = useState(
        CreationStatus.NOT_SUBMITTED
    );
    const klientPacientRoleId = useAppSelector(
        roleIdSelector(UserRoleTitles.KLIENT_PACIENT)
    );
    const zamestnanecRoleId = useAppSelector(
        roleIdSelector(UserRoleTitles.ZAMESTNANEC)
    );
    const router = useRouter();

    if (!klientPacientRoleId || !zamestnanecRoleId)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );
    else
        return (
            <>
                <DynamicFormEdit
                    saveText="Vytvořit formulář"
                    saveForm={async (formSchema: any) => {
                        const { Formio } = await import("formiojs");

                        const client = new Formio(
                            process.env.NEXT_PUBLIC_FORMIO_BASE_URL
                        );
                        try {
                            await client.saveForm(formSchema);
                        } catch (e) {
                            setCreationStatus(CreationStatus.CREATION_FAILED);
                            return;
                        }
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
