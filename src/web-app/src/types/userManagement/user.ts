import { Submission } from "../formManagement/submission";
import { UserRoleTitle } from "./UserRoleTitle";

export interface User extends Submission {
    /**
     * IDs of the roles the user has.
     */
    roles: UserRoleTitle[];
    data: {
        id: string;
    };
}
