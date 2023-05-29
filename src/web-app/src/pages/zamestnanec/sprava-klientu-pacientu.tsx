import SimplePagination from "@/components/shared/SimplePagination";
import DynamicForm from "@/components/shared/dynamicFormio/DynamicForm";
import { CreateFormio } from "@/lib/formiojsWrapper";
import { UserFormSubmission } from "@/types/userFormSubmission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";

/**
 * Page for managing users.
 */
export default function SpravaUzivateluPage() {
    const queryClient = useQueryClient();

    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showDeleteUserFailureModal, setShowDeleteUserFailureModal] =
        useState(false);

    const pageSize = 10;
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const session = useSession();

    const fetchUsers = useCallback(
        async (page: number, currentTotalPages: number) => {
            const url = new URL(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission`
            );
            url.searchParams.set("limit", pageSize.toString());
            url.searchParams.set("skip", (page * pageSize).toString());

            if (!session.data?.user.formioToken)
                throw new Error("No token in session");

            const response = await fetch(url, {
                headers: new Headers({
                    "x-jwt-token": session.data.user.formioToken,
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

            if (newTotalPages !== currentTotalPages) {
                setTotalPages(newTotalPages);
            }

            return {
                users: (await response.json()) as UserFormSubmission[],
                hasMore:
                    groups.range === "*"
                        ? false
                        : parseInt(groups.rangeEnd!) <
                          parseInt(groups.size) - 1,
            };
        },
        [session.data?.user.formioToken]
    );

    const {
        isLoading,
        isError,
        error,
        data,
        isFetching,
        refetch,
        isPreviousData,
    } = useQuery({
        queryKey: ["users", pageIndex, totalPages],
        queryFn: () => fetchUsers(pageIndex, totalPages),
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken,
    });

    // Prefetch the next page!
    useEffect(() => {
        if (!isPreviousData && data?.hasMore) {
            queryClient.prefetchQuery({
                // eslint-disable-next-line @tanstack/query/exhaustive-deps
                queryKey: ["users", pageIndex + 1],
                queryFn: () => fetchUsers(pageIndex + 1, totalPages),
            });
        }
    }, [data, isPreviousData, pageIndex, queryClient, fetchUsers, totalPages]);

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );
    if (isError) {
        console.error(error);
        return (
            <Alert variant="danger">Načítání seznamu uživatelů selhalo.</Alert>
        );
    }

    const deleteUser = async (userSubmissionId: string) => {
        const formio = await CreateFormio(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}klientpacient/submission/${userSubmissionId}`
        );
        try {
            await formio.deleteSubmission({
                "x-jwt-token": session.data!.user.formioToken, // token won't be null, because the query is disabled when it is
            });
        } catch (e) {
            setShowDeleteUserFailureModal(true);
            return;
        }
        await queryClient.invalidateQueries(["users"]);
    };

    return (
        <>
            <Button as="a" href="./prehled">
                Zpět na přehled
            </Button>
            <Button onClick={() => setShowCreateUserModal(true)}>
                Založit účet nového pacienta/klienta
            </Button>
            <h2>Seznam pacientů/klientů</h2>
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                    onClick={() => {
                        refetch();
                    }}
                    className="mb-1"
                >
                    Aktualizovat
                </Button>
                {/* Since the last page's data potentially
                    sticks around between page requests, // we can use
                    `isFetching` to show a background loading // indicator since
                    our `status === 'loading'` state won't be triggered */}
                {isFetching ? (
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                ) : null}
            </div>
            <div className="d-flex flex-column align-items-center gap-2">
                <ul className="list-group w-100">
                    {data.users.map((userSubmission) => (
                        <li
                            className="list-group-item d-flex justify-content-between align-items-center"
                            key={userSubmission._id}
                        >
                            <div>
                                ID: {userSubmission.data.id} (účet vytvořen:{" "}
                                {new Date(
                                    userSubmission.created
                                ).toLocaleString()}
                                )
                            </div>
                            <div>
                                <Button
                                    variant="danger"
                                    onClick={() =>
                                        deleteUser(userSubmission._id)
                                    }
                                >
                                    Smazat
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
                <SimplePagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    setPageIndex={setPageIndex}
                />
            </div>
            <Modal show={showCreateUserModal}>
                <Modal.Header>
                    <Modal.Title>
                        Založení nového účtu pro pacienta/klienta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DynamicForm
                        src={`/klientpacient/register`}
                        onSubmitDone={() => {
                            setShowCreateUserModal(false);
                            queryClient.invalidateQueries(["users"]);
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
