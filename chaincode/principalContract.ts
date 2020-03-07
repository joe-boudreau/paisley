import {Context, Contract} from 'fabric-contract-api'
import { v4 as uuidv4 } from 'uuid'
import Employee from '../domain/employee'
import {IEmployee} from '../domain/interfaces'

export class PrincipalContract extends Contract {

    constructor() {
        super('principal')
    }

    public async createEmployee(ctx: Context, details: IEmployee): Promise<void> {
        console.info(`============= START : Create New User: ${name} ===========`)

        const e = new Employee(details)

        // Generate ID value if none exists
        if (!e.id) { e.id = uuidv4() }

        await ctx.stub.putState(this._getEmployeeKey(ctx, e.id), e.toBuffer())
        console.info('============= END : Create New User ===========')
    }

    public async updateEmployee(ctx: Context, details: IEmployee): Promise<void> {
        console.info(`============= START : Update User: ${details.id} ===========`)

        if (!details.id) {
            throw new Error('Cannot update employee without providing an ID value')
        }

        const key = this._getEmployeeKey(ctx, details.id)
        const existing = await ctx.stub.getState(key)
        const e = new Employee(existing)

        const { badgeNumber, name, roles, title, department } = details
        e.badgeNumber = badgeNumber ?? e.badgeNumber
        e.name = name ?? e.name
        e.roles = roles ?? e.roles
        e.title = title ?? e.title
        e.department = department ?? e.department

        await ctx.stub.putState(key, e.toBuffer())
        console.info('============= END : Create New User ===========')
    }

    public async getEmployee(ctx: Context, id: string): Promise<Employee> {
        const key = this._getEmployeeKey(ctx, id)
        const existing = await ctx.stub.getState(key)
        return new Employee(existing)
    }

    public async getAllEmployees(ctx: Context, id: string): Promise<Employee[]> {
        const empIterator = await ctx.stub.getStateByPartialCompositeKey('employee', [])
        const employees = new Array<Employee>()
        let e = await empIterator.next()
        while (!e.done) {
            employees.push(new Employee(e.value))
            e = await empIterator.next()
        }
        return employees
    }

    private _getEmployeeKey(ctx, id: string) {
        return ctx.createCompositeKey('employee', [id])
    }
}

module.exports = PrincipalContract
