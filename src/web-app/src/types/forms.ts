export type FormSchema = {
    name: string;
    title: string;
    path: string;
    created: string;
    submissionAccess: { type: string; roles: string[] }[];
    components: Component[];
};

export type Component = StringResultComponent | SelectBoxesComponent;

type ComponentBase = {
    label: string;
    key: string;
};

type StringResultComponent = ComponentBase & {
    type:
        | "button"
        | "checkbox"
        | "textarea"
        | "radio"
        | "number"
        | "textfield"
        | "hidden";
};

type SelectBoxesComponent = ComponentBase & {
    type: "selectboxes";
    values: { label: string; value: string }[];
};

export type Form = FormSchema & {
    _id: string;
};
