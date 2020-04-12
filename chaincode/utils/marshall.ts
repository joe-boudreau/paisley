export class Marshall {

    /**
     * This function attempts to marshall the provided data into the specified object.
     * The data may be a UTF-8 encoded Buffer, a serialized JSON string, or an anonymous object
     * @param data
     * @param obj the object reference to marshall the data into
     * @return the provided object with updated values
     */
    public static marshallToObject(data: Buffer | string | object, obj: object) {
        let json
        if (Buffer.isBuffer(data)) {
            if (!data.length) {
                return
            }

            json = JSON.parse(data.toString('utf-8'), Marshall.reviver)
        } else if (typeof data === 'string') {
            json = JSON.parse(data, Marshall.reviver)
        } else {
            json = data
        }
        return Object.assign(obj, json)
    }

    // replacer and reviver act to serialize and deserialize Set objects
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
