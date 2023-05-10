export class Form {
    _id: string;
    name: string;
    path: string;
    submissionAccess: { type: string; roles: string[] }[];
}
