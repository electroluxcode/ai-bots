import { UtilsNodeExecutor } from '../src/index.js';
let context = {
    "开始节点-123": {
        before_content: "Hello, world!"
    }
}

let emailNode = {
    id: "email-node",
    name: "Email",
    type: "node-utils",
    param: {
        type: "email",
        content: [
            {
                type: "field",
                key: "user_prompt",
                value: "开始节点-123.before_content"
            }
        ],
        config: {
            host: "smtp.163.com",
            port: 465,
            auth: {
                user: "your_email@163.com",
                pass: "your_password"
            }
        }
    } as any, // Type assertion to bypass property checking
    output: {
        key: "response",
    }
}

const main = async () => {
    const utilsExecutor = new UtilsNodeExecutor(emailNode);
    const result = await utilsExecutor.execute(context, {}, emailNode);
    console.log(result);
}

main();
