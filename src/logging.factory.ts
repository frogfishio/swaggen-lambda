import { LoggingCapability } from "@frogfish/swaggen-types";
import { CloudWatchLogs } from "aws-sdk";
import { LambdaLoggingCapability } from "./logging.capability";

export class CoreLoggingCapabilityFactory {
  private logGroupName =
    process.env.LOG_GROUP_NAME || "/aws/lambda/your-log-group";
  private logStreamName = `${new Date().toISOString()}/${
    process.env.LOG_STREAM_NAME || "your-lambda-stream"
  }`;

  private cloudwatchLogs;

  constructor(private capabilities?: any) {
    this.cloudwatchLogs = new CloudWatchLogs();
  }

  async create(): Promise<LoggingCapability> {
    await this.ensureLogGroupAndStream();
    return new LambdaLoggingCapability(
      this.cloudwatchLogs,
      this.logGroupName,
      this.logStreamName
    );
  }

  // Create or ensure the log group and stream exist
  private async ensureLogGroupAndStream() {
    try {
      // Create or ensure log group
      await this.cloudwatchLogs
        .createLogGroup({ logGroupName: this.logGroupName })
        .promise()
        .catch((err) => {
          if (err.code !== "ResourceAlreadyExistsException") throw err;
        });

      // Create or ensure log stream
      await this.cloudwatchLogs
        .createLogStream({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
        })
        .promise()
        .catch((err) => {
          if (err.code !== "ResourceAlreadyExistsException") throw err;
        });
    } catch (err) {
      console.error("Failed to ensure log group or stream:", err);
    }
  }
}
