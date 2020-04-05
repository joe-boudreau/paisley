import { Context, Transaction } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'
import AccessEvent from '../domain/accessEvent'
import log from '../utils/log'
import { ContractBase } from './contractbase'
import { PrincipalContract } from './principal/principalContract'

export class AccessControlContract  extends ContractBase {
    private readonly principalContract: PrincipalContract

    constructor() {
        super('access-control')
        this.principalContract = new PrincipalContract()
    }

    @Transaction()
    public async authorizeById(ctx: Context, principalId: string, resourceId: string): Promise<boolean> {
        const [_, principal] = await this.principalContract.getByID(ctx, principalId)

        const event = new AccessEvent()
        event.principalId = principal.id
        event.resourceId = resourceId
        event.granted = principal.resourceGrants.has(resourceId)

        // Generate ID value if none exists
        if (!event.id) { event.id = uuidv4() }

        await ctx.stub.putState(this._getKey(ctx, event.id), event.toBuffer())
        log.info(`New access event recorded ${JSON.stringify(event)}`)

        return event.granted
    }

    private _getKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [id])
    }
}
