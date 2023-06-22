export type Submission = {
    _id: string;
    form: string;
    owner: string;
    data: {
        [key: string]: DataValue | undefined;
        taskId: string;
    };
    metadata: {
        [key: string]: unknown;
    };
    /**
     * ISO 8601 date string
     */
    created: string;
};

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
