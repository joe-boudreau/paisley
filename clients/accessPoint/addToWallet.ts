import { FileSystemWallet, X509WalletMixin } from 'fabric-network'
import fs from 'fs'
import * as path from 'path'

export async function generateWallet(username: string) {
    try {
        const wallet = await new FileSystemWallet('wallet')

        // User MSP Identity
        const userMspPath = path.join('../../network/crypto-config/peerOrganizations/org1.companyABC.com/users/User1@org1.companyABC.com/msp')
        const mspCert = fs.readFileSync(path.join(userMspPath, '/signcerts/User1@org1.companyABC.com-cert.pem')).toString()
        const mspKey = fs.readFileSync(path.join(userMspPath, '/keystore/priv_sk')).toString()
        const mspIdentity = X509WalletMixin.createIdentity('Org1MSP', mspCert, mspKey)

        // User TLS Identity
        const userTlsPath = path.join('../../network/crypto-config/peerOrganizations/org1.companyABC.com/users/User1@org1.companyABC.com/tls')
        const tlsCert = fs.readFileSync(path.join(userTlsPath, '/client.crt')).toString()
        const tlsKey = fs.readFileSync(path.join(userTlsPath, '/client.key')).toString()
        const tlsIdentity = X509WalletMixin.createIdentity('Org1MSP', tlsCert, tlsKey)

        // Load credentials into wallet
        await wallet.import(`${username}MSP`, mspIdentity)
        await wallet.import(`${username}TLS`, tlsIdentity)

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`)
        console.log(error.stack)
    }
}
