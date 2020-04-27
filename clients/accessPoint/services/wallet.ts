import { FileSystemWallet, Wallet, X509WalletMixin } from 'fabric-network'
import fs from 'fs'
import * as path from 'path'

export type WalletInfo = {
    wallet: Wallet
    mspName: string
    tlsName: string
}

export class WalletService {

    async getWalletOrGenerate(username: string): Promise<WalletInfo> {
        try {

            const wallet = await new FileSystemWallet('wallet')
            const mspName = `${username}MSP`
            const tlsName = `${username}TLS`

            if (await wallet.exists(mspName) && await wallet.exists(mspName)) {
                console.log(`An identity for the user ${username} already exists in the wallet, returning wallet and identities`)
                return {wallet, mspName, tlsName}
            }

            console.log(`An identity for the user ${username} does not exist in the wallet, generating now...`)

            // User MSP Identity
            const userMspPath = path.join(`crypto-config/peerOrganizations/org1.companyABC.com/users/${username}@org1.companyABC.com/msp`)
            const mspCert = fs.readFileSync(path.join(userMspPath, '/signcerts/User1@org1.companyABC.com-cert.pem')).toString()
            const mspKey = fs.readFileSync(path.join(userMspPath, '/keystore/priv_sk')).toString()
            const mspIdentity = X509WalletMixin.createIdentity('Org1MSP', mspCert, mspKey)

            // User TLS Identity
            const userTlsPath = path.join(`crypto-config/peerOrganizations/org1.companyABC.com/users/${username}@org1.companyABC.com/tls`)
            const tlsCert = fs.readFileSync(path.join(userTlsPath, '/client.crt')).toString()
            const tlsKey = fs.readFileSync(path.join(userTlsPath, '/client.key')).toString()
            const tlsIdentity = X509WalletMixin.createIdentity('Org1MSP', tlsCert, tlsKey)

            // Load credentials into wallet
            await wallet.import(mspName, mspIdentity)
            await wallet.import(tlsName, tlsIdentity)
            return {wallet, mspName, tlsName}

        } catch (error) {
            console.log(`Error adding to wallet. ${error}`)
            console.log(error.stack)
            throw error
        }
    }
}
