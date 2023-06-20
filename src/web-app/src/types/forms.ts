export type FormSchema = {
    name: string;
    path: string;
    created: string;
    submissionAccess: { type: string; roles: string[] }[];
    components: { [key: string]: unknown }[];
};

export type Form = FormSchema & {
    _id: string;
};
