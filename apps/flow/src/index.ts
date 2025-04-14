// 导入样式
import './index.css';

// 导出 Flow 相关组件
export { FlowEditor } from './components/Flow/FlowEditor';

// 导出 Flow 相关类型（如果需要）
export interface FlowData {
  id: string;
  version: string;
  type: string;
  name: string;
  next_nodes: Array<string>;
  param: Record<string, unknown>;
  output?: Record<string, unknown>;
} 