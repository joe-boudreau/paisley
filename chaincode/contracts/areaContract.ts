import {Context, Transaction} from 'fabric-contract-api'
import {v4 as uuidv4} from 'uuid'
import {IPrincipal} from '../domain/interfaces'
import {Utils} from '../utils'
import {ContractBase} from './contractbase'
import Area from '../domain/area'

export class AreaContract  extends ContractBase {

    constructor() {
        super('area')
    }

    @Transaction()
    public async createArea(ctx: Context, areaJson: string): Promise<void> {
        const a = new Area(areaJson)

        // Generate ID value if none exists
        if (!a.id) { a.id = uuidv4() }

        await ctx.stub.putState(this._getAreaKey(ctx, a.id), a.toBuffer())
    }

    @Transaction()
    public async updateArea(ctx: Context, area: Area | string): Promise<void> {
        const updated = new Area(area)
        if (!updated.id) {
            throw new Error('Cannot update area without providing an ID value')
        }

        const key = this._getAreaKey(ctx, updated.id)
        const existing = await ctx.stub.getState(key)
        const e = new Area(existing)

        const { ingress, egress, name, tags } = updated
        e.ingress = ingress ?? e.ingress
        e.egress = egress ?? e.egress
        e.name = name ?? e.name
        e.tags = tags ?? e.tags

        await ctx.stub.putState(key, e.toBuffer())
    }

    @Transaction()
    public async getArea(ctx: Context, id: string): Promise<Area> {
        const existing = await ctx.stub.getState(this._getAreaKey(ctx, id))
        return new Area(existing)
    }

    @Transaction()
    public async deleteArea(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getAreaKey(ctx, id))
        return `Successfully deleted area ID: ${id}`
    }

    @Transaction()
    public async getAllAreas(ctx: Context): Promise<Area[]> {
        const areaIterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const areas = new Array<Area>()
        for await (const result of areaIterator) {
            areas.push(Utils.marshallToObject(result.value, {}))
        }
        return areas
    }

    private _getAreaKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [id])
    }
}
