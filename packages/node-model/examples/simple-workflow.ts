import { 
    LLMNode, 
    FlowContext, 
    NodeResult, 
    FormInput 
} from "@ai-bots/types";
import { LLMNodeExecutor } from "../src/index.js";

// Example of using the LLM node with both DeepSeek and OpenAI providers
async function runExample() {
    console.log("Running LLM Node Example");

    // First, create sample nodes
    const deepseekNode: LLMNode = {
        id: "deepseek-node",
        name: "DeepSeek Chat",
        type: "node-model",
        param: {
            modal: "deepseek-chat",
            // Using 'as any' to bypass type checking for the provider property
            // that was added to LLMNodeParams but might not be reflected in all files yet
            provider: "deepseek",
            system_prompt: [
                {
                    type: "input",
                    key: "system_prompt",
                    value: "You are a helpful AI assistant."
                }
            ],
            content: [
                {
                    type: "input",
                    key: "user_prompt",
                    value: "Tell me a short story about AI."
                }
            ]
        } as any, // Type assertion to bypass property checking
        output: {
            type: "form",
            content: [
                {
                    type: "response",
                    key: "response"
                }
            ]
        }
    };

    const openaiNode: LLMNode = {
        id: "openai-node",
        name: "OpenAI Chat",
        type: "node-model",
        param: {
            modal: "gpt-3.5-turbo",
            // Using 'as any' to bypass type checking for the provider property
            provider: "openai",
            system_prompt: [
                {
                    type: "input",
                    key: "system_prompt",
                    value: "You are a helpful AI assistant."
                }
            ],
            content: [
                {
                    type: "input",
                    key: "user_prompt",
                    value: "Tell me a short story about AI."
                }
            ]
        } as any, // Type assertion to bypass property checking
        output: {
            type: "form",
            content: [
                {
                    type: "response",
                    key: "response"
                }
            ]
        }
    };

    // Create context
    const context: FlowContext = {};
    const input: NodeResult = {};

    // Execute nodes
    try {
        console.log("Running DeepSeek node:");
        const deepseekExecutor = new LLMNodeExecutor(deepseekNode);
        const deepseekResult = await deepseekExecutor.execute(context, input);
        console.log("DeepSeek Result:", JSON.stringify(deepseekResult, null, 2));

        // Update context with the result
        context[deepseekNode.id] = deepseekResult;

        // console.log("\nRunning OpenAI node:");
        // const openaiExecutor = new LLMNodeExecutor(openaiNode);
        // const openaiResult = await openaiExecutor.execute(context, input);
        // console.log("OpenAI Result:", JSON.stringify(openaiResult, null, 2));
    } catch (error) {
        console.error("Error running example:", error);
    }
}

// Run the example
runExample().catch(console.error); 