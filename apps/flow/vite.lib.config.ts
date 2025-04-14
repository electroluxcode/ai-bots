import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AIBotsFlow',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.js';
        if (format === 'cjs') return 'index.cjs';
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      // 仅对ES和CJS格式外部化React和ReactFlow依赖
      external: (id, parentId, isResolved) => {
        // 对于UMD格式，我们外部化React但不外部化ReactFlow
        // 这样确保ReactFlow的功能被包含在UMD包中
        if (process.env.FORMAT === 'umd') {
          return id === 'react' || id === 'react-dom' || id === 'react/jsx-runtime';
        }
        // 对于其他格式，我们外部化react和reactflow
        return id === 'react' || 
               id === 'react-dom' || 
               id === 'react/jsx-runtime' || 
               id.startsWith('reactflow');
      },
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供全局变量
        globals: (id) => {
          if (id === 'react') return 'React';
          if (id === 'react-dom') return 'ReactDOM';
          if (id === 'react/jsx-runtime') return 'jsxRuntime';
          if (id === 'reactflow') return 'ReactFlow';
          if (id.startsWith('reactflow/')) {
            return 'ReactFlow';
          }
          return id;
        },
        // 确保 CSS 文件被正确地复制
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return assetInfo.name as string;
        },
      },
    },
    // 确保生成 sourcemap
    sourcemap: true,
    // 确保 CSS 被提取到单独的文件
    cssCodeSplit: false,
  },
  // 定义UMD构建需要的全局变量配置
  define: {
    'process.env.UMD_BUILD': JSON.stringify(true),
  },
}); 