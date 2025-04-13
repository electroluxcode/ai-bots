import { useCallback } from 'react';
import { NodeTypes } from 'reactflow';

interface NodePanelProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeName: string) => void;
}

export const NodePanel = ({ onDragStart }: NodePanelProps): JSX.Element => {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeName: string) => {
      onDragStart(event, nodeType, nodeName);
    },
    [onDragStart]
  );

  const nodeTypes = [
    { type: 'node-start', name: '开始节点', color: 'border-teal-400 bg-teal-50' },
    { type: 'node-model', name: '大模型节点', color: 'border-blue-400 bg-blue-50' },
    { type: 'node-utils', name: '工具节点', color: 'border-purple-400 bg-purple-50' },
    { type: 'node-custom', name: '自定义节点', color: 'border-yellow-400 bg-yellow-50' },
    { type: 'node-end', name: '结束节点', color: 'border-red-400 bg-red-50' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">节点类型</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className={`p-3 border-2 rounded-md cursor-move ${node.color} hover:shadow-md transition-shadow`}
            draggable
            onDragStart={(event) => handleDragStart(event, node.type, node.name)}
          >
            {node.name}
          </div>
        ))}
      </div>
    </div>
  );
}; 