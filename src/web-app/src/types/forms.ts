export type FormSchema = {
    name: string;
    title: string;
    path: string;
    created: string;
    submissionAccess: { type: string; roles: string[] }[];
    components: Component[];
};

export type Component = {
    [key: string]: unknown;
    label: string;
    key: string;
    type:
        | "button"
        | "checkbox"
        | "textarea"
        | "radio"
        | "selectboxes"
        | "number"
        | "textfield"
        | "hidden";
    values?: { label: string; value: string }[];
};

export type Form = FormSchema & {
    _id: string;
};
