import {Context, Transaction} from 'fabric-contract-api'
import {Error} from 'tslint/lib/error'
import {v4 as uuidv4} from 'uuid'
import { ContractBase } from './contractbase'
import {PolicyType} from './domain/interfaces'
import Policy from './domain/policy'

class PolicyContract  extends ContractBase {

    constructor() {
        super('policy')
    }

    @Transaction()
    public async createPolicy(ctx: Context, policyStr: string): Promise<void> {
        const p = new Policy(policyStr)

        this._validatePolicy(p)

        // Generate ID value if none exists
        if (!p.id) { p.id = uuidv4() }

        await ctx.stub.putState(this._getPolicyKey(ctx, p.id), p.toBuffer())
    }

    @Transaction()
    public async updatePolicy(ctx: Context, policyStr: string): Promise<void> {
        const newPolicy = new Policy(policyStr)

        if (!newPolicy.id) {
            throw new Error('Cannot update policy without providing an ID value')
        }

        const key = this._getPolicyKey(ctx, newPolicy.id)

        const existing = await ctx.stub.getState(key)
        const p = new Policy(existing)

        const { type, principalId, principalRoles, resourceId, resourceTags } = newPolicy
        p.type = type ?? p.type
        p.principalId = principalId ?? p.principalId
        p.principalRoles = principalRoles ?? p.principalRoles
        p.resourceId = resourceId ?? p.resourceId
        p.resourceTags = resourceTags ?? p.resourceTags

        this._validatePolicy(p)

        await ctx.stub.putState(key, p.toBuffer())
    }

    @Transaction()
    public async getPolicy(ctx: Context, id: string): Promise<string> {
        const existing = await ctx.stub.getState(this._getPolicyKey(ctx, id))
        return new Policy(existing).toJson()
    }

    @Transaction()
    public async deletePolicy(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getPolicyKey(ctx, id))
        return `Successfully deleted policy ID: ${id}`
    }

    @Transaction()
    public async getAllPolicies(ctx: Context): Promise<string[]> {
        const policyIterator = await ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const policies = new Array<string>()
        let p = await policyIterator.next()
        while (!p.done) {
            policies.push(new Policy(p.value).toJson())
            p = await policyIterator.next()
        }
        return policies
    }

    private _validatePolicy(p: Policy) {
        switch (p.type) {
            case PolicyType.ID_RESOURCE: {
                if (!p.principalId || !p.resourceId) {
                    throw new Error(
                        'Must include principal ID and resource ID with specified policy type')
                }
                break
            }
            case PolicyType.ID_TAGS: {
                if (!p.principalId || !p.resourceTags || p.resourceTags.length === 0) {
                    throw new Error(
                        'Must include principal ID and at least one resource tag with specified policy type')
                }
                break
            }
            case PolicyType.ROLES_RESOURCE: {
                if (!p.principalRoles || p.principalRoles.length === 0 || !p.resourceId) {
                    throw new Error(
                        'Must include at least one principal role and resource ID with specified policy type')
                }
                break
            }
            case PolicyType.ROLES_TAGS: {
                if (!p.principalRoles || p.principalRoles.length === 0 ||
                    !p.resourceTags || p.resourceTags.length === 0) {
                    throw new Error(
                        'Must include at least one role and at least one tag with specified policy type')
                }
                break
            }
        }
    }

    private _getPolicyKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [id])
    }
}
