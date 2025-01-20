import * as bsv from '@bsv/sdk'
import { Beef, BeefParty, Utils } from "@bsv/sdk";
import { sdk, toWalletNetwork, Monitor } from './index.client'

export class Wallet extends bsv.ProtoWallet implements bsv.Wallet {
    signer: sdk.WalletSigner
    services?: sdk.WalletServices
    monitor?: Monitor

    beef: BeefParty
    trustSelf?: bsv.TrustSelf
    userParty: string

    constructor(signer: sdk.WalletSigner, keyDeriver?: bsv.KeyDeriverApi, services?: sdk.WalletServices, monitor?: Monitor) {
        if (!keyDeriver)
            throw new sdk.WERR_INVALID_PARAMETER('keyDeriver', 'valid')
        super(keyDeriver)
        this.signer = signer
        // Give signer access to our keyDeriver
        this.signer.keyDeriver = keyDeriver
        this.services = services
        this.monitor = monitor

        this.userParty = `user ${signer.getClientChangeKeyPair().publicKey}`
        this.beef = new BeefParty([this.userParty])
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
        const knownTxids = r.valid.concat(r.txidOnly)
        return knownTxids
    }

    //////////////////
    // List Methods
    //////////////////

    async listActions(args: bsv.ListActionsArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.ListActionsResult> {
        sdk.validateOriginator(originator)
        sdk.validateListActionsArgs(args)
        const r = await this.signer.listActions(args)
        return r
    }

    get storageParty() : string { return `storage ${this.signer.getStorageIdentity().storageIdentityKey}` }

    async listOutputs(args: bsv.ListOutputsArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.ListOutputsResult> {
        sdk.validateOriginator(originator)
        sdk.validateListOutputsArgs(args)
        const knownTxids = this.getKnownTxids()
        const r = await this.signer.listOutputs(args, knownTxids)
        if (r.BEEF) {
            this.beef.mergeBeefFromParty(this.storageParty, r.BEEF)
        }
        return r
    }

    async listCertificates(args: bsv.ListCertificatesArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.ListCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateListCertificatesArgs(args)
        const r = await this.signer.listCertificates(args)
        return r
    }

    //////////////////
    // Certificates
    //////////////////

    async acquireCertificate(args: bsv.AcquireCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.AcquireCertificateResult> {
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

    async relinquishCertificate(args: bsv.RelinquishCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.RelinquishCertificateResult> {
        sdk.validateOriginator(originator)
        sdk.validateRelinquishCertificateArgs(args)
        const r = await this.signer.relinquishCertificate(args)
        return r
    }

    async proveCertificate(args: bsv.ProveCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.ProveCertificateResult> {
        originator = sdk.validateOriginator(originator)
        sdk.validateProveCertificateArgs(args)
        const r = await this.signer.proveCertificate(args)
        return r
    }
    
    async discoverByIdentityKey(args: bsv.DiscoverByIdentityKeyArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.DiscoverCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateDiscoverByIdentityKeyArgs(args)

        // TODO: Probably does not get dispatched to signer?
        const r = await this.signer.discoverByIdentityKey(args)

        return r
    }

    async discoverByAttributes(args: bsv.DiscoverByAttributesArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.DiscoverCertificatesResult> {
        sdk.validateOriginator(originator)
        sdk.validateDiscoverByAttributesArgs(args)

        // TODO: Probably does not get dispatched to signer?
        const r = await this.signer.discoverByAttributes(args)

        return r
    }



    //////////////////
    // Actions
    //////////////////

    async createAction(args: bsv.CreateActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.CreateActionResult> {
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

    async signAction(args: bsv.SignActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.SignActionResult> {
        sdk.validateOriginator(originator)
        sdk.validateSignActionArgs(args)

        const r = await this.signer.signAction(args)

        return r
    }

    async abortAction(args: bsv.AbortActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.AbortActionResult> {
        sdk.validateOriginator(originator)
        const vargs = sdk.validateAbortActionArgs(args)

        const r = await this.signer.abortAction(vargs)

        return r
    }

    async internalizeAction(args: bsv.InternalizeActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.InternalizeActionResult> {
        sdk.validateOriginator(originator)
        sdk.validateInternalizeActionArgs(args)

        const r = await this.signer.internalizeAction(args)

        return r
    }

    async relinquishOutput(args: bsv.RelinquishOutputArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.RelinquishOutputResult> {
        sdk.validateOriginator(originator)
        sdk.validateRelinquishOutputArgs(args)

        const r = await this.signer.relinquishOutput(args)

        return r
    }


    override async isAuthenticated(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.AuthenticatedResult> {
        sdk.validateOriginator(originator)
        const r: { authenticated: true; } = {
            authenticated: true
        }
        return r
    }

    override async waitForAuthentication(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.AuthenticatedResult> {
        sdk.validateOriginator(originator)
        return { authenticated: true }
    }

    async getHeight(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.GetHeightResult> {
        sdk.validateOriginator(originator)
        const height = await this.getServices().getHeight()
        return { height }
    }

    async getHeaderForHeight(args: bsv.GetHeaderArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.GetHeaderResult> {
        sdk.validateOriginator(originator)
        const serializedHeader = await this.getServices().getHeaderForHeight(args.height)
        return { header: Utils.toHex(serializedHeader) }
    }

    override async getNetwork(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.GetNetworkResult> {
        sdk.validateOriginator(originator)
        const chain = await this.signer.getChain()
        return { network: toWalletNetwork(chain) }
    }

    override async getVersion(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes)
    : Promise<bsv.GetVersionResult> {
        sdk.validateOriginator(originator)
        return { version: 'wallet-brc100-1.0.0' }
    }
}