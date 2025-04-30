type OrderResult = 'chainNext' | any;
type OrderHandler = (...args: any[]) => OrderResult;
type emitNameType = 'finish' | 'error';
type ChainDataType = {
    eventBus?: {
        finish: Array<Function>
        error: Array<Function>
    }
    [key: string]: any
}

const CHAIN_STATUS = {
    NEXT: "chainNext",
}
class Chain {
    private fn: OrderHandler;
    private nodeNext: Chain | null;
    ChainData: ChainDataType;
    // step1:初始配置
    constructor(fn: OrderHandler) {
        this.fn = fn;
        this.ChainData = {};
        this.nodeNext = null;
    }
    setChainData(data: ChainDataType): void {
        this.ChainData = data;
    }
    setNodeNext(nodeNext){
        this.nodeNext = nodeNext
    }
    emit = (name: emitNameType, data: any) => {
        if (this.ChainData.eventBus) {
            if (this.ChainData.eventBus[name]) {
                this.ChainData.eventBus[name].forEach((element: Function) => {
                    element(data);
                });
            } else {
                throw new Error('没有这个事件');
            }
        }
    };
    // step2: 初始链条
    nodeSet(nodeNext: Chain): void {
        this.nodeNext = nodeNext;
    }
    

    // step3: 执行
    passRequest(): OrderResult {
        const res = this.fn();
        // 同步处理
        if (res === CHAIN_STATUS.NEXT) {
            if (this.nodeNext) {
                this.nodeNext.setChainData(this.ChainData);
                return this.nodeNext.passRequest();
            }
        }
        if (this.nodeNext) {
            this.nodeNext.setChainData(this.ChainData);
        }

        return res;
    }
    
    // core method: 异步
    asycNext(): OrderResult {
        if (this.nodeNext) {
            this.nodeNext.setChainData(this.ChainData);
            return this.nodeNext.passRequest();
        }
        return this.fn();
    }

    
}

export {
    Chain,
    CHAIN_STATUS
}
