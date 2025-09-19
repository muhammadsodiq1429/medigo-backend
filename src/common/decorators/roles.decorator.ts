import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../const";

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
