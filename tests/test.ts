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

        let buffer = e.toBuffer();

        const e2 = new Employee(buffer)
        console.log(e2.toJson())
    })

    it('tsest2', () => {
        const foo = {
            foo: 'foofdfdd'
        }

        destruct(foo)
    })
})

function destruct(foo){
    const { bar } = foo
    console.log(bar)
    if(!bar) console.log('not there')
}
