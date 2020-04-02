import {EmployeeContract} from './contracts/principal/employeeContract'
export {EmployeeContract} from './contracts/principal/employeeContract'
import { PrincipalContract } from './contracts/principal/principalContract'
export { PrincipalContract } from './contracts/principal/principalContract'
import {VisitorContract} from './contracts/principal/visitorContract'
export {VisitorContract} from './contracts/principal/visitorContract'
import { AreaContract } from './contracts/resource/areaContract'
export { AreaContract } from './contracts/resource/areaContract'
import { PolicyContract } from './contracts/policyContract'
export { PolicyContract } from './contracts/policyContract'

export const contracts: any[] = [EmployeeContract,
                                 VisitorContract,
                                 PrincipalContract,
                                 AreaContract,
                                 PolicyContract]
