import { Handle, Position } from 'reactflow';

interface EndNodeProps {
  data: {
    name: string;
    output?: {
      type: string;
      content: Array<{
        type: string;
        key: string;
        value: string;
      }>;
    };
  };
}

export const EndNode = ({ data }: EndNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          {data.output && (
            <div className="text-gray-500">Output Type: {data.output.type}</div>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-16 !bg-red-500" />
    </div>
  );
}; 