import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { IRequest } from "../types";
import { Role } from "../enum";

@Injectable()
export class AdminSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: IRequest = context.switchToHttp().getRequest();
    const user = req.user;

    const resourceId = req.params.id;

    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    if (!resourceId) {
      return true;
    }

    if (user.id !== Number(resourceId)) {
      throw new ForbiddenException("You can only access your own data.");
    }

    return true;
  }
}
