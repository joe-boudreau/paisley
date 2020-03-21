class StateObject {

    constructor(bufferOrJson?) {
        if (bufferOrJson) { this.from(bufferOrJson) }
    }

    public from(bufferOrJson: Buffer | any) {
        let json
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return
            }

            json = JSON.parse(bufferOrJson.toString('utf-8'))
        } else {
            json = bufferOrJson
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