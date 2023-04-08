import express from "express";
import jwt from "jsonwebtoken";

export const auth = (
  req: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.header("Authorization");

    if (!token) return response.status(401).send("Access denied");
    else {
      const removedBearerToken = token.split(" ")[1];
      const secret = process.env.JWTSECRET || "";
      const decoded_token = jwt.verify(removedBearerToken, secret) as any;

      response.locals.user = decoded_token.address as any;
      next();
    }
  } catch (error: any) {
    response.status(401).send(error?.message);
  }
};
