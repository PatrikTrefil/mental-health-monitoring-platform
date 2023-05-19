import PaginatedList from "@/components/PaginatedList";
import WithAuth from "@/components/WithAuth";
import DynamicForm from "@/components/dynamicFormio/DynamicForm";
import { UserRoleTitles } from "@/redux/users";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";

export default WithAuth(
    <SpravaUzivatelu />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

function SpravaUzivatelu() {
    const queryClient = useQueryClient();
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showDeleteUserFailureModal, setShowDeleteUserFailureModal] =
        useState(false);

    const pageSize = 10;

    const fetchUsers = useCallback(
        async (page: number, currentTotalPages: number) => {
            const url = new URL(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/klientpacient/submission`
            );
            url.searchParams.set("limit", pageSize.toString());
            url.searchParams.set("skip", (page * pageSize).toString());

            const response = await fetch(url, {
                headers: new Headers({
                    "x-jwt-token": localStorage.getItem(
                        "formioToken"
                    ) as string,
                }),
            });
            const contentRangeParser =
                /(?<range>(?<rangeStart>[0-9]+)-(?<rangeEnd>[0-9]+)|\*)\/(?<size>[0-9]+)/;
            const match = response.headers
                .get("content-range")
                ?.match(contentRangeParser);

            if (!match) throw new Error("Invalid content-range header");

            const groups = match.groups as {
                range: string;
                rangeStart: string | undefined;
                rangeEnd: string | undefined;
                size: string;
            };
            const newTotalPages =
                groups.range === "*"
                    ? 0
                    : Math.ceil(parseInt(groups.size) / pageSize);

            return {
                data: (await response.json()) as UserFormSubmission[],
                hasMore:
                    groups.range === "*"
                        ? false
                        : parseInt(groups.rangeEnd!) <
                          parseInt(groups.size) - 1,
                totalPages: newTotalPages,
            };
        },
        []
    );

    const usersQueryName = "users";

    const deleteUser = useCallback(
        async (userSubmissionId: string, queryClient: QueryClient) => {
            const formiojs = await import("formiojs");
            const formio = new formiojs.Formio(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/klientpacient/submission/${userSubmissionId}`
            );
            try {
                await formio.deleteSubmission();
            } catch (e) {
                setShowDeleteUserFailureModal(true);
                return;
            }
            await queryClient.invalidateQueries([usersQueryName]);
        },
        [usersQueryName]
    );

    return (
        <>
            <Button as="a" href="./prehled">
                Zpět na přehled
            </Button>
            <Button onClick={() => setShowCreateUserModal(true)}>
                Založit účet nového pacienta/klienta
            </Button>
            <h2>Seznam pacientů/klientů</h2>
            <PaginatedList
                queryName={usersQueryName}
                fetchPage={fetchUsers}
                extractKey={(userSubmission: UserFormSubmission) =>
                    userSubmission._id
                }
                renderItem={(
                    userSubmission: UserFormSubmission,
                    queryClient: QueryClient
                ) => (
                    <>
                        <div>
                            ID: {userSubmission.data.id} (účet vytvořen:{" "}
                            {new Date(userSubmission.created).toLocaleString()})
                        </div>
                        <div>
                            <Button
                                variant="danger"
                                onClick={() =>
                                    deleteUser(userSubmission._id, queryClient)
                                }
                            >
                                Smazat
                            </Button>
                        </div>
                    </>
                )}
            />
            <Modal show={showCreateUserModal}>
                <Modal.Header>
                    <Modal.Title>
                        Založení nového účtu pro pacienta/klienta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DynamicForm
                        src="/klientpacient/register"
                        onSubmitDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries([usersQueryName]);
                        }}
                    />
                </Modal.Body>
            </Modal>
            <Modal show={showDeleteUserFailureModal}>
                <Modal.Header>
                    <Modal.Title>Smazání selhalo</Modal.Title>
                </Modal.Header>
                <Modal.Body>Smazání účtu selhalo.</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteUserFailureModal(false)}
                    >
                        Zavřít
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
