import Employee from '../domain/employee'

describe('test', () => {
    it('test', () => {
        const json = {
            badgeNumber: 1234,
            id: 'idddd',
            name: 'first last',
            roles: ['user', 'boss'],
            title: 'idiot',
        }

        const e = new Employee()
        e.from(json)
        console.log(e.toJson())

        const buffer = e.toBuffer()

        const e2 = new Employee(buffer)
        console.log(e2.toJson())
    })
})
