import { Context, Transaction } from 'fabric-contract-api'
import log4js from 'log4js'
import { IPrincipal } from '../../domain/interfaces'
import StateObject from '../../domain/stateobject'
import log from '../../utils/log'
import { Marshall } from '../../utils/marshall'
import { ContractBase } from '../contractbase'

log4js.configure('log4js.json')
const logger = log4js.getLogger()

export class PrincipalContract  extends ContractBase {

    constructor() {
        super('principal')
    }

    @Transaction(false)
    public async getAll(ctx: Context): Promise<Map<string, IPrincipal>> {
        const iterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const principals = new Map<string, IPrincipal>()
        for await (const result of iterator) {
            principals.set(result.key, Marshall.marshallToObject(result.value, {}))
        }
        return principals
    }

    @Transaction(false)
    public async getByID(ctx: Context, id: string): Promise<[string, IPrincipal]> {
        /**
         * TOOD: This is a bad implementation but I am limited by the hierarchical structure
         * of keys. Principal keys are stored as 'principal:{type}:{id}' so I cannot query
         * for a specific id without knowing the type. I want to keep this contract independent
         * of principal types so for now I am iterating over all principals and returning the
         * one with matching ID.
         * In the future, I want to move the state database to CouchDB which can support rich
         * queries, so then I should be able to query directly by the ID field...
         */
        const iterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        for await (const result of iterator) {
            const principal = Marshall.marshallToObject(result.value, {}) as IPrincipal
            if (principal.id === id) {
                return [result.key, principal]
            }
        }
        logger.warn(`No principal with ID: ${id} found`)
        return null
    }

    public async updateByID(ctx: Context, key: string, principal: IPrincipal): Promise<void> {
        ctx.stub.splitCompositeKey(key)
        await ctx.stub.putState(key, new StateObject(principal).toBuffer())
        log.info(`Updated state for principal key: ${key}`)
    }
}
