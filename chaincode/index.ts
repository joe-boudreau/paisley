import { AccessControlContract } from './contracts/accessControlContract'
export { AccessControlContract } from './contracts/accessControlContract'
import { EmployeeContract } from './contracts/principal/employeeContract'
export { EmployeeContract } from './contracts/principal/employeeContract'
import { PrincipalContract } from './contracts/principal/principalContract'
export { PrincipalContract } from './contracts/principal/principalContract'
import { VisitorContract } from './contracts/principal/visitorContract'
export { VisitorContract } from './contracts/principal/visitorContract'
import { AreaContract } from './contracts/resource/areaContract'
export { AreaContract } from './contracts/resource/areaContract'
import { PolicyContract } from './contracts/policyContract'
export { PolicyContract } from './contracts/policyContract'
import { ResourceContract } from './contracts/resource/resourceContract'
export { ResourceContract } from './contracts/resource/resourceContract'

// All contracts available to the chaincode - any new contracts must be imported to this file, exported, and also added
// to the contracts array
export const contracts: any[] = [EmployeeContract,
                                 VisitorContract,
                                 PrincipalContract,
                                 ResourceContract,
                                 AreaContract,
                                 PolicyContract,
                                 AccessControlContract]
