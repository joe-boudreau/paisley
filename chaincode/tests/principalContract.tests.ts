jest.mock('fabric-contract-api')
jest.mock('fabric-shim-api')
jest.mock('uuid')
import {Context} from 'fabric-contract-api'
import {ChaincodeStub} from 'fabric-shim-api'
import {mocked} from 'ts-jest/utils'
import {v4 as uuidv4} from 'uuid'
import {PrincipalContract} from '../principalContract'



const mockCtx = mocked(new Context(), true)

mocked(uuidv4).mockResolvedValue('12345')

describe('create', () => {
    it('creates an employee and adds them to the state', () => {
        const emp = {
            badgeNumber: 1234,
            name: 'first last',
            roles: ['user', 'boss'],
            title: 'idiot',
        }

        const contract = new PrincipalContract()

        contract.createEmployee(mockCtx, JSON.stringify(emp))

        expect(mockCtx.stub.putState).toBeCalledWith('employee:12345', null)

    })
})
