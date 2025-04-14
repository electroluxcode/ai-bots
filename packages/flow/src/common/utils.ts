// 判断环境，确保在浏览器和 Node.js 环境都能正常工作
export const isProduction = typeof __UMD_BUILD__ !== 'undefined' 
  ? true  // UMD 构建总是生产模式
  : (import.meta.env.MODE === "production" || import.meta.env.PROD);
