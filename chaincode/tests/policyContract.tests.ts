import { PolicyContract } from '../contracts/policyContract'
import Employee from '../domain/employee'
import {IPrincipal} from '../domain/interfaces'
import Policy from '../domain/policy'
import log from '../utils/log'

function matchingRoles(policy: Policy, principal: IPrincipal): boolean {
    return principal.roles.some(policy.principalRoles.includes, policy.principalRoles)
}

function addResourcesToPrincipal(principal: IPrincipal, resources: string[]) {
    log.info(`Updating resource action for principal ${principal.name}, ID: ${principal.id}`)
    if (!principal.resourceGrants) {
        principal.resourceGrants = new Set()
    }
    resources.forEach(principal.resourceGrants.add, principal.resourceGrants)
}


describe('resource tag matching', () => {
    it('matches tags appropriately', () => {
        const resources = ['common-area']
        const principal = new Employee()
        addResourcesToPrincipal(principal, resources)
        expect(principal.resourceGrants).toContain('common-area')
    })
})


describe('resource tag matching', () => {
    it('matches tags appropriately', () => {
        const policy = new Policy()
        policy.principalRoles = ['employee']
        const principal = new Employee()
        principal.roles = ['employee']

        expect(matchingRoles(policy, principal)).toBeTruthy()
    })
})
