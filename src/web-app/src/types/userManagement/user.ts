import { Submission } from "../formManagement/submission";

export interface User extends Submission {
    /**
     * IDs of the roles the user has.
     */
    roles: string[];
    data: {
        id: string;
    };
}
