export class Form {
    _id: string;
    name: string;
    path: string;
    created: string;
    submissionAccess: { type: string; roles: string[] }[];
}
