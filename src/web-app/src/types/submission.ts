export interface Submission {
    _id: string;
    form: string;
    owner: string;
    data: {
        [key: string]: DataValue | undefined;
    };
    metadata: {
        [key: string]: unknown;
    };
    /**
     * ISO 8601 date string
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

export interface ClientPatientSubmission extends Submission {
    data: {
        taskId: string;
    } & Submission["data"];
}
