import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowInstance,
  Panel,
  useKeyPress,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode } from './nodes/StartNode';
import { ModelNode } from './nodes/ModelNode';
import { EndNode } from './nodes/EndNode';
import { UtilsNode } from './nodes/UtilsNode';
import { CustomNode } from './nodes/CustomNode';
import { NodePanel } from './NodePanel';
import { NodeProperties } from './NodeProperties';
import { ContextMenu } from './ContextMenu';

const nodeTypes: NodeTypes = {
  'node-start': StartNode,
  'node-model': ModelNode,
  'node-utils': UtilsNode,
  'node-end': EndNode,
  'node-custom': CustomNode,
};

// 为了方便外部使用，直接从types中导入接口
type FlowEditorProps = {
  flowData: any[];
  onSave: (data: any[]) => void;
};
/**
 * 流程编辑器组件
 * 使用示例:
 * 
 * ```tsx
 * import { FlowEditor, FlowData } from '@ai-bots/flow';
 * import '@ai-bots/flow/style.css';
 * 
 * const MyApp = () => {
 *   const handleSave = (data: FlowData[]) => {
 *     console.log('流程数据:', data);
 *   };
 *   
 *   return (
 *     <div style={{ height: '800px' }}>
 *       <FlowEditor 
 *         flowData={myFlowData} 
 *         onSave={handleSave} 
 *       />
 *     </div>
 *   );
 * };
 * ```
 */
