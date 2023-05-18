import { UserRoleTitle } from "./users";

/**
 * Selector for getting id of role with given title
 * @param roleTitle title of role to be selected
 * @returns id of the role with the given title
 */
export function roleIdSelector(roleTitle: UserRoleTitle) {
    return (state: any) => {
        const roles = state?.auth?.roles;
        const roleWithGivenTitle = (
            Object.values(roles) as {
                title: UserRoleTitle;
                _id: string;
            }[]
        ).find((role) => {
            return roleTitle.includes(role.title);
        });

        return roleWithGivenTitle?._id;
    };
}
