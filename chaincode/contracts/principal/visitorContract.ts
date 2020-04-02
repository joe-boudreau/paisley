import Visitor from '../../domain/visitor'
import {AbstractPrincipalContract} from './abstractPrincipalContract'

export class VisitorContract extends AbstractPrincipalContract<Visitor> {

    constructor() {
        super('visitor', Visitor)
    }
}
