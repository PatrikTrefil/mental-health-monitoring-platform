abstract class Action<TSettings> {
    name: string;
    title: string;
    handler: ("after" | "before")[];
    method: ("create" | "updated" | "delete")[];
    settings: TSettings;
}

class WebhookActionSettings {
    /**
     * If true, the request will be blocked until the webhook returns.
     */
    block: boolean;
    /**
     * The URL to POST the webhook request to.
     */
    url: string;
    /**
     * If true, the JWT token will be used as a header for the request.
     */
    forwardToken: boolean;
}

export class WebhookAction extends Action<WebhookActionSettings> {}
