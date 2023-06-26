/**
 * User role string constants
 */
export const UserRoleTitles = {
    ADMIN: "Administrator",
    KLIENT_PACIENT: "Klient/Pacient",
    SPRAVCE_DOTAZNIKU: "Správce dotazníků",
    ZADAVATEL_DOTAZNIKU: "Zadavatel dotazníků",
    AUTHENTICATED: "Authenticated",
} as const;

export type UserRoleTitle =
    (typeof UserRoleTitles)[keyof typeof UserRoleTitles];

export const UserRolePrefixes = {
    SPRAVCE_DOTAZNIKU: "SD",
    ZADAVATEL_DOTAZNIKU: "ZD",
} as const;

export type User = {
    _id: string;
    form: string;
    owner: string;
    /**
     * Role IDs
     */
    roles: string[];
    data: {
        id: string;
    };
    access: unknown[];
    externalIds: unknown[];
    created: string;
    modified: string;
};
