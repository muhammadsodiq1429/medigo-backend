import { Injectable } from "@nestjs/common";
import { IPayload } from "../common/types";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(payload: IPayload, res: Response) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    res.cookie("refresh_token", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
      secure: true,
    });

    return { accessToken, refreshToken };
  }
}
