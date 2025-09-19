import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AdminSignInDto } from "./dto/admin-sign-in.dto";
import { Response } from "express";
import { CookieGetter } from "../../common/decorators/cookie-getter.decorator";
import { RolesGuard } from "../../common/guards/role.guard";
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard";
import { Role } from "../../common/enum";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminSelfGuard } from "../../common/guards/admin-self.guard";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: "Admin sign in" })
  @ApiResponse({ status: 200, description: "Admin signed in successfully" })
  @ApiResponse({ status: 400, description: "Username or password incorrect" })
  @HttpCode(200)
  @Post("sign-in")
  adminSignIn(
    @Body() adminSignInDto: AdminSignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.adminService.adminSignIn(adminSignInDto, res);
  }

  @ApiOperation({ summary: "Admin sign out" })
  @ApiResponse({ status: 200, description: "Admin signed out successfully" })
  @ApiResponse({ status: 400, description: "Invalid refresh token" })
  @ApiResponse({ status: 401, description: "Token not found" })
  @HttpCode(200)
  @Post("sign-out")
  adminSignOut(
    @Res({ passthrough: true }) res: Response,
    @CookieGetter("refresh_token") refreshToken: string
  ) {
    return this.adminService.adminSignOut(refreshToken, res);
  }

  @HttpCode(200)
  @Post("refresh-token/:id")
  adminRefreshToken(
    @Res({ passthrough: true }) res: Response,
    @CookieGetter("refresh_token") refreshToken: string,
    @Param("id") id: string
  ) {
    return this.adminService.adminRefreshToken(+id, refreshToken, res);
  }

  @ApiOperation({ summary: "Add a new admin" })
  @ApiResponse({ status: 201, description: "Admin added successfully" })
  @ApiResponse({
    status: 409,
    description: "Admin with username [username] already exists",
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @ApiOperation({ summary: "Get all admins" })
  @ApiResponse({ status: 200, description: "All admins fetched successfully" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @ApiOperation({ summary: "Get a admin by id" })
  @ApiResponse({
    status: 200,
    description: "Admin with id [id] fetched successfully",
  })
  @ApiResponse({ status: 404, description: "Admin with id [id] not found" })
  @UseGuards(JwtAuthGuard, RolesGuard, AdminSelfGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminService.findOne(+id);
  }

  @ApiOperation({ summary: "Update a admin by id" })
  @ApiResponse({
    status: 200,
    description: "Admin with id [id] updated successfully",
  })
  @ApiResponse({ status: 200, description: "No changes applied" })
  @ApiResponse({
    status: 409,
    description: "Admin with username [username] already exists",
  })
  @ApiResponse({ status: 404, description: "Admin with id [id] not found" })
  @UseGuards(JwtAuthGuard, RolesGuard, AdminSelfGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @ApiOperation({ summary: "Delete a admin by id" })
  @ApiResponse({
    status: 200,
    description: "Admin with id [id] deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Admin with id [id] not found" })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminService.remove(+id);
  }
}
