import { env } from "@ai-bots/setting-config";
const app = () => {
  console.log(env);
}
app();
export default app; 
// Option 1: Remove the export statement
// export {}

// Option 2: Use module.exports instead
// module.exports = {};