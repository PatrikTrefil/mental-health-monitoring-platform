export class Submission {
    _id: string;
    form: string;
    owner: string;
    data: {
        taskId: string;
        [key: string]: unknown;
    };
    metadata: {
        [key: string]: unknown;
    };
    /**
     * ISO 8601 date string
     */
    created: string;
}
