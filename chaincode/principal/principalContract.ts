import {Context, Transaction} from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'
import { ContractBase } from './contractbase'
import Employee from './domain/employee'

export class PrincipalContract  extends ContractBase {

    constructor() {
        super('principal')
    }

    @Transaction()
    public async createEmployee(ctx: Context, employeeStr: string): Promise<void> {
        const e = new Employee(employeeStr)

        // Generate ID value if none exists
        if (!e.id) { e.id = uuidv4() }

        await ctx.stub.putState(this._getEmployeeKey(ctx, e.id), e.toBuffer())
    }

    @Transaction()
    public async updateEmployee(ctx: Context, employeeStr: string): Promise<void> {
        const newEmp = new Employee(employeeStr)
        if (!newEmp.id) {
            throw new Error('Cannot update employee without providing an ID value')
        }

        const key = this._getEmployeeKey(ctx, newEmp.id)
        const existing = await ctx.stub.getState(key)
        const e = new Employee(existing)

        const { badgeNumber, name, roles, title, department } = newEmp
        e.badgeNumber = badgeNumber ?? e.badgeNumber
        e.name = name ?? e.name
        e.roles = roles ?? e.roles
        e.title = title ?? e.title
        e.department = department ?? e.department

        await ctx.stub.putState(key, e.toBuffer())
    }

    @Transaction()
    public async getEmployee(ctx: Context, id: string): Promise<string> {
        const key = this._getEmployeeKey(ctx, id)
        const existing = await ctx.stub.getState(key)
        return new Employee(existing).toJson()
    }

    @Transaction()
    public async getAllEmployees(ctx: Context): Promise<string[]> {
        const empIterator = await ctx.stub.getStateByPartialCompositeKey('employee', [])
        const employees = new Array<string>()
        let e = await empIterator.next()
        while (!e.done) {
            employees.push(new Employee(e.value).toJson())
            e = await empIterator.next()
        }
        return employees
    }

    private _getEmployeeKey(ctx: Context, id: string) {
        return ctx.stub.createCompositeKey('employee', [id])
    }
}
