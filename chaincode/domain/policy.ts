import {IPolicy, PolicyType} from './interfaces'
import StateObject from './stateobject'

class Policy extends StateObject implements IPolicy {
    public id?: string
    public type: PolicyType
    public principalId?: string
    public principalRoles?: string[]
    public resourceId?: string
    public resourceTags?: string[]
}

// {
//     "type": 2,
//     "principalRoles": ["Employee"],
//     "resourceTags": ["common"]
// }

export = Policy
