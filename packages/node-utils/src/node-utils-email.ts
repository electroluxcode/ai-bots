import { UtilsConfig } from './type.js';
import nodemailer from 'nodemailer';
import { env } from '@ai-bots/configs';
import { arrayToObjByKey, resolveInputValue } from "@ai-bots/utils";
export class EmailNodeExecutor implements UtilsConfig {
    transporter: any;
    constructor(private utilNodeDef) {
        if (!env.EMAIL_HOST || !env.EMAIL_PORT || !env.EMAIL_AUTH_USER || !env.EMAIL_AUTH_PASS) {
            throw new Error('Email configuration is not set');
        }
        this.transporter = nodemailer.createTransport({
            host: env.EMAIL_HOST,
            port: env.EMAIL_PORT,
            auth: {
                user: env.EMAIL_AUTH_USER,
                pass: env.EMAIL_AUTH_PASS
            }
        });
    }
    callUtil(context) {
        let prettyFn = null
        try {
            prettyFn = eval(this.utilNodeDef.param.prettyFn)
        } catch (error) {
            console.error('prettyFn error', error)
        }
        return new Promise(async (resolve, reject) => {
            const obj = arrayToObjByKey(this.utilNodeDef.param.content, 'key');
            const mail: any = {
                from: resolveInputValue(obj.from, context),
                to: resolveInputValue(obj.to, context),
                subject: resolveInputValue(obj.subject, context),
            }
            if (obj?.text) {
                const text = resolveInputValue(obj.text, context);  
                mail.text = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
            }
            if (obj?.html) {
                const html = resolveInputValue(obj.html, context); 
                let prettyHtml = null
                if (prettyFn) {
                    prettyHtml = await prettyFn(html)
                } else {
                    prettyHtml = html
                }
                mail.html = typeof prettyHtml === 'string' ? prettyHtml : JSON.stringify(prettyHtml, null, 2);
            }
            this.transporter.sendMail(mail, function (error, info) {
                console.log("mail sent:", info.response);
                if (error) {
                    reject(error);
                } else {
                    resolve(info.response);
                }
            });
        });
    }
}