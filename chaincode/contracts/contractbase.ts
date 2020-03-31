import { Context, Contract } from 'fabric-contract-api'

export class ContractBase extends Contract {

    constructor(namespace) {
        super(namespace)
    }

    public async beforeTransaction(ctx: Context) {
        console.info(`============= START : ${ctx.stub.getFunctionAndParameters().fcn} ===========`)
    }

    public async afterTransaction(ctx: Context, result) {
        console.info(`============= END : ${ctx.stub.getFunctionAndParameters().fcn} ===========`)
    }

}
