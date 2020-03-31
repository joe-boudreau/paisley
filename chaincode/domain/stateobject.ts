import {Utils} from '../utils'

class StateObject {

    constructor(data?: Buffer | string | object) {
        if (data) { Utils.marshallToObject(data, this) }
    }

    public toJson(): string {
        return JSON.stringify(this, Utils.replacer)
    }

    public toBuffer(): Buffer {
        return Buffer.from(this.toJson())
    }
}

export = StateObject
