import type { Request, Response } from "express";
import { ProfileService } from "../application/profile.service";
import { canViewOthersProfile } from "../domain/profile-visibility";
import {
  Role,
  ALL_ROLES,
  parseStoredRoles,
  type RoleValue,
} from "../domain/role";
import { isUuid } from "../uuid";

export class ProfileController {
  public service = new ProfileService();

  async getMe(req: Request, res: Response) {
    try {
      const profile = await this.service.getProfile(req.user!.userId);
      res.json(profile || { message: "Profile not found" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  /**
   * Профиль по userId с учётом ролей:
   * ADMIN — любой; EXECUTOR ↔ CUSTOMER — друг друга; чужой ADMIN — только ADMIN.
   */
  async getProfileByUserId(req: Request, res: Response) {
    try {
      const raw = req.params.userId;
      const requestedNum = Number(Array.isArray(raw) ? raw[0] : raw);

      if (!Number.isFinite(requestedNum) || requestedNum <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "userId must be a positive integer",
        });
      }

      await this.sendProfileIfAllowed(req, res, requestedNum);
    } catch (err: unknown) {
      console.error("Error in GET /user/:userId:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({
        error: "Internal Server Error",
        message,
      });
    }
  }

  async getProfileByIdOrMe(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.userId;

      if (currentUserId === undefined) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
      }

      const requestedParam = req.params.userId;

      if (requestedParam === "me") {
        const profile = await this.service.getProfile(currentUserId);
        return res.json(profile || { message: "Profile not found" });
      }

      const requestedNum = Number(requestedParam);

      if (!Number.isFinite(requestedNum) || requestedNum <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: 'User ID must be a positive number or "me"',
        });
      }

      await this.sendProfileIfAllowed(req, res, requestedNum);
    } catch (err: unknown) {
      console.error("Error in /by-id/:userId:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({
        error: "Internal Server Error",
        message,
      });
    }
  }

  /** Общая логика: свой профиль или проверка canViewOthersProfile. */
  private async sendProfileIfAllowed(
    req: Request,
    res: Response,
    targetUserId: number,
  ): Promise<void> {
    const currentUserId = req.user?.userId;

    if (currentUserId === undefined) {
      res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
      return;
    }

    const profile = await this.service.getProfile(targetUserId);
    if (!profile) {
      res.status(404).json({
        error: "Not Found",
        message: "Profile not found",
      });
      return;
    }

    if (targetUserId === currentUserId) {
      res.json(profile);
      return;
    }

    const targetRoles = parseStoredRoles(profile.roles);
    if (!canViewOthersProfile(req.user!.roles, targetRoles)) {
      res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view this profile",
      });
      return;
    }

    res.json(profile);
  }

  async getUserIdByUsername(req: Request, res: Response) {
    try {
      const username = Array.isArray(req.params.username)
        ? req.params.username[0]
        : req.params.username;
      if (!username) {
        return res.status(400).json({
          error: "Bad Request",
          message: "username is required",
        });
      }
      const userId = await this.service.getUserIdByUsername(username);

      if (!userId) {
        return res.status(404).json({
          error: "Not found",
          message: "UserId not found",
        });
      }
      res.json({
        success: true,
        userId,
        username,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({
        error: "Server Error",
        message,
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const rawId = req.body?.userId;
      const userId =
        typeof rawId === "number" ? rawId : parseInt(String(rawId ?? ""), 10);
      if (!Number.isFinite(userId) || userId <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "userId must be a positive number",
        });
      }

      const rawUuid = req.body?.userUuid;
      let userUuid: string | undefined;
      if (rawUuid !== undefined && rawUuid !== null) {
        const s =
          typeof rawUuid === "string" ? rawUuid.trim() : String(rawUuid).trim();
        if (s !== "") {
          if (!isUuid(s)) {
            return res.status(400).json({
              error: "Bad Request",
              message: "userUuid must be a valid UUID if provided",
            });
          }
          userUuid = s;
        }
      }

      const createData: {
        userUuid?: string;
        username?: string;
        email?: string;
        fullName?: string;
      } = {};
      if (userUuid !== undefined) {
        createData.userUuid = userUuid;
      }
      if (typeof req.body?.username === "string") {
        createData.username = req.body.username;
      }
      if (typeof req.body?.email === "string") {
        createData.email = req.body.email;
      }
      if (typeof req.body?.fullName === "string") {
        createData.fullName = req.body.fullName;
      }

      const profile = await this.service.createProfile(userId, createData);
      res.json(profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  async connectTelegram(req: Request, res: Response) {
    try {
      const raw = req.body?.telegramId ?? req.body?.telegramID;
      if (raw === undefined || raw === null) {
        return res.status(400).json({
          error: "Bad Request",
          message: "telegramId is required",
        });
      }
      const telegramId = parseInt(String(raw), 10);
      if (isNaN(telegramId) || telegramId <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "telegramId must be a positive number",
        });
      }
      const profile = await this.service.connectTelegram(
        req.user!.userId,
        telegramId,
      );
      res.json(profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (userId === undefined) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "User not authenticated",
        });
      }

      const updateData = req.body as Record<string, unknown>;

      const allowedFields = [
        "username",
        "email",
        "fullName",
        "bio",
        "avatarUrl",
        "location",
        "specialization",
        "stack",
        "experienceLevel",
        "status",
        "telegramId",
      ] as const;

      const filteredData: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          filteredData[field] = updateData[field];
        }
      }

      const validationErrors: string[] = [];

      if (
        filteredData.email &&
        typeof filteredData.email === "string" &&
        !this.isValidEmail(filteredData.email)
      ) {
        validationErrors.push("Invalid email format");
      }

      if (
        filteredData.experienceLevel &&
        typeof filteredData.experienceLevel === "string" &&
        !["JUNIOR", "MIDDLE", "SENIOR", "LEAD"].includes(
          filteredData.experienceLevel,
        )
      ) {
        validationErrors.push(
          "experienceLevel must be JUNIOR, MIDDLE, SENIOR or LEAD",
        );
      }

      if (
        filteredData.status &&
        typeof filteredData.status === "string" &&
        !["ACTIVE", "INACTIVE", "BANNED", "BUSY"].includes(filteredData.status)
      ) {
        validationErrors.push(
          "status must be ACTIVE, INACTIVE, BANNED or BUSY",
        );
      }

      if (filteredData.telegramId !== undefined) {
        const telegramId = parseInt(String(filteredData.telegramId), 10);
        if (isNaN(telegramId) || telegramId <= 0) {
          validationErrors.push("telegramId must be a positive number");
        } else {
          filteredData.telegramId = telegramId;
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: "Validation Error",
          messages: validationErrors,
        });
      }

      const updatedProfile = await this.service.updateProfile(
        userId,
        filteredData,
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error: unknown) {
      console.error("Error updating profile:", error);

      const err = error as { code?: string; meta?: { target?: string[] } };

      if (err.code === "P2002") {
        const field = err.meta?.target?.[0] || "field";
        return res.status(409).json({
          error: "Conflict",
          message: `${field} already exists`,
        });
      }

      if (err.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Profile not found",
        });
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update profile",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      });
    }
  }

  /** Смена ролей по userId — только у пользователя с ролью ADMIN. */
  async setRolesByUserId(req: Request, res: Response) {
    try {
      if (!req.user?.roles.includes(Role.ADMIN)) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only ADMIN can change roles",
        });
      }

      const raw = req.params.userId;
      const userId = parseInt(
        Array.isArray(raw) ? (raw[0] ?? "") : String(raw ?? ""),
        10,
      );
      if (!Number.isFinite(userId) || userId <= 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "userId must be a positive integer",
        });
      }

      const body = req.body as { roles?: unknown };
      if (!Array.isArray(body.roles) || body.roles.length === 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: "body.roles must be a non-empty array of role strings",
        });
      }

      const allowed = new Set<string>(ALL_ROLES);
      const roles: RoleValue[] = [];
      for (const item of body.roles) {
        const key =
          typeof item === "string"
            ? item.trim().toUpperCase()
            : String(item).toUpperCase();
        if (!allowed.has(key)) {
          return res.status(400).json({
            error: "Bad Request",
            message: `Unknown role: ${String(item)}`,
          });
        }
        roles.push(key as RoleValue);
      }

      const unique = [...new Set(roles)];
      const profile = await this.service.updateRolesByUserId(userId, unique);

      res.json({
        success: true,
        message: "Roles updated",
        profile,
      });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "P2025") {
        return res.status(404).json({
          error: "Not Found",
          message: "Profile not found",
        });
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
