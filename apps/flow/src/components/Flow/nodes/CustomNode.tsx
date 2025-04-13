import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
  data: {
    name: string;
    param: {
      customField: string;
      otherProperty: string;
    };
  };
}

export const CustomNode = ({ data }: CustomNodeProps): JSX.Element => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-400">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">自定义字段: {data.param.customField}</div>
          <div className="text-gray-500">其他属性: {data.param.otherProperty}</div>
        </div>
      </div>
      <Handle 
        className="w-16 !bg-yellow-500" 
        position={Position.Top} 
        type="target" 
      />
      <Handle 
        className="w-16 !bg-yellow-500" 
        position={Position.Bottom} 
        type="source" 
      />
    </div>
  );
}; 