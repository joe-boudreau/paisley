import {Context, Transaction} from 'fabric-contract-api'
import {Error} from 'tslint/lib/error'
import {v4 as uuidv4} from 'uuid'
import {IPrincipal, IResource, PolicyType} from '../domain/interfaces'
import Policy from '../domain/policy'
import {Utils} from '../utils'
import {AreaContract} from './areaContract'
import { ContractBase } from './contractbase'
import {PrincipalContract} from './principalContract'

function matchingRoles(policy: Policy, principal: IPrincipal): boolean {
    return principal.roles.some(policy.principalRoles.includes)
}

function matchingTags(policy: Policy, resource: IResource): boolean {
    return resource.tags.some(policy.resourceTags.includes)
}

export class PolicyContract  extends ContractBase {
    private readonly principalContract: PrincipalContract
    private readonly areaContract: AreaContract

    constructor() {
        super('policy')
        this.principalContract = new PrincipalContract()
        this.areaContract = new AreaContract()
    }

    @Transaction()
    public async createPolicy(ctx: Context, policyStr: string): Promise<void> {
        const p = new Policy(policyStr)

        this._validatePolicy(p)

        // Generate ID value if none exists
        if (!p.id) { p.id = uuidv4() }

        await ctx.stub.putState(this._getPolicyKey(ctx, p.id), p.toBuffer())

        this._updateResourceAccess(ctx, p)
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
    public async getPolicy(ctx: Context, id: string): Promise<Policy> {
        const existing = await ctx.stub.getState(this._getPolicyKey(ctx, id))
        return new Policy(existing)
    }

    @Transaction()
    public async deletePolicy(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getPolicyKey(ctx, id))
        return `Successfully deleted policy ID: ${id}`
    }

    @Transaction()
    public async getAllPolicies(ctx: Context): Promise<Policy[]> {
        return await this._getPolicies(ctx)
    }

    @Transaction()
    public async getAllPoliciesRelatedToPrincipal(ctx: Context, p: IPrincipal): Promise<Policy[]> {
        return await this._getPolicies(ctx, (policy: Policy) => policy.principalId === p.id || matchingRoles(policy, p))
    }

    public async updateResourceAccessForPrincipal(ctx: Context, principalContract: PrincipalContract, p: IPrincipal) {
        const policies = await this.getAllPoliciesRelatedToPrincipal(ctx, p)

    }

    private async _getPolicies(ctx: Context, filter?: (p: Policy) => boolean) {
        const policyIterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const policies = new Array<Policy>()
        for await (const result of policyIterator) {
            policies.push(Utils.marshallToObject(result.value, {}))
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

    private async _updateResourceAccess(ctx: Context, p: Policy): Promise<void> {
        const resources = await this._getResourceIDsUnderPolicy(ctx, p)
        const principalMap = await this._getPrincipalsUnderPolicy(ctx, p)

        principalMap.forEach((principal, id) => {
            resources.forEach(principal.resourceGrants.add)
            this.principalContract.updatePrincipalByID(ctx, id, principal)
        })
    }

    private async _getResourceIDsUnderPolicy(ctx: Context, p: Policy): Promise<string[]> {
        switch (p.type) {
            case PolicyType.ID_RESOURCE:
            case PolicyType.ROLES_RESOURCE: {
                return [(await this.areaContract.getArea(ctx, p.resourceId)).id]
            }

            case PolicyType.ID_TAGS:
            case PolicyType.ROLES_TAGS: {
                const resources = await this.areaContract.getAllAreas(ctx)
                return resources.filter((resource) => matchingTags(p, resource))
                    .map((a) => a.id)
            }
        }
    }

    private async _getPrincipalsUnderPolicy(ctx: Context, p: Policy): Promise<Map<string, IPrincipal>> {
        switch (p.type) {
            case PolicyType.ID_TAGS:
            case PolicyType.ID_RESOURCE: {
                const result = await this.principalContract.getPrincipalByID(ctx, p.principalId)
                return new Map([result])
            }

            case PolicyType.ROLES_TAGS:
            case PolicyType.ROLES_RESOURCE: {
                const principalMap = await this.principalContract.getAllPrincipals(ctx)
                principalMap.forEach((v, k, map) => {
                    if (!matchingRoles(p, v)) {
                        map.delete(k)
                    }
                })
                return principalMap
            }
        }
    }

    private _getPolicyKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [id])
    }
}
