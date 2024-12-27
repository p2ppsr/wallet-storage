import { Beef, BeefParty, Utils, PrivateKey } from "@bsv/sdk";
import { sdk, stampLog, toWalletNetwork } from '.'

export class Wallet extends sdk.WalletCrypto implements sdk.Wallet {
    signer: sdk.WalletSigner

    beef: BeefParty
    trustSelf?: sdk.TrustSelf
    storageParty: string
    userParty: string
    isLogging: boolean

    constructor(signer: sdk.WalletSigner, keyDeriver?: sdk.KeyDeriverApi) {
        if (!signer.isAuthenticated())
            throw new sdk.WERR_INVALID_PARAMETER('signer', 'valid and authenticated')
        if (!keyDeriver)
            throw new sdk.WERR_INVALID_PARAMETER('keyDeriver', 'valid')
        super(keyDeriver)
        this.signer = signer
        // Give signer access to our keyDeriver
        this.signer.keyDeriver = keyDeriver
        this.storageParty = signer.storageIdentity!.key
        this.userParty = signer.getClientChangeKeyPair().publicKey
        this.beef = new BeefParty([this.storageParty, this.userParty])
        this.trustSelf = 'known'
        this.isLogging = this.signer.chain === 'test'
    }

    startLog(vargs: { log?: string }, name: string) {
        if (vargs.log === undefined) return
        vargs.log = stampLog(vargs.log, `start NinjaWallet ${name}`);
    }

    endLog(vargs: { log?: string }, name: string) {
        if (vargs.log === undefined) return
        vargs.log = stampLog(vargs.log, `end NinjaWallet ${name}`);
        //console.log(stampLogFormat(vargs.log))
    }

    /**
     * @returns the full list of txids whose validity this wallet claims to know.
     * 
     * @param newKnownTxids Optional. Additional new txids known to be valid by the caller to be merged.
     */
    getKnownTxids(newKnownTxids?: string[]) : string[] {
        if (newKnownTxids) {
            for (const txid of newKnownTxids) this.beef.mergeTxidOnly(txid)
        }
        const r = this.beef.sortTxs()
        const knownTxids = r.valid.concat(r.txidOnly)
        return knownTxids
    }

