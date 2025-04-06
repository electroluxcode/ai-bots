import { 
    EndNode, 
    FlowContext, 
    NodeResult, 
    NodeId,
    FieldOutput,
    FormInput
} from "@ai-bots/types";
import { NodeExecutor } from "./base.js";
import { getValueFromContext } from "@ai-bots/utils";
import { set } from 'lodash-es';

// End Node Implementation
export class EndNodeExecutor extends NodeExecutor {
    constructor(protected node: EndNode) {
        super(node);
    }

    async execute(context: FlowContext, input: NodeResult): Promise<NodeResult> {
        console.log(`Executing End Node: ${this.node.id}`);
        const finalOutput: NodeResult = {};

        if (!this.node.output || this.node.output.type !== 'form' || !this.node.output.content) {
            console.warn(`End Node ${this.node.id}: No output format defined. Returning raw input.`);
            return { ...input };
        }

        for (const item of this.node.output.content) {
            if (item.type === 'field') {
                const fieldOutput = item as FieldOutput;
                try {
                    const value = getValueFromContext(context, fieldOutput.value);
                    set(finalOutput, fieldOutput.key, value);
                } catch (error) {
                    console.error(`End Node ${this.node.id}: Error resolving value for key '${fieldOutput.key}' from '${fieldOutput.value}':`, error);
                    set(finalOutput, fieldOutput.key, null);
                }
            } else if (item.type === 'input') {
                const formInput = item as FormInput;
                set(finalOutput, formInput.key.toString(), formInput.value);
            } else {
                console.warn(`End Node ${this.node.id}: Unsupported output item type '${item.type}'`);
            }
        }

        console.log(`End Node ${this.node.id} final output:`, finalOutput);
        return finalOutput;
    }

    // Override: End node has no next nodes
    getNextNodes(): NodeId[] {
        return [];
    }
} 