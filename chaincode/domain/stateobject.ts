class StateObject {

    constructor(data?: Buffer | string | object) {
        if (data) { this.from(data) }
    }

    public from(data: Buffer | string | object) {
        let json
        if (Buffer.isBuffer(data)) {
            if (!data.length) {
                return
            }

            json = JSON.parse(data.toString('utf-8'))
        } else if (typeof data === 'string') {
            json = JSON.parse(data)
        } else {
            json = data
        }
        return Object.assign(this, json)
    }

    public toJson(): string {
        return JSON.stringify(this)
    }

    public toBuffer(): Buffer {
        return Buffer.from(this.toJson())
    }
}

export = StateObject
