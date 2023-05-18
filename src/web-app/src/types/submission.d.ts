export class Submission {
    _id: string;
    form: string;
    owner: string;
    data: unknown;
    /**
     * ISO 8601 date string
     */
    created: string;
}
