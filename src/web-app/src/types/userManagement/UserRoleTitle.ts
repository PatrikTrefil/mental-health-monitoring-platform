import UserRoleTitles from "@/constants/userRoleTitles";

export type UserRoleTitle =
    (typeof UserRoleTitles)[keyof typeof UserRoleTitles];
