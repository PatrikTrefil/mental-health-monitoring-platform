import { Form } from "@/types/form";
import { QueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import PaginatedList from "./PaginatedList";

/**
 * List of forms which are filtered and shown using FormLine.
 */
export function FormList({ filterOptions, FormLine }: FormListProps) {
    const pageSize = 10;

    const fetchForms = useCallback(
        async (page: number, currentTotalPages: number) => {
            const url = new URL(
                process.env.NEXT_PUBLIC_FORMIO_BASE_URL + "/form/"
            );
            url.searchParams.set("limit", pageSize.toString());
            url.searchParams.set("skip", (page * pageSize).toString());
            url.searchParams.set("type", "form");
            for (const [key, value] of Object.entries(filterOptions)) {
                url.searchParams.set(key, value);
            }

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

            const forms = (await response.json()) as Form[];
            return {
                data: forms,
                hasMore:
                    groups.range === "*"
                        ? false
                        : parseInt(groups.rangeEnd!) <
                          parseInt(groups.size) - 1,
                totalPages: newTotalPages,
            };
        },
        [filterOptions]
    );

    const formsQueryName = "forms";

    const deleteForm = useCallback(
        async (form: Form, queryClient: QueryClient) => {
            const { Formio } = await import("formiojs");
            const formio = new Formio(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/${form.path}`
            );
            await formio.deleteForm();
            await queryClient.invalidateQueries([formsQueryName]);
        },
        [formsQueryName]
    );

    return (
        <PaginatedList
            queryName={formsQueryName}
            fetchPage={fetchForms}
            extractKey={(item) => item._id}
            renderItem={(form: Form, queryClient: QueryClient) => (
                <FormLine
                    form={form}
                    deleteForm={() => deleteForm(form, queryClient)}
                />
            )}
        />
    );
}

/**
 * Props of a component, which is used to show a list item of a form.
 * This component is used in {@link FormList}.
 */
export interface FormLineProps {
    /**
     * Form to show.
     */
    form: Form;
    /**
     * Delete the form that is beign shown.
     */
    deleteForm: () => Promise<void>;
}

/**
 * Props for {@link FormList}
 */
export interface FormListProps {
    /**
     * Filter options for the form query. @see https://apidocs.form.io/#a39be766-02dd-0b95-49bd-971fcef25a32
     **/
    filterOptions: { [key: string]: string };
    /**
     * Component to show for each form.
     */
    FormLine: React.ComponentType<FormLineProps>;
}
