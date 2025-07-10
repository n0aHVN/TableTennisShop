import { Request, Response, NextFunction } from "express";

export const signoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session = null;
    res.status(200).send({ message: "Successfully signed out" });
  } catch (err) {
    next(err);
  }
};
