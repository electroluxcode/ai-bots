import { UtilsNodeExecutor } from '../src/index.js';
let context = {
    "开始节点-123": {
        before_content: "Hello, world!"
    }
}

let emailNode = {
    id: "email-node",
    name: "Email设置节点",
    type: "node-utils",
    param: {
        type: "email",
        content: [
            {
                "type": "input",
                "key": "from",
                "value": "3451613934@qq.com"
            },
            {
                "type": "input",
                "key": "to",
                "value": "895361337@qq.com"
            },
            {
                "type": "input",
                "key": "subject",
                "value": "测试title"
            },
            {
                "type": "field",
                "key": "text",
                "value": "开始节点-123.before_content"
            },
        ],
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
