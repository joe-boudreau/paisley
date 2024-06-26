import { Context, Transaction } from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'
import { IPrincipal, IResource, PolicyType } from '../domain/interfaces'
import Policy from '../domain/policy'
import log from '../utils/log'
import { Marshall } from '../utils/marshall'
import { ContractBase } from './contractbase'
import { PrincipalContract } from './principal/principalContract'
import { ResourceContract } from './resource/resourceContract'

/**
 * Policy Contract contains all the business logic maintaining resource access for principals. Resource access is stored
 * as a derived field in each IPrincipal entity. This 'pre-calculation' of access rights ensures that real-time access
 * events are responded to as quickly as possible.
 */
export class PolicyContract extends ContractBase {
    private readonly principalContract: PrincipalContract
    private readonly resourceContract: ResourceContract

    constructor() {
        super('policy')
        this.principalContract = new PrincipalContract()
        this.resourceContract = new ResourceContract()
    }

    @Transaction()
    public async create(ctx: Context, policyStr: string): Promise<string> {

        try {
            const p = new Policy(policyStr)

            this._validatePolicy(p)

            // Generate ID value if none exists
            if (!p.id) { p.id = uuidv4() }

            await ctx.stub.putState(this._getKey(ctx, p.id), p.toBuffer())
            log.info(`Added new policy with id ${p.id}`)
            await this._updateResourceAccess(ctx, p)
            return `Successfully added new access policy of type: ${PolicyType[p.type]} with ID: ${p.id}`
        } catch (error) {
            log.error(`Error while creating new policy: ${error.message}`)
            throw error
        }
    }

    @Transaction()
    public async update(ctx: Context, policyStr: string): Promise<void> {
        const newPolicy = new Policy(policyStr)

        if (!newPolicy.id) {
            throw new Error('Cannot update policy without providing an ID value')
        }

        const key = this._getKey(ctx, newPolicy.id)

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

    @Transaction(false)
    public async get(ctx: Context, id: string): Promise<Policy> {
        const existing = await ctx.stub.getState(this._getKey(ctx, id))
        return new Policy(existing)
    }

    @Transaction()
    public async delete(ctx: Context, id: string): Promise<string> {
        await ctx.stub.deleteState(this._getKey(ctx, id))
        // TODO: Update resource access for all principals
        return `Successfully deleted policy ID: ${id}`
    }

    @Transaction(false)
    public async getAll(ctx: Context): Promise<Policy[]> {
        return await this._getPolicies(ctx)
    }

    public async AddResourceAccessToPrincipal(ctx: Context, p: IPrincipal) {
        const {name, id} = p
        const policies = await this.getAllPoliciesRelatedToPrincipal(ctx, p)

        for (const policy of policies) {
            const resources = await this._getResourceIDsUnderPolicy(ctx, policy)
            this.addResourcesToPrincipal(p, resources)
        }
        log.info(`Principal ID: ${id}, Name: ${name} granted access to the following resources: ${JSON.stringify(p.resourceGrants)}`)
    }

    public async newResourceUpdate(ctx: Context, r: IResource) {
        const policies = await this.getAllPoliciesRelatedToResource(ctx, r)

        for (const policy of policies) {
            const principalMap = await this._getPrincipalsUnderPolicy(ctx, policy)
            for (const [id, p] of principalMap) {
                this.addResourcesToPrincipal(p, [r.id]) // only add the new resource to the resource list
                await this.principalContract.updateByID(ctx, id, p)
                log.info(`Principal ID: ${p.id}, Name: ${p.name} granted access to new resource: ${r.name}`)
            }
        }
    }

    private async getAllPoliciesRelatedToPrincipal(ctx: Context, p: IPrincipal): Promise<Policy[]> {
        return await this._getPolicies(ctx, (policy: Policy) => policy.principalId === p.id || matchingRoles(policy, p))
    }

    private async getAllPoliciesRelatedToResource(ctx: Context, r: IResource): Promise<Policy[]> {
        return await this._getPolicies(ctx, (policy: Policy) => policy.resourceId === r.id || matchingTags(policy, r))
    }

    private async _getPolicies(ctx: Context, filter?: (p: Policy) => boolean): Promise<Policy[]> {
        const policyIterator = ctx.stub.getStateByPartialCompositeKey(this.getName(), [])
        const policies = new Array<Policy>()
        for await (const result of policyIterator) {
            policies.push(Marshall.marshallToObject(result.value, {}))
        }
        return filter ? policies.filter(filter) : policies
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
        const principalMap = await this._getPrincipalsUnderPolicy(ctx, p)
        log.debug(`Principals matching policy: ${Array.from(principalMap.values()).map((prn) => prn.name).toString()}`)

        const resources = await this._getResourceIDsUnderPolicy(ctx, p)
        log.debug(`Resources matching policy: ${resources.toString()}`)

        for (const [id, principal] of principalMap) {
            this.addResourcesToPrincipal(principal, resources)
            await this.principalContract.updateByID(ctx, id, principal)
        }
    }

    private addResourcesToPrincipal(principal: IPrincipal, resources: string[]) {
        log.info(`Updating resource action for principal ${principal.name}, ID: ${principal.id}`)
        if (!principal.resourceGrants) {
            principal.resourceGrants = new Set()
        }
        resources.forEach((r) => principal.resourceGrants.add(r))
    }

    private async _getResourceIDsUnderPolicy(ctx: Context, p: Policy): Promise<string[]> {
        switch (p.type) {
            case PolicyType.ID_RESOURCE:
            case PolicyType.ROLES_RESOURCE: {
                const [_, resource] = await this.resourceContract.getByIDWithKey(ctx, p.resourceId)
                return [resource.id]
            }

            case PolicyType.ID_TAGS:
            case PolicyType.ROLES_TAGS: {
                const resourceMap = await this.resourceContract.getAllMap(ctx)
                return Array.from(resourceMap.values())
                    .filter((resource) => matchingTags(p, resource))
                    .map((r) => r.id)
            }
        }
    }

    private async _getPrincipalsUnderPolicy(ctx: Context, p: Policy): Promise<Map<string, IPrincipal>> {
        switch (p.type) {
            case PolicyType.ID_TAGS:
            case PolicyType.ID_RESOURCE: {
                const result = await this.principalContract.getByIDWithKey(ctx, p.principalId)
                return new Map([result])
            }

            case PolicyType.ROLES_TAGS:
            case PolicyType.ROLES_RESOURCE: {
                const principalMap = await this.principalContract.getAllMap(ctx)
                log.debug(`Result of principal contract get all: ${Array.from(principalMap.values()).map((prn) => prn.name).toString()}`)

                principalMap.forEach((v, k, map) => {
                    if (!matchingRoles(p, v)) {
                        map.delete(k)
                    }
                })
                return principalMap
            }
        }
    }

    private _getKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey(this.getName(), [id])
    }
}

function matchingRoles(policy: Policy, principal: IPrincipal): boolean {
    return principal.roles.some((r) => policy.principalRoles.includes(r))
}

function matchingTags(policy: Policy, resource: IResource): boolean {
    return resource.tags.some((t) => policy.resourceTags.includes(t))
}
