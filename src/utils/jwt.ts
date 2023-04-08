import jwt from "jsonwebtoken";

export const createToken = (address: string, username: string) => {
  const expiresIn = process.env.JWTEXPIRE && parseInt(process.env.JWTEXPIRE);
  const secret = process.env.JWTSECRET || "";
  const header = {
    address,
    username,
  };

  return jwt.sign(header, secret, { expiresIn });
};

/**
 * @description this method check if token is valid
 * @param token
 * @returns
 */
export const verify = (token: string) => {
  const secret = process.env.JWTSECRET || "";
  const decodedToken = jwt.verify(token, secret);
  return decodedToken;
};
