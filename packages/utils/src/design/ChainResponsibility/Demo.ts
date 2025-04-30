import { Chain } from "./Chain.js";
export interface ExtendedChainData extends Chain {
    ChainData: {
        init: {
            xml_id: number,
            model_id: number
        }
        res: any
    }
}
function initPost(this: ExtendedChainData) {
    if (!this.ChainData.init) {
        this.emit("error", "使用者触发error事件")
        return
    }
    return 'chainNext';
}
async function lastPost(this:ExtendedChainData) {
    this.emit("finish","使用者触发finish事件")
}