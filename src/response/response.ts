export interface APIresponseInterface {
  data: any;
  message: string;
  status: number;
}

export default class APIresponse {
  /**
   * this class will wrap each response returned from this service
   * @param data
   * @param message
   * @param status
   * @returns {APIresponseInterface}
   */
  static success = (
    data: any,
    message = "",
    status = 200
  ): APIresponseInterface => {
    return {
      data,
      message,
      status,
    };
  };
}
