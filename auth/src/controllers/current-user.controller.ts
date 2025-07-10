import { Request, Response, NextFunction } from "express";
import { CurrentUserMiddleware, NotAuthorizedError } from "@tabletennisshop/common";
import { UserService } from "../services/user.service";
import { z } from "zod";

const SafeUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  full_name: z.string(),
  addresses: z.array(
    z.object({
      province: z.string(),
      district: z.string(),
      ward: z.string(),
      address: z.string(),
      phone_number: z.string()
    })
  ),
  createdAt: z.date()
});

export const currentUserController = [
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.currentUser || {};
        if (!email) {
            throw new NotAuthorizedError("auth.currentUser.notAuthorized");
        }
        const user = await UserService.findUserByLoginString(email);
        if (!user) {
            throw new NotAuthorizedError("auth.currentUser.notAuthorized");
        }
        const result = SafeUserSchema.safeParse(user);
        if (!result.success) {
            const errorString = result.error.issues
                .map(e => `${e.path.join('.')}: ${e.message}`)
                .join('\n');
            throw new Error(errorString);
        }
        res.status(200).send(result.data);
    }
];