    async listActions(args: sdk.ListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListActionsResult> {
        const vargs = sdk.validateListActionsArgs(args)
        this.startLog(vargs, 'listActions')

        const r = await this.signer.listActions(vargs, sdk.validateOriginator(originator))

        this.endLog(vargs, 'listActions')
        return r
    }

    async listOutputs(args: sdk.ListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListOutputsResult> {
        const vargs = sdk.validateListOutputsArgs(args)
        this.startLog(vargs, 'listOutputs')

        vargs.knownTxids = this.getKnownTxids()

        const r = await this.signer.listOutputs(vargs, sdk.validateOriginator(originator))
        if (r.BEEF) {
            this.beef.mergeBeefFromParty(this.storageParty, r.BEEF)
        }

        this.endLog(vargs, 'listOutputs')
        return r
    }

    //////////////////
    // Certificates
    //////////////////

    async listCertificates(args: sdk.ListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListCertificatesResult> {
        const vargs = sdk.validateListCertificatesArgs(args)
        this.startLog(vargs, 'listCertificates')

        const r = await this.signer.listCertificatesSdk(vargs, sdk.validateOriginator(originator))

        this.endLog(vargs, 'listCertificates')
        return r
    }

    async acquireCertificate(args: sdk.AcquireCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AcquireCertificateResult> {
        originator = sdk.validateOriginator(originator)
        if (args.acquisitionProtocol === 'direct') {
            const vargs = sdk.validateAcquireDirectCertificateArgs(args)
            this.startLog(vargs, 'acquireCertificate direct')
            vargs.subject = (await this.getPublicKey({ identityKey: true, privileged: args.privileged, privilegedReason: args.privilegedReason })).publicKey
            try {
                // Confirm that the information received adds up to a usable certificate...
                await sdk.CertOps.fromCounterparty(this, {
                    certificate: { ...vargs },
                    keyring: vargs.keyringForSubject,
                    counterparty: vargs.keyringRevealer === 'certifier' ? vargs.certifier : vargs.keyringRevealer
                })
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                throw new sdk.WERR_INVALID_PARAMETER('args', `valid encrypted and signed certificate and keyring from revealer. ${e.name}: ${e.message}`);
            }

            const r = await this.signer.acquireCertificateSdk(vargs, originator)

            this.endLog(vargs, 'acquireCertificate direct')
            return r
        }

        if (args.acquisitionProtocol === 'issuance') {
            const vargs = await sdk.validateAcquireCertificateArgs(args)
            throw new sdk.WERR_NOT_IMPLEMENTED()
        }

        throw new sdk.WERR_INVALID_PARAMETER('acquisitionProtocol', `valid. ${args.acquisitionProtocol} is unrecognized.`)
    }

    async relinquishCertificate(args: sdk.RelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.RelinquishCertificateResult> {
        const vargs = sdk.validateRelinquishCertificateArgs(args)
        originator = sdk.validateOriginator(originator)
        this.startLog(vargs, 'relinquishCertificate')

        const r = await this.signer.relinquishCertificateSdk(vargs, originator)

        this.endLog(vargs, 'relinquishCertificate')
        return r
    }

    async proveCertificate(args: sdk.ProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ProveCertificateResult> {
        const vargs = sdk.validateProveCertificateArgs(args)
        originator = sdk.validateOriginator(originator)
        this.startLog(vargs, 'proveCertificate')

        const r = await this.signer.proveCertificateSdk(vargs, originator)

        this.endLog(vargs, 'proveCertificate')
        return r
    }
    
    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.DiscoverCertificatesResult> {
        const vargs = sdk.validateDiscoverByIdentityKeyArgs(args)
        originator = sdk.validateOriginator(originator)
        this.startLog(vargs, 'discoverByIdentityKey')

        const r = await this.signer.discoverByIdentityKeySdk(vargs, originator)

        this.endLog(vargs, 'discoverByIdentityKey')
        return r
    }

    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.DiscoverCertificatesResult> {
        const vargs = sdk.validateDiscoverByAttributesArgs(args)
        originator = sdk.validateOriginator(originator)
        this.startLog(vargs, 'discoverByAttributes')

        const r = await this.signer.discoverByAttributesSdk(vargs, originator)

        this.endLog(vargs, 'discoverByAttributes')
        return r
    }



    //////////////////
    // Actions
    //////////////////

    async createAction(args: sdk.CreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.CreateActionResult> {

        const vargs = sdk.validateCreateActionArgs(args)
        this.startLog(vargs, 'createAction')

        vargs.options.trustSelf ||= this.trustSelf
        vargs.options.knownTxids = this.getKnownTxids(vargs.options.knownTxids)

        const r = await this.signer.createActionSdk(vargs, sdk.validateOriginator(originator))

        if (r.signableTransaction) {
            const st = r.signableTransaction
            const ab = Beef.fromBinary(st.tx)
            if (!ab.atomicTxid)
                throw new sdk.WERR_INTERNAL('Missing atomicTxid in signableTransaction result')
            if (ab.txs.length < 1 || ab.txs[ab.txs.length - 1].txid !== ab.atomicTxid)
                throw new sdk.WERR_INTERNAL('atomicTxid does not match txid of last AtomicBEEF transaction')
            // Remove the new, partially constructed transaction from beef as it will never be a valid transaction.
            ab.txs.slice(ab.txs.length - 1)
            this.beef.mergeBeefFromParty(this.storageParty, ab)
        } else if (r.tx) {
            this.beef.mergeBeefFromParty(this.storageParty, r.tx)
        }

        this.endLog(vargs, 'createAction')
        return r
    }

    async signAction(args: sdk.SignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.SignActionResult> {
        const vargs = sdk.validateSignActionArgs(args)
        this.startLog(vargs, 'signAction')

        const r = await this.signer.signActionSdk(vargs, sdk.validateOriginator(originator))

        this.endLog(vargs, 'signAction')
        return r
    }

    async abortAction(args: sdk.AbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AbortActionResult> {
        const vargs = sdk.validateAbortActionArgs(args)
        this.startLog(vargs, 'abortAction')

        const r = await this.signer.abortActionSdk(args, sdk.validateOriginator(originator))

        this.endLog(vargs, 'abortAction')
        return r
    }

    async internalizeAction(args: sdk.InternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.InternalizeActionResult> {
        const vargs = sdk.validateInternalizeActionArgs(args)
        this.startLog(vargs, 'internalizeAction')

        const r = await this.signer.internalizeActionSdk(vargs, sdk.validateOriginator(originator))

        this.endLog(vargs, 'internalizeAction')
        return r
    }

    async relinquishOutput(args: sdk.RelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.RelinquishOutputResult> {
        const vargs = sdk.validateRelinquishOutputArgs(args)
        this.startLog(vargs, 'relinquishOutput')

        const r = await this.signer.relinquishOutputSdk(vargs, sdk.validateOriginator(originator))

        this.endLog(vargs, 'relinquishOutput')
        return r
    }


    async isAuthenticated(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AuthenticatedResult> {
        const r: { authenticated: boolean; } = {
            authenticated: this.signer.isAuthenticated()
        }
        return r
    }

    async waitForAuthentication(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AuthenticatedResult> {
        await this.signer.authenticate()
        const r: { authenticated: true; } = {
            authenticated: true
        }
        return r
    }

    async getHeight(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetHeightResult> {
        const r = await this.signer.getHeight()
        return { height: r }
    }

    async getHeaderForHeight(args: sdk.GetHeaderArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetHeaderResult> {
        const header = await this.signer.getHeaderForHeight(args.height)
        if (!header)
            throw new sdk.WERR_INVALID_PARAMETER('args.height', `a valid block height. ${args.height} is invalid.`)
        return { header: Utils.toHex(header) }
    }

    async getNetwork(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetNetworkResult> {
        const chain = await this.signer.getChain()
        return { network: toWalletNetwork(chain) }
    }

    async getVersion(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetVersionResult> {
        return { version: 'wallet-brc100-1.0.0' }
    }
}