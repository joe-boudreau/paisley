import Employee from './domain/employee'
import Visitor from './domain/visitor'

import { AbstractPrincipalContract } from './contracts/abstractPrincipalContract'
export { AbstractPrincipalContract } from './contracts/abstractPrincipalContract'
import { PrincipalContract } from './contracts/principalContract'
export { PrincipalContract } from './contracts/principalContract'
import { AreaContract } from './contracts/areaContract'
export { AreaContract } from './contracts/areaContract'
import { PolicyContract } from './contracts/policyContract'
export { PolicyContract } from './contracts/policyContract'

export const contracts: any[] = [new AbstractPrincipalContract<Employee>('employee', Employee),
                                 new AbstractPrincipalContract<Visitor>('visitor', Visitor),
                                 PrincipalContract,
                                 AreaContract,
                                 PolicyContract]
