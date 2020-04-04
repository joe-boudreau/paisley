import { Context, Contract } from 'fabric-contract-api'
import log4js from 'log4js'

log4js.configure('log4js.json')
const log = log4js.getLogger()

export class ContractBase extends Contract {


    constructor(namespace) {
        super(namespace)
    }

    public async beforeTransaction(ctx: Context) {
        log.info(`============= START : ${ctx.stub.getFunctionAndParameters().fcn} ===========`)
    }

    public async afterTransaction(ctx: Context, result) {
        log.info(`============= END : ${ctx.stub.getFunctionAndParameters().fcn} ===========`)
    }

}
