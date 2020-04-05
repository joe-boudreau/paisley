import {IAccessEvent} from './interfaces'
import StateObject from './stateobject'

class AccessEvent extends StateObject implements IAccessEvent{
    public id: string
    public granted: boolean
    public principalId: string
    public resourceId: string
    public timestamp: Date = new Date()
    public notes?: string
}

export = AccessEvent
