import { FlowContext } from "@ai-bots/common-types";

/**
 * Resolves a value from the flow context based on a path string.
 * Example path: "nodeId.key.nestedKey" or "nodeId.key[0].property"
 * 
 * @param context The current flow context holding results from previous nodes.
 * @param path The string path to resolve.
 * @returns The resolved value.
 * @throws Error if the path cannot be resolved.
 */
export function getValueFromContext(context: FlowContext, path: string): any {
    if (!path) {
        throw new Error("Path cannot be empty.");
    }

    // Simple split for now, assumes dot notation like "nodeId.key"
    // TODO: Add support for more complex paths (arrays, nested objects) if needed.
    const parts = path.split('.');
    if (parts.length < 2) {
        throw new Error(`Invalid path format: '${path}'. Expected format like 'nodeId.key'.`);
    }

    const nodeId = parts[0];
    const key = parts[1];
    
    // Add checks for undefined before accessing context/nodeResult
    if (!nodeId) {
        throw new Error(`Invalid path format: '${path}'. Could not extract nodeId.`);
    }

    if (!(nodeId in context)) {
        throw new Error(`Node ID '${nodeId}' not found in context.`);
    }

    const nodeResult = context[nodeId];
    
    if (!key) {
        throw new Error(`Invalid path format: '${path}'. Could not extract key.`);
    }
    
    if (!nodeResult || typeof nodeResult !== 'object') {
         throw new Error(`Result for node ID '${nodeId}' is not an object or is null.`);
    }
    
    if (!(key in nodeResult)) {
        throw new Error(`Key '${key}' not found in result for node '${nodeId}'.`);
    }

    // For now, directly return the value. Add nested access later if needed.
    if (parts.length > 2) {
        console.warn(`getValueFromContext: Path '${path}' has more than two parts. Only direct key access ('nodeId.key') is currently implemented. Returning value for '${key}'.`);
        // Implement deeper access logic here if necessary
    }

    return nodeResult[key];
}

/**
 * Utility to resolve input values (FormInput or FieldInput) using the context.
 */
export function resolveInputValue(item: { type: string; value: any }, context: FlowContext): any {
    if (item.type === 'input') {
        return item.value; // Direct value
    } else if (item.type === 'field') {
        return getValueFromContext(context, item.value); // Resolve from context
    } else {
        throw new Error(`Unsupported input item type: ${item.type}`);
    }
} 