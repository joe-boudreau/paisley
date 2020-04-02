import {Context, Transaction} from 'fabric-contract-api'
import log4js from 'log4js'
import {v4 as uuidv4} from 'uuid'
import {IPrincipal} from '../../domain/interfaces'
import StateObject from '../../domain/stateobject'
import {ContractBase} from '../contractbase'

log4js.configure('log4js.json')
const log = log4js.getLogger()

export class AbstractPrincipalContract<T extends StateObject> extends ContractBase {
    private readonly objConstructor: new (d?) => T & IPrincipal
    private readonly type: string

    constructor(type: string, Tconstructor: (new (d?) => T & IPrincipal)) {
        super(`principal-${type}`)
        this.type = type
        this.objConstructor = Tconstructor
    }

    @Transaction()
    public async create(ctx: Context, data: string): Promise<string> {
        const p = new this.objConstructor(data)

        // Generate ID value if none exists
        if (!p.id) { p.id = uuidv4() }

        await ctx.stub.putState(this._getKey(ctx, p.id), p.toBuffer())
        log.info(`Successfully added new principal of type: ${this.type} with name: ${p.name} and ID: ${p.id}`)
        return `Successfully added new principal of type: ${this.type} with name: ${p.name} and ID: ${p.id}`
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

    @Transaction()
    public async get(ctx: Context, id: string): Promise<T> {
        const existing = await ctx.stub.getState(this._getKey(ctx, id))
        const p = new this.objConstructor(existing)
        log.info(`Successfully retrieved principal with ID: ${p.id}`)
        return p
    }

    @Transaction()
    public async delete(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getKey(ctx, id))
        log.info(`Successfully deleted principal with ID: ${id}`)
        return `Successfully deleted principal with ID: ${id}`
    }

    @Transaction()
    public async getAll(ctx: Context): Promise<T[]> {
        const iterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [this.type])
        const principals = new Array<T>()
        for await (const result of iterator) {
            principals.push(new this.objConstructor(result.value))
        }
        return principals
    }

    private _getKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [this.type, id])
    }
}
