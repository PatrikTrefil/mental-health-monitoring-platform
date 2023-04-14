/**
 * User role string constants
 */
export const UserRoleTitles = {
    ADMIN: "Administrator",
    KLIENT_PACIENT: "Klient/Pacient",
    ZAMESTNANEC: "Zamestnanec",
} as const;

export type UserRoleTitle =
    (typeof UserRoleTitles)[keyof typeof UserRoleTitles];

export type User = {
    _id: string;
    form: string;
    owner: string;
    roles: UserRoleTitle[];
    data: {
        id: string;
    };
    access: unknown[];
    externalIds: unknown[];
    created: string;
    modified: string;
};
