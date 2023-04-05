export {};

declare global {
  namespace Express {
    interface Request {
      locals: {
        user: string;
      };
    }
  }
}
