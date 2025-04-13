import { Handle, Position } from 'reactflow';

interface StartNodeProps {
  data: {
    name: string;
    param: {
      trigger: string;
    };
  };
}

export const StartNode = ({ data }: StartNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">Trigger: {data.param.trigger}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
}; 