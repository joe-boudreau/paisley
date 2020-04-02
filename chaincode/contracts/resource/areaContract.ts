import Area from '../../domain/area'
import {AbstractResourceContract} from './abstractResourceContract'

export class AreaContract extends AbstractResourceContract<Area> {

    constructor() {
        super('area', Area)
    }
}
