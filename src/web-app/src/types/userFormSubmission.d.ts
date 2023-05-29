import { Submission } from "./submission";

export class UserFormSubmission extends Submission {
    _id: string;
    roles: string[];
    access: string[];
    data: {
        id: string;
    };
}
