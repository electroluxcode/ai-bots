import { FlowContext, NodeResult } from "@ai-bots/types";
import { get } from "lodash-es";
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

    const parts = path.split('.');
    if (parts.length < 2) {
        throw new Error(`Invalid path format: '${path}'. Expected format like 'nodeId.key'.`);
    }

    const nodeId = parts[0];
    const remainingPath = parts.slice(1).join('.');

    if (!nodeId) {
        throw new Error(`Invalid path format: '${path}'. Could not extract nodeId.`);
    }

    if (!(nodeId in context)) {
        throw new Error(`Node ID '${nodeId}' not found in context.`);
    }

    const nodeResult = context[nodeId];
    
    if (!nodeResult || typeof nodeResult !== 'object') {
        throw new Error(`Result for node ID '${nodeId}' is not an object or is null.`);
    }

    return get(nodeResult, remainingPath);
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

/**
 * @description 除了结束节点，其他的excute方法 的结尾返回值中需要调用此方法
 * @param keyObj 
 * @param output 
 * @returns 
 */
export function resolveOutputValue(keyObj: { key: string }, output: NodeResult): any {
    const outputResult: NodeResult = {};
    const outputDefinitionKey = keyObj.key as any | undefined;

    if (outputDefinitionKey) {
        outputResult[outputDefinitionKey] = output;
    } else {
        console.warn(`LLM Node ${this.node.id}: Output definition missing or not of type 'response'. Using default key 'response'.`);
        outputResult['response'] = output; // Default output key
    }
    return outputResult;
}

/**
 * @description 除了结束节点，其他的excute方法 的结尾返回值中需要调用此方法
 * @param keyObj 
 * @param output 
 * @returns 
 */
export function arrayToObjByKey(array: any[], key: string): Record<any, any> {
    const outputResult: Record<any, any> = {};
    array.forEach(item => {
        outputResult[item[key]] = item;
    });
    return outputResult;
}