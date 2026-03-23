import { Request, Response, NextFunction } from "express";
import { ApiResponse, CurrentUserMiddleware, NotAuthorizedError } from "@tabletennisshop/common";
import { UserService } from "../services/user.service";
import { z } from "zod";

const SafeUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  full_name: z.string(),
  address: z.string(),
  createdAt: z.date()
});

export const currentUserController = 
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.currentUser || {};
        if (!email) {
            throw new NotAuthorizedError("Email is required");
        }
        const user = await UserService.findUserByLoginString(email);
        if (!user) {
            throw new NotAuthorizedError("User not found");
        }
        
        const response: ApiResponse = {
            success: true,
            statusCode: 200,
            data: {
                email: user.email,
                full_name: user.full_name,
                address: user.address,
                createdAt: user.createdAt
            }
        };

        res.send(response);
    };
