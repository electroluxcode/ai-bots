// Define basic types for node parameters, inputs, and outputs

export type NodeId = string;

export interface FormInput {
    type: 'input';
    key: string;
    value: string | number | boolean;
}

export interface FieldInput {
    type: 'field';
    // Represents a reference to another node's output, e.g., "nodeId.outputKey"
    value: string; 
}

export interface KeyInput {
    type: 'key';
    value: string; // The key name for the input
}

export interface ResponseOutput {
    type: 'response';
    key: string;
    description?: string;
}

export interface FieldOutput {
    type: 'field';
    key: string;
    value: string; // Reference to an internal value or another node's output
    description?: string;
}

export interface FormContent {
    type: 'form';
    content: (KeyInput | FieldInput | FormInput | ResponseOutput | FieldOutput)[]; // Allow mixed input/output types in form content
    id?: string; // Optional ID for forms
}

export interface NodeBase {
    id: NodeId;
    name: string;
    type: string; // e.g., 'node-start', 'node-model', 'node-end'
    version?: string; // Optional versioning
    next_nodes?: NodeId[]; // IDs of the next nodes in the flow
    parent_nodes?: NodeId[]; // IDs of parent nodes (useful for branching/joining later)
    input?: FormContent; // Definition of expected input parameters
    // end node: FormContent
    // other nodes: { key: string }
    output?: FormContent | { key: string }; // Definition of output parameters
    param?: Record<string, any>; // Node-specific parameters
}

// Specific Node Types (can be extended)

export interface StartNodeParams {
    trigger: 'api' | 'schedule' | 'manual'; // Example trigger types
}

export interface StartNode extends NodeBase {
    type: 'node-start';
    param: StartNodeParams;
    input: FormContent; // Start node defines the initial input structure
}

export interface EndNodeParams {
    // Currently empty, but could hold configuration for how to format/return results
}

export interface EndNode extends NodeBase {
    type: 'node-end';
    param?: EndNodeParams; // Optional params for end node
    output: FormContent; // End node defines the final output structure
    next_nodes: []; // End node has no next nodes
}

export interface LLMKnowledgeConfig {
    max_recall_num?: number;
    min_recall_score?: number;
    knowledge_id?: string | null;
}

export interface LLMNodeParams {
    modal: string; // e.g., 'DeepSeek-V3'
    provider?: string; // e.g., 'deepseek', 'openai', etc.
    knowledge_config?: LLMKnowledgeConfig;
    system_prompt?: (FormInput | FieldInput)[]; 
    content?: (FormInput | FieldInput)[]; // User prompt parts
}

export interface LLMNode extends NodeBase {
    type: 'node-model';
    param: LLMNodeParams;
    output: { key: string }; // Defines the output structure, e.g., { key: 'response' }
}

// Task management node types

export type ExecutionMode = 'parallel' | 'serial';
export type TriggerType = 'manual' | 'scheduled';

export interface WorkflowReference {
    id: string;
    name: string;
    input_mapping?: Record<string, string>; // Maps task input to workflow input
    output_mapping?: Record<string, string>; // Maps workflow output to task output
}

export interface ScheduleConfig {
    cron_expression: string; // e.g., "0 0 * * *" for daily at midnight
    timezone?: string;       // e.g., "America/New_York"
    start_date?: string;     // ISO date string
    end_date?: string;       // ISO date string
}

export interface TaskNodeParams {
    execution_mode: ExecutionMode;
    trigger_type: TriggerType;
    workflows: NodeBase[];
    schedule?: ScheduleConfig; // Required if trigger_type is 'scheduled'
    timeout_ms?: number;      // Global timeout in milliseconds
    max_retries?: number;     // Maximum retry attempts for failed workflows
    retry_delay_ms?: number;  // Delay between retries in milliseconds
}

export interface TaskNode extends NodeBase {
    type: 'node-tasks';
    param: TaskNodeParams;
}

// Type for the overall flow definition
export type FlowDefinition = NodeBase[];

// Type for the runtime state passed between nodes
export type NodeResult = Record<string, any>;
export type FlowContext = Record<NodeId, NodeResult>; // Stores results from all executed nodes 