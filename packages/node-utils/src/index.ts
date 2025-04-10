import { env } from "@ai-bots/configs";
import {
    FlowContext,
    NodeResult,
} from "@ai-bots/types";
import { NodeExecutor } from "@ai-bots/node-base";
import { EmailNodeExecutor } from "./node-utils-email.js";

const RegisterUtilsNode = {
    "email": EmailNodeExecutor
}


class UtilsNodeExecutor extends NodeExecutor {
    async execute(context: FlowContext, initialInput: NodeResult, NodeDef: any): Promise<NodeResult> {
      
        const type = this.node.param.type;
        const executor = new RegisterUtilsNode[type](NodeDef);
        if (!executor) {
            throw new Error(`UtilsNodeExecutor: ${type} is not registered`);
        }
        const result =await executor.callUtil(context);
        return result;
    }
}

// --- Running the Example ---

// Example input based on prd.md



export {
    UtilsNodeExecutor
}
// Keep the default export if needed for other tooling, but the script now executes the flow directly.
// export default {}; 