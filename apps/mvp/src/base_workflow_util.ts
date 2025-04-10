import { env } from "@ai-bots/configs";
import { executeFlow } from "@ai-bots/node-workflow";

import * as fs from 'fs';
import * as path from 'path';
// --- Running the Example ---

// Example input based on prd.md
const exampleInput = {
    "api_role": "股票分析师",
    "api_content": "请问最近适合投资什么行业"
}

// Load the flow definition from flow.json
const flowFilePath = path.join(process.cwd(), 'base_workflow_email.json'); // Use path.join for cross-platform compatibility
let flowDefinition = [];
try {
    const flowFileContent = fs.readFileSync(flowFilePath, 'utf-8');
    flowDefinition = JSON.parse(flowFileContent);
} catch (error: any) {
    console.error(`Error reading or parsing flow.json at ${flowFilePath}:`, error.message);
    process.exit(1); // Exit if flow definition is missing or invalid
}

console.log("Starting AI Bot Flow Execution...");
console.log("Initial Input:", exampleInput);

// Ensure DEEPSEEK_API_KEY is set (needed by LLM node)
if (!env.DEEPSEEK_API_KEY) {
    console.warn("Warning: DEEPSEEK_API_KEY environment variable is not set. The LLM node will likely fail.");
    console.warn("Please create a .env file in the apps/mvp directory with DEEPSEEK_API_KEY=your_actual_key");
}


executeFlow(flowDefinition, exampleInput)
    .then(finalResult => {
        console.log("\n--- Flow Execution Completed ---");
        // The result is already logged by the End Node executor or the final step
        console.log("Final Flow Result:", finalResult); 
    })
    .catch(error => {
        console.error("\n--- Flow Execution Failed ---");
        console.error("Error:", error.message);
        process.exit(1);
    });


// Keep the default export if needed for other tooling, but the script now executes the flow directly.
// export default {}; 