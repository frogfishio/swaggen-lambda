import { Capabilities, CapabilityFactory } from "@frogfish/swaggen-types";
import { CoreLoggingCapabilityFactory } from "./logging.factory";
import { CoreCapabilityFactory } from "@frogfish/swaggen-core";

export class LambdaCapabilityFactory
  extends CoreCapabilityFactory
  implements CapabilityFactory
{
  // Create core (default) capabilities
  public async create(caps: Array<string>): Promise<Capabilities> {
    const capabilities: Capabilities = {};

    // Iterate through each capability in the array
    for (const cap of caps) {
      let capability = await this.createCapability(cap, capabilities);
      if (capability) {
        capabilities[cap] = capability;
      } else {
        // let's see if there is a core capability like this
        capability = await super.createCapability(cap, capabilities);
        if (capability) {
          capabilities[cap] = capability;
        }
      }
    }

    // Return only the recognized capabilities
    return capabilities;
  }

  protected async createCapability(
    capability: string,
    capabilities?: any
  ): Promise<any> {
    switch (capability) {
      case "logging":
        const factory = new CoreLoggingCapabilityFactory();
        return (await factory.create()) || null;
      default:
        return null;
    }
  }
}
