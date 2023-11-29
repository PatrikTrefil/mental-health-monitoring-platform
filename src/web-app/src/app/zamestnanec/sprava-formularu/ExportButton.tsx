"use client";

import { trpc } from "@/client/trpcClient";
import { AppRouter } from "@/server/routers/root";
import { Table } from "@tanstack/react-table";
import { inferProcedureOutput } from "@trpc/server";
import saveAs from "file-saver";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

/**
 * Button for exporting a form submissions as CSV. On failure, an error modal is shown.
 * @param root0 - Props for the component.
 * @param root0.formId - Form ID of the form to export.
 * @param root0.table - Table instance for which to export the results.
 */
export default function ExportButton<TTable>({
    formId,
    table,
}: ExportButtonProps<TTable>) {
    const session = useSession();
    const token = session.data?.user.formioToken;

    const [showModal, setShowModal] = useState(false);
    const { register, handleSubmit } = useForm<{
        format: "csv" | "json";
        useCurrentFilters: boolean;
        useCurrentSort: boolean;
    }>();

    const utils = trpc.useContext();

    return (
        <>
            <Button onClick={() => setShowModal(true)} disabled={!token}>
                <i
                    className="bi bi-download"
                    style={{ marginRight: "5px" }}
                ></i>
                Export dat
            </Button>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Export dat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={handleSubmit(async (data) => {
                            const { columnFilters, sorting } = table.getState();
                            let exportedData: inferProcedureOutput<
                                AppRouter["formResults"]["getFormResults"]
                            >;
                            try {
                                exportedData =
                                    await utils.formResults.getFormResults.fetch(
                                        {
                                            formId: formId,
                                            filter:
                                                data.useCurrentFilters &&
                                                columnFilters[0] !== undefined
                                                    ? {
                                                          fieldPath:
                                                              columnFilters[0]
                                                                  .id,
                                                          operation: "contains",
                                                          comparedValue:
                                                              columnFilters[0]
                                                                  .value as string,
                                                      }
                                                    : undefined,
                                            sort:
                                                data.useCurrentSort &&
                                                sorting[0] !== undefined
                                                    ? {
                                                          field: sorting[0].id,
                                                          order: sorting[0].desc
                                                              ? "desc"
                                                              : "asc",
                                                      }
                                                    : undefined,
                                        }
                                    );
                            } catch (e) {
                                console.error(e);
                                toast.error("Export dat selhal");
                                return;
                            }
                            let blobToExport: Blob;
                            let fileExtension: string;
                            switch (data.format) {
                                case "json":
                                    blobToExport = new Blob(
                                        [JSON.stringify(exportedData.data)],
                                        {
                                            type: "application/json",
                                        }
                                    );
                                    fileExtension = "json";
                                    break;
                                case "csv":
                                    const papaparse = await import("papaparse");
                                    const csv = papaparse.unparse(
                                        exportedData.data.map((o) =>
                                            deepFlattenToObject(o)
                                        )
                                    );
                                    blobToExport = new Blob([csv], {
                                        type: "text/csv",
                                    });
                                    fileExtension = "csv";
                                    break;
                            }

                            saveAs(blobToExport, `export.${fileExtension}`);

                            setShowModal(false);
                        })}
                    >
                        <Form.Group controlId="format">
                            <Form.Label>Formát</Form.Label>
                            <Form.Select
                                defaultValue="csv"
                                {...register("format")}
                            >
                                <option value="csv">CSV</option>
                                <option value="json">JSON</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Check
                            {...register("useCurrentFilters")}
                            className="my-3"
                            defaultChecked
                            label="Použít aktuálně nastavené filtry tabulky"
                        />
                        <Form.Check
                            {...register("useCurrentSort")}
                            className="my-3"
                            defaultChecked
                            label="Použít aktuálně nastavené řazení tabulky"
                        />
                        <div className="d-grid gap-2">
                            <Button type="submit">Uložit soubor</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

/**
 * Props for {@link ExportButton}.
 */
export interface ExportButtonProps<TTable> {
    /**
     * Form ID of the form to export.
     */
    formId: string;
    table: Table<TTable>;
}

/**
 * Make a nested object flat.
 * @param val - Value to flatten.
 * @param prefix - Prefix to prepend to the keys of the flattened object. Used for recursion.
 */
function deepFlattenToObject<T>(val: T, prefix = "") {
    if (typeof val !== "object" || val === null) return val;

    const separator = "_";

    return Object.keys(val).reduce((acc: Record<string, unknown>, k) => {
        const pre = prefix.length ? prefix + separator : "";

        if (typeof val[k as keyof T] === "object" && val[k as keyof T] !== null)
            Object.assign(acc, deepFlattenToObject(val[k as keyof T], pre + k));
        else acc[pre + k] = val[k as keyof T];

        return acc;
    }, {});
}
