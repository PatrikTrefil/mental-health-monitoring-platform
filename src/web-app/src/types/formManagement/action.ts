/**
 * An action that is executed when a submission is create/deleted/udpated in the
 * form management system.
 */
export interface Action<TSettings> {
    /**
     * The name of the action.
     */
    name: string;
    /**
     * The title of the action (displayed in the UI).
     */
    title: string;
    /**
     * When the action should be executed.
     */
    handler: ("after" | "before")[];
    /**
     * Which methods should trigger the action.
     */
    method: ("create" | "updated" | "delete")[];
    /**
     * The settings for the action.
     */
    settings: TSettings;
}

export interface WebhookActionSettings {
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

export interface WebhookAction extends Action<WebhookActionSettings> {}
