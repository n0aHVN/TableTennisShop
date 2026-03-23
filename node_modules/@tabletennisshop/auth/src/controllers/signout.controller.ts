import { ApiResponse } from "@tabletennisshop/common";
import { Request, Response, NextFunction } from "express";

export const signoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session = null;
    req.currentUser = undefined;
    const response: ApiResponse = {
      statusCode: 200,
      message: "Successfully signed out",
      success: true
    };
    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};
