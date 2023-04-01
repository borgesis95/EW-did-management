import express from "express";
import * as bodyParser from "body-parser";
import { connect } from "mongoose";
import errorsHandler from "./middleware/error";
class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: unknown, port: number) {
    this.app = express();
    this.port = port;

    this.setupCors();
    this.initializeMiddlewares();
    this.connectToTheDatabase();
    this.initializeControllers(controllers);
    this.errorHandler();
  }

  private initializeMiddlewares() {
    /* Da inizializzare il logger */
    // this.app.use(logger);
    this.app.use(bodyParser.json());
  }

  private errorHandler = () => {
    this.app.use(errorsHandler);
  };

  /**
   * @description
   * Connection with mongo's database
   */
  private connectToTheDatabase() {
    const {
      MONGO_USER,
      MONGO_PASSWORD,
      MONGO_DBNAME,
      MONGO_URL = "",
    } = process.env;

    connect(MONGO_URL);
  }

  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use("/", controller.router);
    });
  }

  private setupCors = () => {
    this.app.use((req, res, next) => {
      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

      // Request methods you wish to allow
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );

      // Request headers you wish to allow
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      );

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)

      // Pass to next layer of middleware
      next();
    });
  };

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 App ready at port: ${this.port}`);
    });
  }
}

export default App;
