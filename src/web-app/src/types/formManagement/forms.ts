import { DataValue } from "./submission";

export type FormSchema = {
    name: string;
    title: string;
    path: string;
    created: string;
    submissionAccess: { type: string; roles: string[] }[];
    components: Component[];
};

export type Component =
    | StringResultComponent
    | SelectBoxesComponent
    | HiddenComponent
    | ButtonComponent;

export type ComponentBase = {
    label: string;
    key: string;
    defaultValue?: DataValue;
    disabled: boolean;
};

export type HiddenComponent = ComponentBase & {
    input: boolean;
    tableView: boolean;
    protected: boolean;
    unique: boolean;
    persistent: boolean;
    type: "hidden";
    tags: string[];
    conditional: {
        show: string;
        when: unknown;
        eq: string;
    };
    properties: object;
    isNew: boolean;
    lockKey: boolean;
};

export type ButtonComponent = ComponentBase & {
    type: "button";
    action: "saveState" | "submit";
    theme: "primary" | "secondary" | "success" | "info" | "warning" | "danger";
    leftIcon: string;
};

export type StringResultComponent = ComponentBase & {
    type: "checkbox" | "textarea" | "radio" | "number" | "textfield";
};

export type SelectBoxesComponent = ComponentBase & {
    type: "selectboxes";
    values: { label: string; value: string }[];
};

export type Form = FormSchema & {
    _id: string;
};
