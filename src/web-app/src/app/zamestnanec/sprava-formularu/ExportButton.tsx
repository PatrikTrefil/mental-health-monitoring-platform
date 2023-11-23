"use client";

import { exportFormSubmissions } from "@/client/formManagementClient";
import { Table } from "@tanstack/react-table";
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
    }>();

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
                            const { columnFilters } = table.getState();
                            let blob;
                            try {
                                blob = await exportFormSubmissions(formId, {
                                    token: token!,
                                    format: data.format,
                                    filters:
                                        data.useCurrentFilters &&
                                        columnFilters[0] !== undefined
                                            ? [
                                                  {
                                                      fieldPath:
                                                          columnFilters[0].id,
                                                      operation: "contains",
                                                      comparedValue:
                                                          columnFilters[0]
                                                              .value as string,
                                                  },
                                              ]
                                            : undefined,
                                });
                            } catch (e) {
                                console.error(e);
                                toast.error("Export dat selhal");
                                return;
                            }

                            saveAs(blob, `export.${data.format}`);

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
