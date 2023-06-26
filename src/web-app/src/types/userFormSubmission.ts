import { Submission } from "./submission";

export interface UserFormSubmission extends Submission {
    _id: string;
    roles: string[];
    access: string[];
    created: string;
    data: {
        id: string;
    } & Submission["data"];
}
