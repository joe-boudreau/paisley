import {Marshall} from '../utils/marshall'

class StateObject {

    constructor(data?: Buffer | string | object) {
        if (data) { Marshall.marshallToObject(data, this) }
    }

    public toJson(): string {
        return JSON.stringify(this, Marshall.replacer)
    }

    public toBuffer(): Buffer {
        return Buffer.from(this.toJson())
    }
}

export = StateObject
