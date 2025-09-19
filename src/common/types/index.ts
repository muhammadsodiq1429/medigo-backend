import { Request } from "express";
import { Role } from "../enum";

export interface IPayload {
  id: number;
  role: Role;
  login: string;
  isActive: boolean;
}

export type IRequest = Request & { user: IPayload };
