import {IVisitor} from './interfaces'
import StateObject from './stateobject'

class Visitor extends StateObject implements IVisitor {
    public badgeNumber: number
    public department: string
    public expiry: Date
    public id: string
    public name: string
    public resourceGrants: Set<string>
    public roles: string[]
    public title: string
}

export = Visitor
