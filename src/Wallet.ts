import { Beef, BeefParty, Utils, PrivateKey } from "@bsv/sdk";
import { sdk, stampLog, toWalletNetwork, Monitor } from '.'

export class Wallet extends sdk.WalletCrypto implements sdk.Wallet {
    signer: sdk.WalletSigner
    services?: sdk.WalletServices
    monitor?: Monitor

    beef: BeefParty
    trustSelf?: sdk.TrustSelf
    storageParty: string
    userParty: string

    constructor(signer: sdk.WalletSigner, keyDeriver?: sdk.KeyDeriverApi, services?: sdk.WalletServices, monitor?: Monitor) {
        if (!keyDeriver)
            throw new sdk.WERR_INVALID_PARAMETER('keyDeriver', 'valid')
        super(keyDeriver)
        this.signer = signer
        // Give signer access to our keyDeriver
        this.signer.keyDeriver = keyDeriver
        this.services = services
        this.monitor = monitor

        this.storageParty = signer.storageIdentity!.storageIdentityKey
        this.userParty = signer.getClientChangeKeyPair().publicKey
        this.beef = new BeefParty([this.storageParty, this.userParty])
        this.trustSelf = 'known'

        if (services) {
            signer.setServices(services)
        }
    }

    getServices() : sdk.WalletServices {
        if (!this.services)
            throw new sdk.WERR_INVALID_PARAMETER('services', 'valid in constructor arguments to be retreived here.')
        return this.services
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
        const knownTxids = r.valid
        return knownTxids
    }

    //////////////////
    // List Methods
    //////////////////

    async listActions(args: sdk.ListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListActionsResult> {
        sdk.validateOriginator(originator)
        sdk.validateListActionsArgs(args)
        const r = await this.signer.listActions(args)
        return r
    }

    async listOutputs(args: sdk.ListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListOutputsResult> {
        sdk.validateOriginator(originator)
        sdk.validateListOutputsArgs(args)
        const knownTxids = this.getKnownTxids()
        const r = await this.signer.listOutputs(args, knownTxids)
        if (r.BEEF) {
            this.beef.mergeBeefFromParty(this.storageParty, r.BEEF)
        }
        return r
    }

    async listCertificates(args: sdk.ListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ListCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateListCertificatesArgs(args)
        const r = await this.signer.listCertificates(args)
        return r
    }

    //////////////////
    // Certificates
    //////////////////

    async acquireCertificate(args: sdk.AcquireCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AcquireCertificateResult> {
        sdk.validateOriginator(originator)
        if (args.acquisitionProtocol === 'direct') {
            const vargs = sdk.validateAcquireDirectCertificateArgs(args)
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

            const r = await this.signer.acquireDirectCertificate(args)
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
        sdk.validateOriginator(originator)
        sdk.validateRelinquishCertificateArgs(args)
        const r = await this.signer.relinquishCertificate(args)
        return r
    }

    async proveCertificate(args: sdk.ProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.ProveCertificateResult> {
        originator = sdk.validateOriginator(originator)
        sdk.validateProveCertificateArgs(args)
        const r = await this.signer.proveCertificate(args)
        return r
    }
    
    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.DiscoverCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateDiscoverByIdentityKeyArgs(args)

        // TODO: Probably does not get dispatched to signer?
        const r = await this.signer.discoverByIdentityKey(args)

        return r
    }

    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.DiscoverCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateDiscoverByAttributesArgs(args)

        // TODO: Probably does not get dispatched to signer?
        const r = await this.signer.discoverByAttributes(args)

        return r
    }



    //////////////////
    // Actions
    //////////////////

    async createAction(args: sdk.CreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.CreateActionResult> {
        sdk.validateOriginator(originator)
        sdk.validateCreateActionArgs(args)

        if (!args.options) args.options = {}
        args.options.trustSelf ||= this.trustSelf
        args.options.knownTxids = this.getKnownTxids(args.options.knownTxids)

        const r = await this.signer.createAction(args)

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

        return r
    }

    async signAction(args: sdk.SignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.SignActionResult> {
        sdk.validateOriginator(originator)
        sdk.validateSignActionArgs(args)

        const r = await this.signer.signAction(args)

        return r
    }

    async abortAction(args: sdk.AbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AbortActionResult> {
        sdk.validateOriginator(originator)
        const vargs = sdk.validateAbortActionArgs(args)

        const r = await this.signer.abortAction(vargs)

        return r
    }

    async internalizeAction(args: sdk.InternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.InternalizeActionResult> {
        sdk.validateOriginator(originator)
        sdk.validateInternalizeActionArgs(args)

        const r = await this.signer.internalizeAction(args)

        return r
    }

    async relinquishOutput(args: sdk.RelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.RelinquishOutputResult> {
        sdk.validateOriginator(originator)
        sdk.validateRelinquishOutputArgs(args)

        const r = await this.signer.relinquishOutput(args)

        return r
    }


    async isAuthenticated(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AuthenticatedResult> {
        sdk.validateOriginator(originator)
        const r: { authenticated: boolean; } = {
            authenticated: true
        }
        return r
    }

    async waitForAuthentication(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.AuthenticatedResult> {
        sdk.validateOriginator(originator)
        return { authenticated: true }
    }

    async getHeight(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetHeightResult> {
        sdk.validateOriginator(originator)
        const height = await this.getServices().getHeight()
        return { height }
    }

    async getHeaderForHeight(args: sdk.GetHeaderArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetHeaderResult> {
        sdk.validateOriginator(originator)
        const serializedHeader = await this.getServices().getHeaderForHeight(args.height)
        return { header: Utils.toHex(serializedHeader) }
    }

    async getNetwork(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetNetworkResult> {
        sdk.validateOriginator(originator)
        const chain = await this.signer.getChain()
        return { network: toWalletNetwork(chain) }
    }

    async getVersion(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes)
    : Promise<sdk.GetVersionResult> {
        sdk.validateOriginator(originator)
        return { version: 'wallet-brc100-1.0.0' }
    }
}