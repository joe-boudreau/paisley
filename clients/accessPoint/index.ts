import { FileSystemWallet, Gateway } from 'fabric-network'
import { generateWallet } from './addToWallet'

async function main() {

    const wallet = await new FileSystemWallet('wallet')
    const gateway = new Gateway()

    try {

        const username = 'user'
        const mspIdentity = `${username}MSP`
        const tlsIdentity = `${username}TLS`

        if (!await wallet.exists(mspIdentity) || !await wallet.exists(tlsIdentity)) {
            console.log(`An identity for the user ${username} does not exist, generating wallet now...`)
            await generateWallet(username)
        }

        let connectionOptions = {
            identity: mspIdentity,
            clientTlsIdentity: tlsIdentity,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        }

        await gateway.connect("ccp.json", connectionOptions)

        const network = await gateway.getNetwork('org-channel')
        const contract = await network.getContract('chaincode', 'access-control')

        const transaction = contract.createTransaction('authorizeById')
        const start = new Date()

        console.log(`Start: ${start}`)
        await transaction.addCommitListener((error: Error, txId: string, status: string, blockNumber: string) => {
            if(error) {
                console.log(`Error: ${error.message}`)
            }
            console.log(`txId: ${txId}`)
            console.log(`Status: ${status}`)
            console.log(`Block Number: ${blockNumber}`)

            const commitTime = new Date()
            console.log(`Commit time: ${commitTime}`)
            console.log(`Time to commit: ${commitTime.getTime() - start.getTime()}`)
        })

        const resp = await transaction.submit("74d4a01b-7260-41de-bceb-caecd8813ade", "5db22aeb-6701-4fdd-a18a-adcf384aaa62")

        const submitTime = new Date()
        console.log(`Submit time: ${submitTime}`)
        console.log(`Time to submit: ${submitTime.getTime() - start.getTime()}`)

        console.log(`Authorization response: ${resp.toString()}`)

    } catch (error) {

        console.log(`Error processing transaction. ${error}`)
        console.log(error.stack)

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.')
        gateway.disconnect()

    }
}
main().then(() => {

    console.log('complete.')

}).catch((e) => {

    console.log('Error occurred')
    console.log(e)
    console.log(e.stack)
    process.exit(-1)

})
