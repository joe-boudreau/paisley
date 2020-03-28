import {IArea} from './interfaces'
import StateObject from './stateobject'

class Area extends StateObject implements IArea {
    public ingress: string[]
    public egress: string[]
    public id: string
    public name: string
    public tags: string[]
}

export = Area
