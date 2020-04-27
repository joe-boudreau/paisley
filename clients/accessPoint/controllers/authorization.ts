import { DefaultEventHandlerStrategies, Gateway } from 'fabric-network'
import { Inject } from 'typescript-ioc'
import { FormParam, Path, POST, QueryParam } from 'typescript-rest'
import { WalletService } from '../services/wallet'

@Path('/auth')
export class AuthorizationController {

    @Inject
    private walletService: WalletService

    @Path('/id')
    @POST
    async authorizeByID(@QueryParam('verifyCommit') verifyCommit: boolean = true,
                        authRequest: {principalId: string, resourceId: string})
        : Promise<boolean> {


        const gateway = new Gateway()

        try {

            const username = 'User1'

            const walletInfo = await this.walletService.getWalletOrGenerate(username)

            const connectionOptions = {
                identity: walletInfo.mspName,
                clientTlsIdentity: walletInfo.tlsName,
                wallet: walletInfo.wallet,
                discovery: { enabled: false, asLocalhost: false },
                eventHandlerOptions: {
                    strategy: verifyCommit? DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX : null
                }

            }

            await gateway.connect('ccp.json', connectionOptions)

            const network = await gateway.getNetwork('org-channel')
            const contract = await network.getContract('chaincode', 'access-control')

            const transaction = contract.createTransaction('authorizeById')

            const start = new Date()
            console.log(`Start: ${start.toISOString()}`)

            await transaction.addCommitListener((error: Error, txId: string, status: string, blockNumber: string) => {
                console.log(`txId: ${txId}`)
                console.log(`Status: ${status}`)
                console.log(`Block Number: ${blockNumber}`)

                const commitTime = new Date()
                console.log(`Commit time: ${commitTime.toISOString()}`)
                console.log(`Time to commit (ms): ${commitTime.getTime() - start.getTime()}`)

                if (status !== 'VALID'){
                    console.log(`ERROR: Committed authorization transaction was not VALID. Status: ${status}`)
                }
                if (error) {
                    console.log(`ERROR: ${error.message}`)
                }
            })

            const resp = await transaction.submit(authRequest.principalId, authRequest.resourceId)

            const submitTime = new Date()
            console.log(`Submit time: ${submitTime.toISOString()}`)
            console.log(`Time to submit (ms): ${submitTime.getTime() - start.getTime()}`)

            return resp.toString() === 'true'

        } catch (error) {

            console.log(`Error processing transaction. ${error}`)
            console.log(error.stack)

        }
    }
}
