// 导出环境变量
import dotenv from "dotenv";
import path from "path";
// 先加载根目录的环境变量
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
// 然后加载应用特定的环境变量（如果有）
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = process.env;
