import { CloudWatchLogs } from "aws-sdk";

export class LambdaLoggingCapability {
  private sequenceToken: string | undefined;

  constructor(
    private cloudwatchLogs: CloudWatchLogs,
    private logGroupName: string,
    private logStreamName: string
  ) {}

  /**
   * Logs an informational message.
   * @param message - The message to log.
   * @param meta - Optional metadata to log with the message.
   */
  public info(message: string, meta?: object): void {
    this.putLogEvent("INFO", message);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param meta - Optional metadata to log with the message.
   */
  public error(message: string, meta?: object): void {
    this.putLogEvent("ERROR", message);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param meta - Optional metadata to log with the message.
   */
  public warn(message: string, meta?: object): void {
    this.putLogEvent("WARN", message);
  }

  // Helper function to send log events to CloudWatch
  private async putLogEvent(level: string, message: string) {
    const params = {
      logEvents: [
        {
          message: `[${level}] ${message}`,
          timestamp: Date.now(),
        },
      ],
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      sequenceToken: this.sequenceToken,
    };

    try {
      const response = await this.cloudwatchLogs.putLogEvents(params).promise();
      this.sequenceToken = response.nextSequenceToken; // Update sequence token
    } catch (err) {
      console.error("Failed to send log to CloudWatch:", err);
    }
  }
}
