import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../const";
import { IRequest } from "../types";
import { Role } from "../enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req: IRequest = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const user = req.user;
    if (!user) {
      throw new ForbiddenException(
        "Authentication failed, user data not found."
      );
    }

    const userRole = user.role;
    if (!userRole) {
      throw new ForbiddenException("User role is missing.");
    }

    if (userRole === Role.SUPERADMIN) {
      return true;
    }

    const hasAccess = requiredRoles.includes(userRole);

    if (!hasAccess) {
      throw new ForbiddenException("Forbidden user. Insufficient privileges.");
    }
    return true;
  }
}
