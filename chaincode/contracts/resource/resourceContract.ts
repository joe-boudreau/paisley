import { Context, Transaction } from 'fabric-contract-api'
import log4js from 'log4js'
import { IResource } from '../../domain/interfaces'
import StateObject from '../../domain/stateobject'
import log from '../../utils/log'
import { Marshall } from '../../utils/marshall'
import { ContractBase } from '../contractbase'

log4js.configure('log4js.json')
const logger = log4js.getLogger()

export class ResourceContract  extends ContractBase {

    constructor() {
        super('resource')
    }

    @Transaction(false)
    public async getAll(ctx: Context): Promise<IResource[]> {
        const all = await this.getAllMap(ctx)
        return Array.from(all.values())
    }

    public async getAllMap(ctx: Context): Promise<Map<string, IResource>> {
        const iterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const resources = new Map<string, IResource>()
        for await (const result of iterator) {
            const r = Marshall.marshallToObject(result.value, {})
            log.debug(`Resource found: ${JSON.stringify(r)}`)
            resources.set(result.key, r)
        }
        return resources
    }

    @Transaction(false)
    public async getByID(ctx: Context, id: string): Promise<IResource> {
        const [_, resource] = await this.getByIDWithKey(ctx, id)
        return resource
    }

    public async getByIDWithKey(ctx: Context, id: string): Promise<[string, IResource]> {
        /**
         * TOOD: This is a bad implementation but I am limited by the hierarchical structure
         * of keys. Principal keys are stored as 'resource:{type}:{id}' so I cannot query
         * for a specific id without knowing the type. I want to keep this contract independent
         * of resource types so for now I am iterating over all resources and returning the
         * one with matching ID.
         * In the future, I want to move the state database to CouchDB which can support rich
         * queries, so then I should be able to query directly by the ID field...
         */
        const iterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        for await (const result of iterator) {
            const resource = Marshall.marshallToObject(result.value, {}) as IResource
            if (resource.id === id) {
                return [result.key, resource]
            }
        }
        logger.warn(`No resource with ID: ${id} found`)
        return null
    }

    public async updateById(ctx: Context, key: string, resource: IResource): Promise<void> {
        await ctx.stub.putState(key, new StateObject(resource).toBuffer())
    }
}
