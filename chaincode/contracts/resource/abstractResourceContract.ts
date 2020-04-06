import {Context, Transaction} from 'fabric-contract-api'
import log4js from 'log4js'
import {v4 as uuidv4} from 'uuid'
import {IResource} from '../../domain/interfaces'
import StateObject from '../../domain/stateobject'
import log from '../../utils/log'
import {ContractBase} from '../contractbase'
import {PolicyContract} from '../policyContract'


const keyObject = 'resource'
/**
 * Generic class to represent a resource in the principal-resource security model
 * Performs CRUD operations for resource entities on the ledger. Any object class which implements
 * the IResource interface can extend this class to create a contract for it's management
 *
 * e.g.
 * class AreaContract extends AbstractResourceContract<Area> {constructor() {super('area', Area)}}
 */
export class AbstractResourceContract<T extends StateObject> extends ContractBase {
    private readonly objConstructor: new (d?) => T & IResource
    private readonly type: string
    private readonly policyContract: PolicyContract

    /**
     * @param type The resource type
     * @param Tconstructor A constructor function which can deserialize data from multiple encodings
     */
    constructor(type: string, Tconstructor: (new (d?) => T & IResource)) {
        super(`${keyObject}-${type}`)
        this.type = type
        this.objConstructor = Tconstructor
        this.policyContract = new PolicyContract()
    }

    @Transaction()
    public async create(ctx: Context, data: string): Promise<string> {
        const r = new this.objConstructor(data)

        // Generate ID value if none exists
        if (!r.id) { r.id = uuidv4() }

        await ctx.stub.putState(this._getKey(ctx, r.id), r.toBuffer())
        await this.policyContract.newResourceUpdate(ctx, r)
        log.info(`Successfully added new resource of type: ${this.type} with name: ${r.name} and ID: ${r.id}`)
        return `Successfully added new resource of type: ${this.type} with name: ${r.name} and ID: ${r.id}`
    }

    @Transaction()
    public async update(ctx: Context, data: string): Promise<void> {
        // const newPrincipal = new this.objConstructor(data)
        //
        // if (!newPrincipal.id) {
        //     throw new Error('Cannot update principal without providing an ID value')
        // }
        //
        // const key = this._getKey(ctx, newEmp.id)
        // const existing = await ctx.stub.getState(key)
        // const e = new Employee(existing)
        //
        // const { badgeNumber, name, roles, title, department } = newEmp
        // e.badgeNumber = badgeNumber ?? e.badgeNumber
        // e.name = name ?? e.name
        // e.roles = roles ?? e.roles
        // e.title = title ?? e.title
        // e.department = department ?? e.department
        //
        // await ctx.stub.putState(key, e.toBuffer())
    }

    @Transaction(false)
    public async get(ctx: Context, id: string): Promise<T> {
        const existing = await ctx.stub.getState(this._getKey(ctx, id))
        const p = new this.objConstructor(existing)
        log.info(`Successfully retrieved resource with ID: ${p.id}`)
        return p
    }

    @Transaction()
    public async delete(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getKey(ctx, id))
        log.info(`Successfully deleted resource with ID: ${id}`)
        return `Successfully deleted resource with ID: ${id}`
    }

    @Transaction(false)
    public async getAll(ctx: Context): Promise<T[]> {
        const iterator = ctx.stub.getStateByPartialCompositeKey(keyObject, [this.type])
        const resources = new Array<T>()
        for await (const result of iterator) {
            resources.push(new this.objConstructor(result.value))
        }
        return resources
    }

    private _getKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(keyObject, [this.type, id])
    }
}
