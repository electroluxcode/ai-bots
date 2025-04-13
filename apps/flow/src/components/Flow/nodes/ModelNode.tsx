import { Handle, Position } from 'reactflow';

interface ModelNodeProps {
  data: {
    name: string;
    param: {
      provider: string;
      modal: string;
      content: Array<{
        type: string;
        value: string;
      }>;
    };
  };
}

export const ModelNode = ({ data }: ModelNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">Provider: {data.param.provider}</div>
          <div className="text-gray-500">Model: {data.param.modal}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-500" />
    </div>
  );
}; 