import Employee from '../../domain/employee'
import { AbstractPrincipalContract } from './abstractPrincipalContract'

export class EmployeeContract extends AbstractPrincipalContract<Employee> {constructor() {super('employee', Employee)}}

