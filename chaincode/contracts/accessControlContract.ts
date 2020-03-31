import {ContractBase} from './contractbase'
import {Context, Transaction} from 'fabric-contract-api'

class AccessControlContract  extends ContractBase {

    constructor() {
        super('access-control')
    }

    @Transaction()
    public async authorizeById(ctx: Context, principalId: string, resourceId: string){

    }
}
