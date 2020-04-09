import { IEmployee } from './interfaces'
import StateObject = require('./stateobject')


class Employee extends StateObject implements IEmployee {
    public badgeNumber: number
    public id: string
    public name: string
    public roles: string[]
    public title: string
    public department: string
    public resourceGrants: Set<string>
}

export = Employee
