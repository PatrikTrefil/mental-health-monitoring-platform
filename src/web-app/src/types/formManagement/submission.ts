export interface Submission {
    /**
     * ID of the submission.
     */
    _id: string;
    /**
     * ID of the form to which this submission belongs.
     */
    form: string;
    /**
     * ID of the user who owns this submission.
     */
    owner: string;
    access: string[];
    data: {
        [key: string]: DataValue | undefined;
    };
    metadata: {
        [key: string]: unknown;
    };
    /**
     * ISO 8601 date string.
     */
    created: string;
}

export type DataValue =
    | undefined
    | null
    | number
    | string
    | boolean
    | SelectBoxDataValue;

export type SelectBoxDataValue = {
    [key: string]: boolean | undefined;
};

export interface AssigneeSubmission extends Submission {
    data: {
        taskId: string;
    } & Submission["data"];
}
