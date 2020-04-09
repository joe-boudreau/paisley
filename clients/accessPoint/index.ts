import { FileSystemWallet, Gateway } from 'fabric-network'
import fs from 'fs'
import { generateWallet } from './addToWallet'

async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await new FileSystemWallet('wallet')

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway()

    try {

        // Specify username for network access
        const username = 'user'

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.exists(username)
        if (!userIdentity) {
            console.log(`An identity for the user ${username} does not exist, generating wallet now...`)
            await generateWallet()
        }

        // Set connection options identity and wallet
        let connectionOptions = {
            identity: username,
            wallet: wallet,
            discovery: { enabled: true, asLocalhost: true }

        }

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.')

        await gateway.connect("ccp.json", connectionOptions)

        const clientKey = fs.readFileSync('../../network/crypto-config/peerOrganizations/org1.companyABC.com/users/User1@org1.companyABC.com/tls/client.key')
        const clientCert = fs.readFileSync('../../network/crypto-config/peerOrganizations/org1.companyABC.com/users/User1@org1.companyABC.com/tls/client.crt')

        gateway.getClient().setTlsClientCertAndKey(Buffer.from(clientCert).toString(), Buffer.from(clientKey).toString());

        const network = await gateway.getNetwork('org-channel')

        const contract = await network.getContract('chaincode', 'principal')

        const response = await contract.evaluateTransaction('getAll')

        console.log(`Get All response: ${response.toString()}`)

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
