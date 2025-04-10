import { env } from "@ai-bots/configs";
import {
    FlowContext,
    NodeResult,
} from "@ai-bots/types";
import { NodeExecutor } from "@ai-bots/node-base";
import { resolveInputValue } from "@ai-bots/utils";

const RegisterUtilsNode = {
    "email": {
        "name": "email",
        "description": "发送邮件",
        "input": {
            "type": "input",
        }
    }
}


class UtilsNodeExecutor extends NodeExecutor {
    async execute(context: FlowContext, initialInput: NodeResult, NodeDef: any): Promise<NodeResult> {
        console.log("UtilsNodeExecutor", {
            context,
            initialInput,
            NodeDef
        });
        const before_content = resolveInputValue(this.node.param.content[0], context);
        console.log("before_content222222222", before_content);
        return
    }
}

// --- Running the Example ---

// Example input based on prd.md



export {
    UtilsNodeExecutor
}
// Keep the default export if needed for other tooling, but the script now executes the flow directly.
// export default {}; 