export const FlowEditor = ({ flowData, onSave }: FlowEditorProps): JSX.Element => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    top: number;
    left: number;
  } | null>(null);

  // 优化节点初始位置计算，提供更合理的布局
  const initialNodes: Array<Node> = flowData.map((node, index) => {
    // 基础位置
    let xPosition = 150;
    let yPosition = index * 250;
    
    // 根据节点类型调整位置
    // 开始节点靠左上
    if (node.type === 'node-start') {
      xPosition = 150;
      yPosition = 100;
    } 
    // 结束节点靠右下
    else if (node.type === 'node-end') {
      xPosition = 150;
      yPosition = (flowData.length - 1) * 250 // 确保在最下方
    }
    // 模型节点和其他节点分散在中间
    else if (node.type === 'node-model') {
      // 找出处于第几个模型节点
      const modelNodeIndex = flowData
        .filter(n => n.type === 'node-model')
        .findIndex(n => n.id === node.id);
      
      xPosition = 150;
      yPosition = 250 + modelNodeIndex * 300; // 模型节点间距更大
    }
    
    return {
      id: node.id,
      type: node.type,
      position: { x: xPosition, y: yPosition },
      data: {
        name: node.name,
        param: node.param,
        content: node.content,
        input: node.input,
        output: node.output,
      },
    };
  });

  const initialEdges: Array<Edge> = flowData.flatMap((node) =>
    node.next_nodes.map((target: any) => ({
      id: `${node.id}-${target}`,
      source: node.id,
      target,
      type: 'smoothstep',
    }))
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const nodeType = event.dataTransfer.getData('application/reactflow/type');
      const nodeName = event.dataTransfer.getData('application/reactflow/name');

      if (!nodeType || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 生成一个简短但有意义的ID
      const timestamp = new Date().getTime().toString().slice(-6);
      const newNodeId = `${nodeType}-${timestamp}`;

      // Default parameters based on node type
      let param: Record<string, unknown> = {};
      let content: Array<Record<string, unknown>> = [];
      let output: Record<string, unknown> | undefined = undefined;
      
      if (nodeType === 'node-start') {
        param = { trigger: 'api' };
        content = [];
        output = {
          key: "response",
          type: "object"
        };
      } else if (nodeType === 'node-model') {
        param = {
          provider: 'deepseek',
          modal: 'deepseek-chat',
          knowledge_config: {
            max_recall_num: 10,
            min_recall_score: 0.5,
            knowledge_id: null,
          },
          system_prompt: [{ type: 'input', value: '' }],
        };
        content = [{ type: 'input', value: '' }];
        output = {
          key: "response"
        };
      } else if (nodeType === 'node-utils') {
        param = { type: 'email' };
        content = [
          { type: 'input', key: 'from', value: '' },
          { type: 'input', key: 'to', value: '' },
          { type: 'input', key: 'subject', value: '' }
        ];
        output = {
          key: "response"
        };
      } else if (nodeType === 'node-custom') {
        param = { 
          customField: '默认值',
          otherProperty: '其他默认值'
        };
        content = [{ type: 'input', value: '' }];
        output = {
          key: "custom_output"
        };
      } else if (nodeType === 'node-end') {
        output = {
          type: "form",
          content: [
            { type: 'input', key: 'code', value: '200' }
          ]
        };
      }

      const newNode: Node = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { 
          name: nodeName, 
          param, 
          content,
          output,
          next_nodes: [] 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  // Add key press hook for Delete key
  const deleteKeyPressed = useKeyPress('Delete');
  
  // Delete node function
  const deleteNode = useCallback((nodeId: string): void => {
    setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    setEdges((edges) => edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode((prevSelected) => 
      prevSelected?.id === nodeId ? null : prevSelected
    );
  }, [setNodes, setEdges]);

  // Handle node deletion with Delete key
  useEffect(() => {
    if (deleteKeyPressed && selectedNode) {
      deleteNode(selectedNode.id);
    }
  }, [deleteKeyPressed, selectedNode, deleteNode]);

  // Handle right click on nodes
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent default context menu
      event.preventDefault();
      
      // Calculate position for context menu
      const boundingRect = reactFlowWrapper.current?.getBoundingClientRect();
      if (boundingRect) {
        setContextMenu({
          nodeId: node.id,
          top: event.clientY - boundingRect.top,
          left: event.clientX - boundingRect.left,
        });
      }
    },
    [reactFlowWrapper]
  );

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Close context menu on pane click
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    closeContextMenu();
  }, [closeContextMenu]);

  const onNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...data,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 初始化时，添加监听器来处理ID变更
  useEffect(() => {
    const handleNodeIdChange = (event: CustomEvent) => {
      const { oldId, newId } = event.detail;
      
      // 更新节点
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === oldId) {
            return { ...node, id: newId };
          }
          return node;
        })
      );
      
      // 更新边
      setEdges((eds) => 
        eds.map((edge) => {
          if (edge.source === oldId) {
            return { ...edge, source: newId, id: `${newId}-${edge.target}` };
          }
          if (edge.target === oldId) {
            return { ...edge, target: newId, id: `${edge.source}-${newId}` };
          }
          return edge;
        })
      );
    };
    
    window.addEventListener('node-id-change', handleNodeIdChange as EventListener);
    
    return () => {
      window.removeEventListener('node-id-change', handleNodeIdChange as EventListener);
    };
  }, [setNodes, setEdges]);

  // 修改 handleSaveFlow 函数以正确处理 input 和 content 字段
  const handleSaveFlow = useCallback(() => {
    if (!onSave) return;
    
    // Convert ReactFlow nodes and edges to flow data format
    const flowDataOutput = nodes.map((node) => {
      const nextNodes = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => edge.target);

      return {
        id: node.id,
        version: 'v1',
        type: node.type || '', 
        name: node.data.name || '',
        next_nodes: nextNodes,
        param: node.data.param || {},
        content: node.data.content || [],
        input: node.data.input,
        output: node.data.output,
      };
    });

    onSave(flowDataOutput);
  }, [nodes, edges, onSave]);

  return (
    <div className="ai-bots-flow-editor">
      <div className="ai-bots-flow-editor__node-panel">
        <NodePanel 
          onDragStart={(event, nodeType, nodeName) => {
            event.dataTransfer.setData('application/reactflow/type', nodeType);
            event.dataTransfer.setData('application/reactflow/name', nodeName);
            event.dataTransfer.effectAllowed = 'move';
          }} 
        />
        
        {/* Add instructions for node deletion */}
        {selectedNode && (
          <div className="p-3 mt-4 text-sm border border-red-200 rounded-md bg-red-50">
            <p>按 <kbd className="px-2 py-1 bg-gray-200 rounded">Delete</kbd> 键删除选中的节点</p>
          </div>
        )}
      </div>
      
      <div className="ai-bots-flow-editor__main">
        <div 
          className="w-full h-full" 
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            
            <Panel position="top-right">
              <button
                className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                onClick={handleSaveFlow}
              >
                保存流程
              </button>
            </Panel>
          </ReactFlow>
          
          {/* Render context menu if active */}
          {contextMenu && (
            <ContextMenu
              nodeId={contextMenu.nodeId}
              top={contextMenu.top}
              left={contextMenu.left}
              onClose={closeContextMenu}
              onDelete={deleteNode}
            />
          )}
        </div>
      </div>
      
      <div className="ai-bots-flow-editor__properties">
        <NodeProperties 
          selectedNode={selectedNode}
          onNodeUpdate={onNodeUpdate}
        />
      </div>
    </div>
  );
}; 