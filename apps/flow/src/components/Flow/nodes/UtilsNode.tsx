import { Handle, Position } from 'reactflow';

interface UtilsNodeProps {
  data: {
    name: string;
    param: {
      type: string;
      content?: Array<{
        type: string;
        key: string;
        value: string;
      }>;
    };
  };
}

export const UtilsNode = ({ data }: UtilsNodeProps): JSX.Element => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">Type: {data.param.type}</div>
        </div>
      </div>
      <Handle 
        className="w-16 !bg-purple-500" 
        position={Position.Top} 
        type="target" 
      />
      <Handle 
        className="w-16 !bg-purple-500" 
        position={Position.Bottom} 
        type="source" 
      />
    </div>
  );
}; 