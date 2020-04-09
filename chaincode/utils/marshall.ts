import log from './log'

export class Marshall {

    public static marshallToObject(data: Buffer | string | object, obj: object) {
        let json
        if (Buffer.isBuffer(data)) {
            if (!data.length) {
                return
            }

            const buf = data.toString('utf-8')
            log.info(`Buffer passed: ${buf}`)
            json = JSON.parse(buf, Marshall.reviver)
        } else if (typeof data === 'string') {
            log.info(`String passed: ${data}`)
            json = JSON.parse(data, Marshall.reviver)
        } else {
            log.warn(`Direct object passed to be marshalled: ${JSON.stringify(data)}`)
            json = data
        }
        return Object.assign(obj, json)
    }

    public static replacer(key: string, value: any) {
        const originalObject = this[key]
        if (originalObject instanceof Set) {
            return {
                dataType: 'Set',
                value: [...originalObject],
            }
        } else {
            return value
        }
    }

    public static reviver(key: string, value: any) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Set') {
                return new Set(value.value)
            }
        }
        return value
    }
}
