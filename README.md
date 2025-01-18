# wallet

BRC100 conforming wallet, wallet storage and wallet signer components

## API

<!--#region ts2md-api-merged-here-->

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

### Interfaces

| | | |
| --- | --- | --- |
| [AbortActionArgs](#interface-abortactionargs) | [GetReqsAndBeefDetail](#interface-getreqsandbeefdetail) | [StorageReaderOptions](#interface-storagereaderoptions) |
| [AbortActionResult](#interface-abortactionresult) | [GetReqsAndBeefResult](#interface-getreqsandbeefresult) | [StorageReaderWriterOptions](#interface-storagereaderwriteroptions) |
| [AcquireCertificateArgs](#interface-acquirecertificateargs) | [GetUtxoStatusDetails](#interface-getutxostatusdetails) | [StorageSyncReader](#interface-storagesyncreader) |
| [AcquireCertificateResult](#interface-acquirecertificateresult) | [GetUtxoStatusResult](#interface-getutxostatusresult) | [StorageSyncReaderOptions](#interface-storagesyncreaderoptions) |
| [ArcMinerGetTxData](#interface-arcminergettxdata) | [GetVersionResult](#interface-getversionresult) | [StorageSyncReaderWriter](#interface-storagesyncreaderwriter) |
| [ArcMinerPostBeefDataApi](#interface-arcminerpostbeefdataapi) | [IdentityCertificate](#interface-identitycertificate) | [SyncChunk](#interface-syncchunk) |
| [ArcMinerPostTxsData](#interface-arcminerposttxsdata) | [IdentityCertifier](#interface-identitycertifier) | [TaskPurgeParams](#interface-taskpurgeparams) |
| [ArcServiceConfig](#interface-arcserviceconfig) | [InternalizeActionArgs](#interface-internalizeactionargs) | [TrxToken](#interface-trxtoken) |
| [AuthId](#interface-authid) | [InternalizeActionResult](#interface-internalizeactionresult) | [TscMerkleProofApi](#interface-tscmerkleproofapi) |
| [AuthenticatedResult](#interface-authenticatedresult) | [InternalizeOutput](#interface-internalizeoutput) | [TxScriptOffsets](#interface-txscriptoffsets) |
| [BaseBlockHeaderHex](#interface-baseblockheaderhex) | [KeyDeriverApi](#interface-keyderiverapi) | [UpdateProvenTxReqWithNewProvenTxArgs](#interface-updateproventxreqwithnewproventxargs) |
| [BasketInsertion](#interface-basketinsertion) | [KeyLinkageResult](#interface-keylinkageresult) | [UpdateProvenTxReqWithNewProvenTxResult](#interface-updateproventxreqwithnewproventxresult) |
| [BlockHeaderHex](#interface-blockheaderhex) | [KeyPair](#interface-keypair) | [ValidAbortActionArgs](#interface-validabortactionargs) |
| [BsvExchangeRate](#interface-bsvexchangerate) | [ListActionsArgs](#interface-listactionsargs) | [ValidAcquireCertificateArgs](#interface-validacquirecertificateargs) |
| [CertificateResult](#interface-certificateresult) | [ListActionsResult](#interface-listactionsresult) | [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs) |
| [CreateActionArgs](#interface-createactionargs) | [ListCertificatesArgs](#interface-listcertificatesargs) | [ValidBasketInsertion](#interface-validbasketinsertion) |
| [CreateActionInput](#interface-createactioninput) | [ListCertificatesResult](#interface-listcertificatesresult) | [ValidCreateActionArgs](#interface-validcreateactionargs) |
| [CreateActionOptions](#interface-createactionoptions) | [ListOutputsArgs](#interface-listoutputsargs) | [ValidCreateActionInput](#interface-validcreateactioninput) |
| [CreateActionOutput](#interface-createactionoutput) | [ListOutputsResult](#interface-listoutputsresult) | [ValidCreateActionOptions](#interface-validcreateactionoptions) |
| [CreateActionResult](#interface-createactionresult) | [MonitorDaemonSetup](#interface-monitordaemonsetup) | [ValidCreateActionOutput](#interface-validcreateactionoutput) |
| [CreateHmacArgs](#interface-createhmacargs) | [MonitorOptions](#interface-monitoroptions) | [ValidDiscoverByAttributesArgs](#interface-validdiscoverbyattributesargs) |
| [CreateHmacResult](#interface-createhmacresult) | [OutPoint](#interface-outpoint) | [ValidDiscoverByIdentityKeyArgs](#interface-validdiscoverbyidentitykeyargs) |
| [CreateSignatureArgs](#interface-createsignatureargs) | [Paged](#interface-paged) | [ValidInternalizeActionArgs](#interface-validinternalizeactionargs) |
| [CreateSignatureResult](#interface-createsignatureresult) | [PendingSignAction](#interface-pendingsignaction) | [ValidInternalizeOutput](#interface-validinternalizeoutput) |
| [DiscoverByAttributesArgs](#interface-discoverbyattributesargs) | [PendingStorageInput](#interface-pendingstorageinput) | [ValidListActionsArgs](#interface-validlistactionsargs) |
| [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs) | [PostBeefResult](#interface-postbeefresult) | [ValidListCertificatesArgs](#interface-validlistcertificatesargs) |
| [DiscoverCertificatesResult](#interface-discovercertificatesresult) | [PostBeefResultForTxidApi](#interface-postbeefresultfortxidapi) | [ValidListOutputsArgs](#interface-validlistoutputsargs) |
| [DojoCommitNewTxResults](#interface-dojocommitnewtxresults) | [PostReqsToNetworkDetails](#interface-postreqstonetworkdetails) | [ValidProcessActionArgs](#interface-validprocessactionargs) |
| [EntityTimeStamp](#interface-entitytimestamp) | [PostReqsToNetworkResult](#interface-postreqstonetworkresult) | [ValidProcessActionOptions](#interface-validprocessactionoptions) |
| [ExchangeRatesIoApi](#interface-exchangeratesioapi) | [PostTxResultForTxid](#interface-posttxresultfortxid) | [ValidProveCertificateArgs](#interface-validprovecertificateargs) |
| [FiatExchangeRates](#interface-fiatexchangerates) | [PostTxsResult](#interface-posttxsresult) | [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs) |
| [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs) | [ProcessSyncChunkResult](#interface-processsyncchunkresult) | [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs) |
| [FindCertificatesArgs](#interface-findcertificatesargs) | [ProveCertificateArgs](#interface-provecertificateargs) | [ValidSignActionArgs](#interface-validsignactionargs) |
| [FindCommissionsArgs](#interface-findcommissionsargs) | [ProveCertificateResult](#interface-provecertificateresult) | [ValidSignActionOptions](#interface-validsignactionoptions) |
| [FindForUserSincePagedArgs](#interface-findforusersincepagedargs) | [ProvenOrRawTx](#interface-provenorrawtx) | [ValidWalletPayment](#interface-validwalletpayment) |
| [FindMonitorEventsArgs](#interface-findmonitoreventsargs) | [PurgeParams](#interface-purgeparams) | [ValidWalletSignerArgs](#interface-validwalletsignerargs) |
| [FindOutputBasketsArgs](#interface-findoutputbasketsargs) | [PurgeResults](#interface-purgeresults) | [VerifyHmacArgs](#interface-verifyhmacargs) |
| [FindOutputTagMapsArgs](#interface-findoutputtagmapsargs) | [RelinquishCertificateArgs](#interface-relinquishcertificateargs) | [VerifyHmacResult](#interface-verifyhmacresult) |
| [FindOutputTagsArgs](#interface-findoutputtagsargs) | [RelinquishCertificateResult](#interface-relinquishcertificateresult) | [VerifySignatureArgs](#interface-verifysignatureargs) |
| [FindOutputsArgs](#interface-findoutputsargs) | [RelinquishOutputArgs](#interface-relinquishoutputargs) | [VerifySignatureResult](#interface-verifysignatureresult) |
| [FindPartialSincePagedArgs](#interface-findpartialsincepagedargs) | [RelinquishOutputResult](#interface-relinquishoutputresult) | [Wallet](#interface-wallet) |
| [FindProvenTxReqsArgs](#interface-findproventxreqsargs) | [RequestSyncChunkArgs](#interface-requestsyncchunkargs) | [WalletAction](#interface-walletaction) |
| [FindProvenTxsArgs](#interface-findproventxsargs) | [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs) | [WalletActionInput](#interface-walletactioninput) |
| [FindSincePagedArgs](#interface-findsincepagedargs) | [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult) | [WalletActionOutput](#interface-walletactionoutput) |
| [FindSyncStatesArgs](#interface-findsyncstatesargs) | [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs) | [WalletCertificate](#interface-walletcertificate) |
| [FindTransactionsArgs](#interface-findtransactionsargs) | [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult) | [WalletCryptoObject](#interface-walletcryptoobject) |
| [FindTxLabelMapsArgs](#interface-findtxlabelmapsargs) | [ScriptTemplateParamsSABPPP](#interface-scripttemplateparamssabppp) | [WalletDecryptArgs](#interface-walletdecryptargs) |
| [FindTxLabelsArgs](#interface-findtxlabelsargs) | [SendWithResult](#interface-sendwithresult) | [WalletDecryptResult](#interface-walletdecryptresult) |
| [FindUsersArgs](#interface-findusersargs) | [SignActionArgs](#interface-signactionargs) | [WalletEncryptArgs](#interface-walletencryptargs) |
| [GenerateChangeSdkChangeInput](#interface-generatechangesdkchangeinput) | [SignActionOptions](#interface-signactionoptions) | [WalletEncryptResult](#interface-walletencryptresult) |
| [GenerateChangeSdkChangeOutput](#interface-generatechangesdkchangeoutput) | [SignActionResult](#interface-signactionresult) | [WalletEncryptionArgs](#interface-walletencryptionargs) |
| [GenerateChangeSdkInput](#interface-generatechangesdkinput) | [SignActionSpend](#interface-signactionspend) | [WalletErrorObject](#interface-walleterrorobject) |
| [GenerateChangeSdkOutput](#interface-generatechangesdkoutput) | [SignableTransaction](#interface-signabletransaction) | [WalletOutput](#interface-walletoutput) |
| [GenerateChangeSdkParams](#interface-generatechangesdkparams) | [StorageCreateActionResult](#interface-storagecreateactionresult) | [WalletPayment](#interface-walletpayment) |
| [GenerateChangeSdkResult](#interface-generatechangesdkresult) | [StorageCreateTransactionSdkInput](#interface-storagecreatetransactionsdkinput) | [WalletServices](#interface-walletservices) |
| [GenerateChangeSdkStorageChange](#interface-generatechangesdkstoragechange) | [StorageCreateTransactionSdkOutput](#interface-storagecreatetransactionsdkoutput) | [WalletServicesOptions](#interface-walletservicesoptions) |
| [GetHeaderArgs](#interface-getheaderargs) | [StorageFeeModel](#interface-storagefeemodel) | [WalletSigner](#interface-walletsigner) |
| [GetHeaderResult](#interface-getheaderresult) | [StorageGetBeefOptions](#interface-storagegetbeefoptions) | [WalletStorage](#interface-walletstorage) |
| [GetHeightResult](#interface-getheightresult) | [StorageIdentity](#interface-storageidentity) | [WalletStorageProvider](#interface-walletstorageprovider) |
| [GetMerklePathResult](#interface-getmerklepathresult) | [StorageInternalizeActionResult](#interface-storageinternalizeactionresult) | [WalletStorageReader](#interface-walletstoragereader) |
| [GetNetworkResult](#interface-getnetworkresult) | [StorageProcessActionArgs](#interface-storageprocessactionargs) | [WalletStorageSync](#interface-walletstoragesync) |
| [GetPublicKeyArgs](#interface-getpublickeyargs) | [StorageProcessActionResults](#interface-storageprocessactionresults) | [WalletStorageWriter](#interface-walletstoragewriter) |
| [GetPublicKeyResult](#interface-getpublickeyresult) | [StorageProvenOrReq](#interface-storageprovenorreq) | [XValidCreateActionOutput](#interface-xvalidcreateactionoutput) |
| [GetRawTxResult](#interface-getrawtxresult) | [StorageProviderOptions](#interface-storageprovideroptions) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AbortActionArgs

```ts
export interface AbortActionArgs {
    reference: Base64String;
}
```

See also: [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: AbortActionResult

```ts
export interface AbortActionResult {
    aborted: boolean;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: AcquireCertificateArgs

```ts
export interface AcquireCertificateArgs {
    type: Base64String;
    certifier: PubKeyHex;
    acquisitionProtocol: AcquisitionProtocol;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
    serialNumber?: Base64String;
    revocationOutpoint?: OutpointString;
    signature?: HexString;
    certifierUrl?: string;
    keyringRevealer?: KeyringRevealer;
    keyringForSubject?: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [AcquisitionProtocol](#type-acquisitionprotocol), [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: AcquireCertificateResult

```ts
export interface AcquireCertificateResult extends WalletCertificate {
}
```

See also: [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ArcMinerGetTxData

```ts
export interface ArcMinerGetTxData {
    status: number;
    title: string;
    blockHash: string;
    blockHeight: number;
    competingTxs: null | string[];
    extraInfo: string;
    merklePath: string;
    timestamp: string;
    txid: string;
    txStatus: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ArcMinerPostBeefDataApi

```ts
export interface ArcMinerPostBeefDataApi {
    status: number;
    title: string;
    blockHash?: string;
    blockHeight?: number;
    competingTxs?: null;
    extraInfo: string;
    merklePath?: string;
    timestamp?: string;
    txid?: string;
    txStatus?: string;
    type?: string;
    detail?: string;
    instance?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ArcMinerPostTxsData

```ts
export interface ArcMinerPostTxsData {
    status: number;
    title: string;
    blockHash: string;
    blockHeight: number;
    competingTxs: null | string[];
    extraInfo: string;
    merklePath: string;
    timestamp: string;
    txid: string;
    txStatus: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ArcServiceConfig

```ts
export interface ArcServiceConfig {
    name: string;
    url: string;
    arcConfig: bsv.ArcConfig;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: AuthId

```ts
export interface AuthId {
    identityKey: string;
    userId?: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: AuthenticatedResult

```ts
export interface AuthenticatedResult {
    authenticated: boolean;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: BaseBlockHeaderHex

Like BlockHeader but 32 byte fields are hex encoded strings.

```ts
export interface BaseBlockHeaderHex {
    version: number;
    previousHash: string;
    merkleRoot: string;
    time: number;
    bits: number;
    nonce: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: BasketInsertion

```ts
export interface BasketInsertion {
    basket: BasketStringUnder300Bytes;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: BlockHeaderHex

Like BlockHeader but 32 byte fields are hex encoded strings.

```ts
export interface BlockHeaderHex extends BaseBlockHeaderHex {
    height: number;
    hash: string;
}
```

See also: [BaseBlockHeaderHex](#interface-baseblockheaderhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: BsvExchangeRate

```ts
export interface BsvExchangeRate {
    timestamp: Date;
    base: "USD";
    rate: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CertificateResult

```ts
export interface CertificateResult extends WalletCertificate {
    keyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    verifier?: string;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateActionArgs

```ts
export interface CreateActionArgs {
    description: DescriptionString5to50Bytes;
    inputBEEF?: BEEF;
    inputs?: CreateActionInput[];
    outputs?: CreateActionOutput[];
    lockTime?: PositiveIntegerOrZero;
    version?: PositiveIntegerOrZero;
    labels?: LabelStringUnder300Bytes[];
    options?: CreateActionOptions;
}
```

See also: [BEEF](#type-beef), [CreateActionInput](#interface-createactioninput), [CreateActionOptions](#interface-createactionoptions), [CreateActionOutput](#interface-createactionoutput), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateActionInput

```ts
export interface CreateActionInput {
    outpoint: OutpointString;
    inputDescription: DescriptionString5to50Bytes;
    unlockingScript?: HexString;
    unlockingScriptLength?: PositiveInteger;
    sequenceNumber?: PositiveIntegerOrZero;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateActionOptions

```ts
export interface CreateActionOptions {
    signAndProcess?: BooleanDefaultTrue;
    acceptDelayedBroadcast?: BooleanDefaultTrue;
    trustSelf?: TrustSelf;
    knownTxids?: TXIDHexString[];
    returnTXIDOnly?: BooleanDefaultFalse;
    noSend?: BooleanDefaultFalse;
    noSendChange?: OutpointString[];
    sendWith?: TXIDHexString[];
    randomizeOutputs?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutpointString](#type-outpointstring), [TXIDHexString](#type-txidhexstring), [TrustSelf](#type-trustself)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateActionOutput

```ts
export interface CreateActionOutput {
    lockingScript: HexString;
    satoshis: SatoshiValue;
    outputDescription: DescriptionString5to50Bytes;
    basket?: BasketStringUnder300Bytes;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateActionResult

```ts
export interface CreateActionResult {
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    noSendChange?: OutpointString[];
    sendWithResults?: SendWithResult[];
    signableTransaction?: SignableTransaction;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [OutpointString](#type-outpointstring), [SendWithResult](#interface-sendwithresult), [SignableTransaction](#interface-signabletransaction), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateHmacArgs

```ts
export interface CreateHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateHmacResult

```ts
export interface CreateHmacResult {
    hmac: Byte[];
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateSignatureArgs

```ts
export interface CreateSignatureArgs extends WalletEncryptionArgs {
    data?: Byte[];
    hashToDirectlySign?: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: CreateSignatureResult

```ts
export interface CreateSignatureResult {
    signature: Byte[];
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: DiscoverByAttributesArgs

```ts
export interface DiscoverByAttributesArgs {
    attributes: Record<CertificateFieldNameUnder50Bytes, string>;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: DiscoverByIdentityKeyArgs

```ts
export interface DiscoverByIdentityKeyArgs {
    identityKey: PubKeyHex;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: DiscoverCertificatesResult

```ts
export interface DiscoverCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: IdentityCertificate[];
}
```

See also: [IdentityCertificate](#interface-identitycertificate), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: DojoCommitNewTxResults

```ts
export interface DojoCommitNewTxResults {
    req: entity.ProvenTxReq;
    log?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: EntityTimeStamp

```ts
export interface EntityTimeStamp {
    created_at: Date;
    updated_at: Date;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ExchangeRatesIoApi

```ts
export interface ExchangeRatesIoApi {
    success: boolean;
    timestamp: number;
    base: "EUR" | "USD";
    date: string;
    rates: Record<string, number>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FiatExchangeRates

```ts
export interface FiatExchangeRates {
    timestamp: Date;
    base: "USD";
    rates: Record<string, number>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindCertificateFieldsArgs

```ts
export interface FindCertificateFieldsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.CertificateField>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindCertificatesArgs

```ts
export interface FindCertificatesArgs extends FindSincePagedArgs {
    partial: Partial<table.Certificate>;
    certifiers?: string[];
    types?: string[];
    includeFields?: boolean;
}
```

See also: [Certificate](#class-certificate), [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindCommissionsArgs

```ts
export interface FindCommissionsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.Commission>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindForUserSincePagedArgs

```ts
export interface FindForUserSincePagedArgs extends FindSincePagedArgs {
    userId: number;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindMonitorEventsArgs

```ts
export interface FindMonitorEventsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.MonitorEvent>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindOutputBasketsArgs

```ts
export interface FindOutputBasketsArgs extends FindSincePagedArgs {
    partial: Partial<table.OutputBasket>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindOutputTagMapsArgs

```ts
export interface FindOutputTagMapsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.OutputTagMap>;
    tagIds?: number[];
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindOutputTagsArgs

```ts
export interface FindOutputTagsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.OutputTag>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindOutputsArgs

```ts
export interface FindOutputsArgs extends FindSincePagedArgs {
    partial: Partial<table.Output>;
    noScript?: boolean;
    txStatus?: sdk.TransactionStatus[];
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [TransactionStatus](#type-transactionstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindPartialSincePagedArgs

```ts
export interface FindPartialSincePagedArgs<T extends object> extends FindSincePagedArgs {
    partial: Partial<T>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindProvenTxReqsArgs

```ts
export interface FindProvenTxReqsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.ProvenTxReq>;
    status?: sdk.ProvenTxReqStatus[];
    txids?: string[];
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindProvenTxsArgs

```ts
export interface FindProvenTxsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.ProvenTx>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindSincePagedArgs

```ts
export interface FindSincePagedArgs {
    since?: Date;
    paged?: sdk.Paged;
    trx?: sdk.TrxToken;
}
```

See also: [Paged](#interface-paged), [TrxToken](#interface-trxtoken)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindSyncStatesArgs

```ts
export interface FindSyncStatesArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.SyncState>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindTransactionsArgs

```ts
export interface FindTransactionsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.Transaction>;
    status?: sdk.TransactionStatus[];
    noRawTx?: boolean;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [TransactionStatus](#type-transactionstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindTxLabelMapsArgs

```ts
export interface FindTxLabelMapsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.TxLabelMap>;
    labelIds?: number[];
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindTxLabelsArgs

```ts
export interface FindTxLabelsArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.TxLabel>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: FindUsersArgs

```ts
export interface FindUsersArgs extends sdk.FindSincePagedArgs {
    partial: Partial<table.User>;
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkChangeInput

```ts
export interface GenerateChangeSdkChangeInput {
    outputId: number;
    satoshis: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkChangeOutput

```ts
export interface GenerateChangeSdkChangeOutput {
    satoshis: number;
    lockingScriptLength: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkInput

```ts
export interface GenerateChangeSdkInput {
    satoshis: number;
    unlockingScriptLength: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkOutput

```ts
export interface GenerateChangeSdkOutput {
    satoshis: number;
    lockingScriptLength: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkParams

```ts
export interface GenerateChangeSdkParams {
    fixedInputs: GenerateChangeSdkInput[];
    fixedOutputs: GenerateChangeSdkOutput[];
    feeModel: sdk.StorageFeeModel;
    targetNetCount?: number;
    changeInitialSatoshis: number;
    changeFirstSatoshis: number;
    changeLockingScriptLength: number;
    changeUnlockingScriptLength: number;
    randomVals?: number[];
    noLogging?: boolean;
    log?: string;
}
```

See also: [GenerateChangeSdkInput](#interface-generatechangesdkinput), [GenerateChangeSdkOutput](#interface-generatechangesdkoutput), [StorageFeeModel](#interface-storagefeemodel)

<details>

<summary>Interface GenerateChangeSdkParams Details</summary>

##### Property changeFirstSatoshis

Lowest amount value to assign to a change output.
Drop the output if unable to satisfy. 
default 285

```ts
changeFirstSatoshis: number
```

##### Property changeInitialSatoshis

Satoshi amount to initialize optional new change outputs.

```ts
changeInitialSatoshis: number
```

##### Property changeLockingScriptLength

Fixed change locking script length.

For P2PKH template, 25 bytes

```ts
changeLockingScriptLength: number
```

##### Property changeUnlockingScriptLength

Fixed change unlocking script length.

For P2PKH template, 107 bytes

```ts
changeUnlockingScriptLength: number
```

##### Property targetNetCount

Target for number of new change outputs added minus number of funding change outputs consumed.
If undefined, only a single change output will be added if excess fees must be recaptured.

```ts
targetNetCount?: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkResult

```ts
export interface GenerateChangeSdkResult {
    allocatedChangeInputs: GenerateChangeSdkChangeInput[];
    changeOutputs: GenerateChangeSdkChangeOutput[];
    size: number;
    fee: number;
    satsPerKb: number;
}
```

See also: [GenerateChangeSdkChangeInput](#interface-generatechangesdkchangeinput), [GenerateChangeSdkChangeOutput](#interface-generatechangesdkchangeoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GenerateChangeSdkStorageChange

```ts
export interface GenerateChangeSdkStorageChange extends GenerateChangeSdkChangeInput {
    spendable: boolean;
}
```

See also: [GenerateChangeSdkChangeInput](#interface-generatechangesdkchangeinput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetHeaderArgs

```ts
export interface GetHeaderArgs {
    height: PositiveInteger;
}
```

See also: [PositiveInteger](#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetHeaderResult

```ts
export interface GetHeaderResult {
    header: HexString;
}
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetHeightResult

```ts
export interface GetHeightResult {
    height: PositiveInteger;
}
```

See also: [PositiveInteger](#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetMerklePathResult

Properties on result returned from `WalletServices` function `getMerkleProof`.

```ts
export interface GetMerklePathResult {
    name?: string;
    merklePath?: bsv.MerklePath;
    header?: BlockHeaderHex;
    error?: sdk.WalletError;
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [WalletError](#class-walleterror)

<details>

<summary>Interface GetMerklePathResult Details</summary>

##### Property error

The first exception error that occurred during processing, if any.

```ts
error?: sdk.WalletError
```
See also: [WalletError](#class-walleterror)

##### Property merklePath

Multiple proofs may be returned when a transaction also appears in
one or more orphaned blocks

```ts
merklePath?: bsv.MerklePath
```

##### Property name

The name of the service returning the proof, or undefined if no proof

```ts
name?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetNetworkResult

```ts
export interface GetNetworkResult {
    network: WalletNetwork;
}
```

See also: [WalletNetwork](#type-walletnetwork)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetPublicKeyArgs

When `identityKey` is true, `WalletEncryptionArgs` are not used.

When `identityKey` is undefined, `WalletEncryptionArgs` are required.

```ts
export interface GetPublicKeyArgs extends Partial<WalletEncryptionArgs> {
    identityKey?: true;
    forSelf?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetPublicKeyResult

```ts
export interface GetPublicKeyResult {
    publicKey: PubKeyHex;
}
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetRawTxResult

Properties on result returned from `WalletServices` function `getRawTx`.

```ts
export interface GetRawTxResult {
    txid: string;
    name?: string;
    rawTx?: number[];
    error?: sdk.WalletError;
}
```

See also: [WalletError](#class-walleterror)

<details>

<summary>Interface GetRawTxResult Details</summary>

##### Property error

The first exception error that occurred during processing, if any.

```ts
error?: sdk.WalletError
```
See also: [WalletError](#class-walleterror)

##### Property name

The name of the service returning the rawTx, or undefined if no rawTx

```ts
name?: string
```

##### Property rawTx

Multiple proofs may be returned when a transaction also appears in
one or more orphaned blocks

```ts
rawTx?: number[]
```

##### Property txid

Transaction hash or rawTx (and of initial request)

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetReqsAndBeefDetail

```ts
export interface GetReqsAndBeefDetail {
    txid: string;
    req?: table.ProvenTxReq;
    proven?: table.ProvenTx;
    status: "readyToSend" | "alreadySent" | "error" | "unknown";
    error?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetReqsAndBeefResult

```ts
export interface GetReqsAndBeefResult {
    beef: bsv.Beef;
    details: GetReqsAndBeefDetail[];
}
```

See also: [GetReqsAndBeefDetail](#interface-getreqsandbeefdetail)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetUtxoStatusDetails

```ts
export interface GetUtxoStatusDetails {
    height?: number;
    txid?: string;
    index?: number;
    satoshis?: number;
}
```

<details>

<summary>Interface GetUtxoStatusDetails Details</summary>

##### Property height

if isUtxo, the block height containing the matching unspent transaction output

typically there will be only one, but future orphans can result in multiple values

```ts
height?: number
```

##### Property index

if isUtxo, the output index in the transaction containing of the matching unspent transaction output

typically there will be only one, but future orphans can result in multiple values

```ts
index?: number
```

##### Property satoshis

if isUtxo, the amount of the matching unspent transaction output

typically there will be only one, but future orphans can result in multiple values

```ts
satoshis?: number
```

##### Property txid

if isUtxo, the transaction hash (txid) of the transaction containing the matching unspent transaction output

typically there will be only one, but future orphans can result in multiple values

```ts
txid?: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetUtxoStatusResult

```ts
export interface GetUtxoStatusResult {
    name: string;
    status: "success" | "error";
    error?: sdk.WalletError;
    isUtxo?: boolean;
    details: GetUtxoStatusDetails[];
}
```

See also: [GetUtxoStatusDetails](#interface-getutxostatusdetails), [WalletError](#class-walleterror)

<details>

<summary>Interface GetUtxoStatusResult Details</summary>

##### Property details

Additional details about occurances of this output script as a utxo.

Normally there will be one item in the array but due to the possibility of orphan races
there could be more than one block in which it is a valid utxo.

```ts
details: GetUtxoStatusDetails[]
```
See also: [GetUtxoStatusDetails](#interface-getutxostatusdetails)

##### Property error

When status is 'error', provides code and description

```ts
error?: sdk.WalletError
```
See also: [WalletError](#class-walleterror)

##### Property isUtxo

true if the output is associated with at least one unspent transaction output

```ts
isUtxo?: boolean
```

##### Property name

The name of the service to which the transaction was submitted for processing

```ts
name: string
```

##### Property status

'success' - the operation was successful, non-error results are valid.
'error' - the operation failed, error may have relevant information.

```ts
status: "success" | "error"
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: GetVersionResult

```ts
export interface GetVersionResult {
    version: VersionString7To30Bytes;
}
```

See also: [VersionString7To30Bytes](#type-versionstring7to30bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: IdentityCertificate

```ts
export interface IdentityCertificate extends WalletCertificate {
    certifierInfo: IdentityCertifier;
    publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [IdentityCertifier](#interface-identitycertifier), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: IdentityCertifier

```ts
export interface IdentityCertifier {
    name: EntityNameStringMax100Bytes;
    iconUrl: EntityIconURLStringMax500Bytes;
    description: DescriptionString5to50Bytes;
    trust: PositiveIntegerMax10;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [PositiveIntegerMax10](#type-positiveintegermax10)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: InternalizeActionArgs

```ts
export interface InternalizeActionArgs {
    tx: AtomicBEEF;
    outputs: InternalizeOutput[];
    description: DescriptionString5to50Bytes;
    labels?: LabelStringUnder300Bytes[];
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [InternalizeOutput](#interface-internalizeoutput), [LabelStringUnder300Bytes](#type-labelstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: InternalizeActionResult

```ts
export interface InternalizeActionResult {
    accepted: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: InternalizeOutput

```ts
export interface InternalizeOutput {
    outputIndex: PositiveIntegerOrZero;
    protocol: "wallet payment" | "basket insertion";
    paymentRemittance?: WalletPayment;
    insertionRemittance?: BasketInsertion;
}
```

See also: [BasketInsertion](#interface-basketinsertion), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletPayment](#interface-walletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: KeyDeriverApi

```ts
export interface KeyDeriverApi {
    rootKey: PrivateKey;
    identityKey: string;
    derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean): PublicKey;
    derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey;
    deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey;
    revealCounterpartySecret(counterparty: Counterparty): number[];
    revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[];
}
```

See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

<details>

<summary>Interface KeyDeriverApi Details</summary>

##### Property identityKey

The identity of this key deriver which is normally the public key associated with the `rootKey`

```ts
identityKey: string
```

##### Property rootKey

The root key from which all other keys are derived.

```ts
rootKey: PrivateKey
```

##### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived private key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

##### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean): PublicKey
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived public key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **forSelf**
  + Optional. false if undefined. Whether deriving for self.

##### Method deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Note: Symmetric keys should not be derivable by everyone due to security risks.

```ts
deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to derive a symmetric key for 'anyone'.

##### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Note: This should not be used for 'self'.

```ts
revealCounterpartySecret(counterparty: Counterparty): number[]
```
See also: [Counterparty](#type-counterparty)

Returns

- The shared secret as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to reveal a shared secret for 'self'.

##### Method revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.

```ts
revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[]
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: KeyLinkageResult

```ts
export interface KeyLinkageResult {
    encryptedLinkage: Byte[];
    encryptedLinkageProof: Byte[];
    prover: PubKeyHex;
    verifier: PubKeyHex;
    counterparty: PubKeyHex;
}
```

See also: [Byte](#type-byte), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: KeyPair

```ts
export interface KeyPair {
    privateKey: string;
    publicKey: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListActionsArgs

```ts
export interface ListActionsArgs {
    labels: LabelStringUnder300Bytes[];
    labelQueryMode?: "any" | "all";
    includeLabels?: BooleanDefaultFalse;
    includeInputs?: BooleanDefaultFalse;
    includeInputSourceLockingScripts?: BooleanDefaultFalse;
    includeInputUnlockingScripts?: BooleanDefaultFalse;
    includeOutputs?: BooleanDefaultFalse;
    includeOutputLockingScripts?: BooleanDefaultFalse;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListActionsResult

```ts
export interface ListActionsResult {
    totalActions: PositiveIntegerOrZero;
    actions: WalletAction[];
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletAction](#interface-walletaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListCertificatesArgs

```ts
export interface ListCertificatesArgs {
    certifiers: PubKeyHex[];
    types: Base64String[];
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListCertificatesResult

```ts
export interface ListCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: CertificateResult[];
}
```

See also: [CertificateResult](#interface-certificateresult), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListOutputsArgs

```ts
export interface ListOutputsArgs {
    basket: BasketStringUnder300Bytes;
    tags?: OutputTagStringUnder300Bytes[];
    tagQueryMode?: "all" | "any";
    include?: "locking scripts" | "entire transactions";
    includeCustomInstructions?: BooleanDefaultFalse;
    includeTags?: BooleanDefaultFalse;
    includeLabels?: BooleanDefaultFalse;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ListOutputsResult

```ts
export interface ListOutputsResult {
    totalOutputs: PositiveIntegerOrZero;
    BEEF?: BEEF;
    outputs: WalletOutput[];
}
```

See also: [BEEF](#type-beef), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletOutput](#interface-walletoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: MonitorDaemonSetup

```ts
export interface MonitorDaemonSetup {
    chain?: sdk.Chain;
    sqliteFilename?: string;
    mySQLConnection?: string;
    knexConfig?: Knex.Config;
    knex?: Knex<any, any[]>;
    storageKnexOptions?: StorageKnexOptions;
    storageProvider?: StorageProvider;
    storageManager?: WalletStorageManager;
    servicesOptions?: sdk.WalletServicesOptions;
    services?: Services;
    monitor?: Monitor;
}
```

See also: [Chain](#type-chain), [Monitor](#class-monitor), [Services](#class-services), [StorageProvider](#class-storageprovider), [WalletServicesOptions](#interface-walletservicesoptions), [WalletStorageManager](#class-walletstoragemanager)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: MonitorOptions

```ts
export interface MonitorOptions {
    chain: sdk.Chain;
    services: Services;
    storage: MonitorStorage;
    chaintracks: ChaintracksClientApi;
    msecsWaitPerMerkleProofServiceReq: number;
    taskRunWaitMsecs: number;
    abandonedMsecs: number;
    unprovenAttemptsLimitTest: number;
    unprovenAttemptsLimitMain: number;
}
```

See also: [Chain](#type-chain), [MonitorStorage](#type-monitorstorage), [Services](#class-services)

<details>

<summary>Interface MonitorOptions Details</summary>

##### Property msecsWaitPerMerkleProofServiceReq

How many msecs to wait after each getMerkleProof service request.

```ts
msecsWaitPerMerkleProofServiceReq: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: OutPoint

Identifies a unique transaction output by its `txid` and index `vout`

```ts
export interface OutPoint {
    txid: string;
    vout: number;
}
```

<details>

<summary>Interface OutPoint Details</summary>

##### Property txid

Transaction double sha256 hash as big endian hex string

```ts
txid: string
```

##### Property vout

zero based output index within the transaction

```ts
vout: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: Paged

```ts
export interface Paged {
    limit: number;
    offset?: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PendingSignAction

```ts
export interface PendingSignAction {
    reference: string;
    dcr: sdk.StorageCreateActionResult;
    args: sdk.ValidCreateActionArgs;
    tx: Transaction;
    amount: number;
    pdi: PendingStorageInput[];
}
```

See also: [PendingStorageInput](#interface-pendingstorageinput), [StorageCreateActionResult](#interface-storagecreateactionresult), [ValidCreateActionArgs](#interface-validcreateactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PendingStorageInput

```ts
export interface PendingStorageInput {
    vin: number;
    derivationPrefix: string;
    derivationSuffix: string;
    unlockerPubKey?: string;
    sourceSatoshis: number;
    lockingScript: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostBeefResult

```ts
export interface PostBeefResult extends PostTxsResult {
}
```

See also: [PostTxsResult](#interface-posttxsresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostBeefResultForTxidApi

```ts
export interface PostBeefResultForTxidApi {
    txid: string;
    status: "success" | "error";
    alreadyKnown?: boolean;
    blockHash?: string;
    blockHeight?: number;
    merklePath?: string;
}
```

<details>

<summary>Interface PostBeefResultForTxidApi Details</summary>

##### Property alreadyKnown

if true, the transaction was already known to this service. Usually treat as a success.

Potentially stop posting to additional transaction processors.

```ts
alreadyKnown?: boolean
```

##### Property status

'success' - The transaction was accepted for processing

```ts
status: "success" | "error"
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostReqsToNetworkDetails

```ts
export interface PostReqsToNetworkDetails {
    txid: string;
    req: entity.ProvenTxReq;
    status: PostReqsToNetworkDetailsStatus;
    pbrft: sdk.PostTxResultForTxid;
    data?: string;
    error?: string;
}
```

See also: [PostReqsToNetworkDetailsStatus](#type-postreqstonetworkdetailsstatus), [PostTxResultForTxid](#interface-posttxresultfortxid)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostReqsToNetworkResult

```ts
export interface PostReqsToNetworkResult {
    status: "success" | "error";
    beef: bsv.Beef;
    details: PostReqsToNetworkDetails[];
    pbr?: sdk.PostBeefResult;
    log: string;
}
```

See also: [PostBeefResult](#interface-postbeefresult), [PostReqsToNetworkDetails](#interface-postreqstonetworkdetails)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostTxResultForTxid

```ts
export interface PostTxResultForTxid {
    txid: string;
    status: "success" | "error";
    alreadyKnown?: boolean;
    blockHash?: string;
    blockHeight?: number;
    merklePath?: bsv.MerklePath;
    data?: object;
}
```

<details>

<summary>Interface PostTxResultForTxid Details</summary>

##### Property alreadyKnown

if true, the transaction was already known to this service. Usually treat as a success.

Potentially stop posting to additional transaction processors.

```ts
alreadyKnown?: boolean
```

##### Property status

'success' - The transaction was accepted for processing

```ts
status: "success" | "error"
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PostTxsResult

Properties on array items of result returned from `WalletServices` function `postBeef`.

```ts
export interface PostTxsResult {
    name: string;
    status: "success" | "error";
    error?: sdk.WalletError;
    txidResults: PostTxResultForTxid[];
    data?: object;
}
```

See also: [PostTxResultForTxid](#interface-posttxresultfortxid), [WalletError](#class-walleterror)

<details>

<summary>Interface PostTxsResult Details</summary>

##### Property data

Service response object. Use service name and status to infer type of object.

```ts
data?: object
```

##### Property name

The name of the service to which the transaction was submitted for processing

```ts
name: string
```

##### Property status

'success' all txids returned status of 'success'
'error' one or more txids returned status of 'error'. See txidResults for details.

```ts
status: "success" | "error"
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ProcessSyncChunkResult

```ts
export interface ProcessSyncChunkResult {
    done: boolean;
    maxUpdated_at: Date | undefined;
    updates: number;
    inserts: number;
    error?: sdk.WalletError;
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ProveCertificateArgs

```ts
export interface ProveCertificateArgs {
    certificate: Partial<WalletCertificate>;
    fieldsToReveal: CertificateFieldNameUnder50Bytes[];
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ProveCertificateResult

```ts
export interface ProveCertificateResult {
    keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    certificate: WalletCertificate;
    verifier: PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ProvenOrRawTx

```ts
export interface ProvenOrRawTx {
    proven?: table.ProvenTx;
    rawTx?: number[];
    inputBEEF?: number[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PurgeParams

```ts
export interface PurgeParams {
    purgeCompleted: boolean;
    purgeFailed: boolean;
    purgeSpent: boolean;
    purgeCompletedAge?: number;
    purgeFailedAge?: number;
    purgeSpentAge?: number;
}
```

<details>

<summary>Interface PurgeParams Details</summary>

##### Property purgeCompletedAge

Minimum age in msecs for transient completed transaction data purge.
Default is 14 days.

```ts
purgeCompletedAge?: number
```

##### Property purgeFailedAge

Minimum age in msecs for failed transaction data purge.
Default is 14 days.

```ts
purgeFailedAge?: number
```

##### Property purgeSpentAge

Minimum age in msecs for failed transaction data purge.
Default is 14 days.

```ts
purgeSpentAge?: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: PurgeResults

```ts
export interface PurgeResults {
    count: number;
    log: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RelinquishCertificateArgs

```ts
export interface RelinquishCertificateArgs {
    type: Base64String;
    serialNumber: Base64String;
    certifier: PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RelinquishCertificateResult

```ts
export interface RelinquishCertificateResult {
    relinquished: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RelinquishOutputArgs

```ts
export interface RelinquishOutputArgs {
    basket: BasketStringUnder300Bytes;
    output: OutpointString;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutpointString](#type-outpointstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RelinquishOutputResult

```ts
export interface RelinquishOutputResult {
    relinquished: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RequestSyncChunkArgs

```ts
export interface RequestSyncChunkArgs {
    fromStorageIdentityKey: string;
    toStorageIdentityKey: string;
    identityKey: string;
    since?: Date;
    maxRoughSize: number;
    maxItems: number;
    offsets: {
        name: string;
        offset: number;
    }[];
}
```

<details>

<summary>Interface RequestSyncChunkArgs Details</summary>

##### Property fromStorageIdentityKey

The storageIdentityKey of the storage supplying the update SyncChunk data.

```ts
fromStorageIdentityKey: string
```

##### Property identityKey

The identity of whose data is being requested

```ts
identityKey: string
```

##### Property maxItems

The maximum number of items (records) to be returned.

```ts
maxItems: number
```

##### Property maxRoughSize

A rough limit on how large the response should be.
The item that exceeds the limit is included and ends adding more items.

```ts
maxRoughSize: number
```

##### Property offsets

For each entity in dependency order, the offset at which to start returning items
from `since`.

The entity order is:
0 ProvenTxs
1 ProvenTxReqs
2 OutputBaskets
3 TxLabels
4 OutputTags
5 Transactions
6 TxLabelMaps
7 Commissions
8 Outputs
9 OutputTagMaps
10 Certificates
11 CertificateFields

```ts
offsets: {
    name: string;
    offset: number;
}[]
```

##### Property since

The max updated_at time received from the storage service receiving the request.
Will be undefiend if this is the first request or if no data was previously sync'ed.

`since` must include items if 'updated_at' is greater or equal. Thus, when not undefined, a sync request should always return at least one item already seen.

```ts
since?: Date
```

##### Property toStorageIdentityKey

The storageIdentityKey of the storage consuming the update SyncChunk data.

```ts
toStorageIdentityKey: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RevealCounterpartyKeyLinkageArgs

```ts
export interface RevealCounterpartyKeyLinkageArgs {
    counterparty: PubKeyHex;
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RevealCounterpartyKeyLinkageResult

```ts
export interface RevealCounterpartyKeyLinkageResult extends KeyLinkageResult {
    revelationTime: ISOTimestampString;
}
```

See also: [ISOTimestampString](#type-isotimestampstring), [KeyLinkageResult](#interface-keylinkageresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RevealSpecificKeyLinkageArgs

```ts
export interface RevealSpecificKeyLinkageArgs {
    counterparty: WalletCounterparty;
    verifier: PubKeyHex;
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    privilegedReason?: DescriptionString5to50Bytes;
    privileged?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [PubKeyHex](#type-pubkeyhex), [WalletCounterparty](#type-walletcounterparty), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: RevealSpecificKeyLinkageResult

```ts
export interface RevealSpecificKeyLinkageResult extends KeyLinkageResult {
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    proofType: Byte;
}
```

See also: [Byte](#type-byte), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [KeyLinkageResult](#interface-keylinkageresult), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ScriptTemplateParamsSABPPP

```ts
export interface ScriptTemplateParamsSABPPP {
    derivationPrefix?: string;
    derivationSuffix?: string;
    keyDeriver: sdk.KeyDeriverApi;
}
```

See also: [KeyDeriverApi](#interface-keyderiverapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SendWithResult

```ts
export interface SendWithResult {
    txid: TXIDHexString;
    status: SendWithResultStatus;
}
```

See also: [SendWithResultStatus](#type-sendwithresultstatus), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignActionArgs

```ts
export interface SignActionArgs {
    spends: Record<PositiveIntegerOrZero, SignActionSpend>;
    reference: Base64String;
    options?: SignActionOptions;
}
```

See also: [Base64String](#type-base64string), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SignActionOptions](#interface-signactionoptions), [SignActionSpend](#interface-signactionspend)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignActionOptions

```ts
export interface SignActionOptions {
    acceptDelayedBroadcast?: BooleanDefaultTrue;
    returnTXIDOnly?: BooleanDefaultFalse;
    noSend?: BooleanDefaultFalse;
    sendWith?: TXIDHexString[];
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignActionResult

```ts
export interface SignActionResult {
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    sendWithResults?: SendWithResult[];
}
```

See also: [AtomicBEEF](#type-atomicbeef), [SendWithResult](#interface-sendwithresult), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignActionSpend

```ts
export interface SignActionSpend {
    unlockingScript: HexString;
    sequenceNumber?: PositiveIntegerOrZero;
}
```

See also: [HexString](#type-hexstring), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SignableTransaction

```ts
export interface SignableTransaction {
    tx: AtomicBEEF;
    reference: Base64String;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageCreateActionResult

```ts
export interface StorageCreateActionResult {
    inputBeef?: number[];
    inputs: StorageCreateTransactionSdkInput[];
    outputs: StorageCreateTransactionSdkOutput[];
    noSendChangeOutputVouts?: number[];
    derivationPrefix: string;
    version: number;
    lockTime: number;
    reference: string;
}
```

See also: [StorageCreateTransactionSdkInput](#interface-storagecreatetransactionsdkinput), [StorageCreateTransactionSdkOutput](#interface-storagecreatetransactionsdkoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageCreateTransactionSdkInput

```ts
export interface StorageCreateTransactionSdkInput {
    vin: number;
    sourceTxid: string;
    sourceVout: number;
    sourceSatoshis: number;
    sourceLockingScript: string;
    unlockingScriptLength: number;
    providedBy: StorageProvidedBy;
    type: string;
    spendingDescription?: string;
    derivationPrefix?: string;
    derivationSuffix?: string;
    senderIdentityKey?: string;
}
```

See also: [StorageProvidedBy](#type-storageprovidedby)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageCreateTransactionSdkOutput

```ts
export interface StorageCreateTransactionSdkOutput extends sdk.ValidCreateActionOutput {
    vout: number;
    providedBy: StorageProvidedBy;
    purpose?: string;
    derivationSuffix?: string;
}
```

See also: [StorageProvidedBy](#type-storageprovidedby), [ValidCreateActionOutput](#interface-validcreateactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageFeeModel

Specifies the available options for computing transaction fees.

```ts
export interface StorageFeeModel {
    model: "sat/kb";
    value?: number;
}
```

<details>

<summary>Interface StorageFeeModel Details</summary>

##### Property model

Available models. Currently only "sat/kb" is supported.

```ts
model: "sat/kb"
```

##### Property value

When "fee.model" is "sat/kb", this is an integer representing the number of satoshis per kb of block space
the transaction will pay in fees.

If undefined, the default value is used.

```ts
value?: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageGetBeefOptions

```ts
export interface StorageGetBeefOptions {
    trustSelf?: "known";
    knownTxids?: string[];
    mergeToBeef?: bsv.Beef | number[];
    ignoreStorage?: boolean;
    ignoreServices?: boolean;
    ignoreNewProven?: boolean;
    minProofLevel?: number;
}
```

<details>

<summary>Interface StorageGetBeefOptions Details</summary>

##### Property ignoreNewProven

optional. Default is false. If true, raw transactions with proofs missing from `dojo.storage` and obtained from `dojo.getServices` are not inserted to `dojo.storage`.

```ts
ignoreNewProven?: boolean
```

##### Property ignoreServices

optional. Default is false. `dojo.getServices` is used for raw transaction and merkle proof lookup

```ts
ignoreServices?: boolean
```

##### Property ignoreStorage

optional. Default is false. `dojo.storage` is used for raw transaction and merkle proof lookup

```ts
ignoreStorage?: boolean
```

##### Property knownTxids

list of txids to be included as txidOnly if referenced. Validity is known to caller.

```ts
knownTxids?: string[]
```

##### Property mergeToBeef

optional. If defined, raw transactions and merkle paths required by txid are merged to this instance and returned. Otherwise a new Beef is constructed and returned.

```ts
mergeToBeef?: bsv.Beef | number[]
```

##### Property minProofLevel

optional. Default is zero. Ignores available merkle paths until recursion detpth equals or exceeds value

```ts
minProofLevel?: number
```

##### Property trustSelf

if 'known', txids known to local storage as valid are included as txidOnly

```ts
trustSelf?: "known"
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageIdentity

```ts
export interface StorageIdentity {
    storageIdentityKey: string;
    storageName: string;
}
```

<details>

<summary>Interface StorageIdentity Details</summary>

##### Property storageIdentityKey

The identity key (public key) assigned to this storage

```ts
storageIdentityKey: string
```

##### Property storageName

The human readable name assigned to this storage.

```ts
storageName: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageInternalizeActionResult

```ts
export interface StorageInternalizeActionResult extends sdk.InternalizeActionResult {
    isMerge: boolean;
    txid: string;
    satoshis: number;
}
```

See also: [InternalizeActionResult](#interface-internalizeactionresult)

<details>

<summary>Interface StorageInternalizeActionResult Details</summary>

##### Property isMerge

true if internalizing outputs on an existing storage transaction

```ts
isMerge: boolean
```

##### Property satoshis

net change in change balance for user due to this internalization

```ts
satoshis: number
```

##### Property txid

txid of transaction being internalized

```ts
txid: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageProcessActionArgs

```ts
export interface StorageProcessActionArgs {
    isNewTx: boolean;
    isSendWith: boolean;
    isNoSend: boolean;
    isDelayed: boolean;
    reference?: string;
    txid?: string;
    rawTx?: number[];
    sendWith: string[];
    log?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageProcessActionResults

```ts
export interface StorageProcessActionResults {
    sendWithResults?: sdk.SendWithResult[];
    log?: string;
}
```

See also: [SendWithResult](#interface-sendwithresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageProvenOrReq

```ts
export interface StorageProvenOrReq {
    proven?: table.ProvenTx;
    req?: table.ProvenTxReq;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageProviderOptions

```ts
export interface StorageProviderOptions extends StorageReaderWriterOptions {
    chain: sdk.Chain;
    feeModel: sdk.StorageFeeModel;
    commissionSatoshis: number;
    commissionPubKeyHex?: sdk.PubKeyHex;
}
```

See also: [Chain](#type-chain), [PubKeyHex](#type-pubkeyhex), [StorageFeeModel](#interface-storagefeemodel), [StorageReaderWriterOptions](#interface-storagereaderwriteroptions)

<details>

<summary>Interface StorageProviderOptions Details</summary>

##### Property commissionPubKeyHex

If commissionSatoshis is greater than zero, must be a valid public key hex string.
The actual locking script for each commission will use a public key derived
from this key by information stored in the commissions table.

```ts
commissionPubKeyHex?: sdk.PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

##### Property commissionSatoshis

Transactions created by this Storage can charge a fee per transaction.
A value of zero disables commission fees.

```ts
commissionSatoshis: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageReaderOptions

```ts
export interface StorageReaderOptions {
    chain: sdk.Chain;
}
```

See also: [Chain](#type-chain)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageReaderWriterOptions

```ts
export interface StorageReaderWriterOptions extends StorageReaderOptions {
}
```

See also: [StorageReaderOptions](#interface-storagereaderoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageSyncReader

This is the minimal interface required for a WalletStorageProvider to export data to another provider.

```ts
export interface StorageSyncReader {
    isAvailable(): boolean;
    makeAvailable(): Promise<table.Settings>;
    destroy(): Promise<void>;
    getSettings(): table.Settings;
    findUserByIdentityKey(key: string): Promise<table.User | undefined>;
    findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]>;
    findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]>;
    findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>;
    findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]>;
    findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>;
    findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>;
    findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]>;
    findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]>;
    findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]>;
    getProvenTxsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTx[]>;
    getProvenTxReqsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTxReq[]>;
    getTxLabelMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.TxLabelMap[]>;
    getOutputTagMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.OutputTagMap[]>;
    getSyncChunk(args: RequestSyncChunkArgs): Promise<SyncChunk>;
}
```

See also: [Certificate](#class-certificate), [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs), [FindCertificatesArgs](#interface-findcertificatesargs), [FindCommissionsArgs](#interface-findcommissionsargs), [FindForUserSincePagedArgs](#interface-findforusersincepagedargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputTagsArgs](#interface-findoutputtagsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindSyncStatesArgs](#interface-findsyncstatesargs), [FindTransactionsArgs](#interface-findtransactionsargs), [FindTxLabelsArgs](#interface-findtxlabelsargs), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [SyncChunk](#interface-syncchunk), [getSyncChunk](#function-getsyncchunk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageSyncReaderOptions

```ts
export interface StorageSyncReaderOptions {
    chain: sdk.Chain;
}
```

See also: [Chain](#type-chain)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: StorageSyncReaderWriter

This is the minimal interface required for a WalletStorageProvider to import and export data to another provider.

```ts
export interface StorageSyncReaderWriter extends sdk.StorageSyncReader {
    getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx>;
    purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>;
    transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>;
    findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]>;
    findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>;
    findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]>;
    findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]>;
    countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number>;
    countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number>;
    countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number>;
    countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number>;
    insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>;
    insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>;
    insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>;
    insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>;
    insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>;
    insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>;
    insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>;
    insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>;
    insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>;
    insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>;
    insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>;
    insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>;
    insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>;
    insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>;
    updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>;
    updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>;
    updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>;
    updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>;
    updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>;
    updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>;
    updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>;
    updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>;
    updateProvenTxReqDynamics(id: number, update: Partial<table.ProvenTxReqDynamics>, trx?: sdk.TrxToken): Promise<number>;
    updateProvenTxReqWithNewProvenTx(args: sdk.UpdateProvenTxReqWithNewProvenTxArgs): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult>;
    updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>;
    updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>;
    updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>;
    updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken): Promise<void>;
    updateTransactionsStatus(transactionIds: number[], status: sdk.TransactionStatus): Promise<void>;
    updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>;
    updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>;
    updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>;
    findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined>;
    findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined>;
    findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined>;
    findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined>;
    findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined>;
    findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined>;
    findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined>;
    findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined>;
    findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined>;
    findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined>;
    findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined>;
    findOrInsertUser(identityKey: string, trx?: sdk.TrxToken): Promise<{
        user: table.User;
        isNew: boolean;
    }>;
    findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken): Promise<{
        tx: table.Transaction;
        isNew: boolean;
    }>;
    findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket>;
    findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel>;
    findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap>;
    findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag>;
    findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap>;
    findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string): Promise<{
        syncState: table.SyncState;
        isNew: boolean;
    }>;
    findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<{
        req: table.ProvenTxReq;
        isNew: boolean;
    }>;
    findOrInsertProvenTx(newProven: table.ProvenTx, trx?: sdk.TrxToken): Promise<{
        proven: table.ProvenTx;
        isNew: boolean;
    }>;
    findUsers(args: sdk.FindUsersArgs): Promise<table.User[]>;
    tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void>;
    processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult>;
}
```

See also: [AuthId](#interface-authid), [Certificate](#class-certificate), [FindOutputTagMapsArgs](#interface-findoutputtagmapsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [FindProvenTxsArgs](#interface-findproventxsargs), [FindTxLabelMapsArgs](#interface-findtxlabelmapsargs), [FindUsersArgs](#interface-findusersargs), [ProcessSyncChunkResult](#interface-processsyncchunkresult), [ProvenOrRawTx](#interface-provenorrawtx), [PurgeParams](#interface-purgeparams), [PurgeResults](#interface-purgeresults), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [StorageSyncReader](#interface-storagesyncreader), [SyncChunk](#interface-syncchunk), [TransactionStatus](#type-transactionstatus), [TrxToken](#interface-trxtoken), [UpdateProvenTxReqWithNewProvenTxArgs](#interface-updateproventxreqwithnewproventxargs), [UpdateProvenTxReqWithNewProvenTxResult](#interface-updateproventxreqwithnewproventxresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: SyncChunk

Result received from remote `WalletStorage` in response to a `RequestSyncChunkArgs` request.

Each property is undefined if there was no attempt to update it. Typically this is caused by size and count limits on this result.

If all properties are empty arrays the sync process has received all available new and updated items.

```ts
export interface SyncChunk {
    fromStorageIdentityKey: string;
    toStorageIdentityKey: string;
    userIdentityKey: string;
    user?: table.User;
    provenTxs?: table.ProvenTx[];
    provenTxReqs?: table.ProvenTxReq[];
    outputBaskets?: table.OutputBasket[];
    txLabels?: table.TxLabel[];
    outputTags?: table.OutputTag[];
    transactions?: table.Transaction[];
    txLabelMaps?: table.TxLabelMap[];
    commissions?: table.Commission[];
    outputs?: table.Output[];
    outputTagMaps?: table.OutputTagMap[];
    certificates?: table.Certificate[];
    certificateFields?: table.CertificateField[];
}
```

See also: [Certificate](#class-certificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TaskPurgeParams

The database stores a variety of data that may be considered transient.

At one extreme, the data that must be preserved:
  - unspent outputs (UTXOs)
  - in-use metadata (labels, baskets, tags...)

At the other extreme, everything can be preserved to fully log all transaction creation and processing actions.

The following purge actions are available to support sustained operation:
  - Failed transactions, delete all associated data including:
      + Delete tag and label mapping records
      + Delete output records
      + Delete transaction records
      + Delete mapi_responses records
      + Delete proven_tx_reqs records
      + Delete commissions records
      + Update output records marked spentBy failed transactions
  - Completed transactions, delete transient data including:
      + transactions table set truncatedExternalInputs = null
      + transactions table set beef = null
      + transactions table set rawTx = null
      + Delete mapi_responses records
      + proven_tx_reqs table delete records

```ts
export interface TaskPurgeParams extends sdk.PurgeParams {
}
```

See also: [PurgeParams](#interface-purgeparams)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TrxToken

Place holder for the transaction control object used by actual storage provider implementation.

```ts
export interface TrxToken {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TscMerkleProofApi

```ts
export interface TscMerkleProofApi {
    height: number;
    index: number;
    nodes: string[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: TxScriptOffsets

```ts
export interface TxScriptOffsets {
    inputs: {
        vin: number;
        offset: number;
        length: number;
    }[];
    outputs: {
        vout: number;
        offset: number;
        length: number;
    }[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: UpdateProvenTxReqWithNewProvenTxArgs

```ts
export interface UpdateProvenTxReqWithNewProvenTxArgs {
    provenTxReqId: number;
    txid: string;
    attempts: number;
    status: sdk.ProvenTxReqStatus;
    history: string;
    height: number;
    index: number;
    blockHash: string;
    merkleRoot: string;
    merklePath: number[];
}
```

See also: [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: UpdateProvenTxReqWithNewProvenTxResult

```ts
export interface UpdateProvenTxReqWithNewProvenTxResult {
    status: sdk.ProvenTxReqStatus;
    history: string;
    provenTxId: number;
    log?: string;
}
```

See also: [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidAbortActionArgs

```ts
export interface ValidAbortActionArgs extends ValidWalletSignerArgs {
    reference: sdk.Base64String;
}
```

See also: [Base64String](#type-base64string), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidAcquireCertificateArgs

```ts
export interface ValidAcquireCertificateArgs extends ValidWalletSignerArgs {
    acquisitionProtocol: sdk.AcquisitionProtocol;
    type: sdk.Base64String;
    serialNumber?: sdk.Base64String;
    certifier: sdk.PubKeyHex;
    revocationOutpoint?: sdk.OutpointString;
    fields: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    signature?: sdk.HexString;
    certifierUrl?: string;
    keyringRevealer?: sdk.KeyringRevealer;
    keyringForSubject?: Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>;
    privileged: boolean;
    privilegedReason?: sdk.DescriptionString5to50Bytes;
}
```

See also: [AcquisitionProtocol](#type-acquisitionprotocol), [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidAcquireDirectCertificateArgs

```ts
export interface ValidAcquireDirectCertificateArgs extends ValidWalletSignerArgs {
    type: sdk.Base64String;
    serialNumber: sdk.Base64String;
    certifier: sdk.PubKeyHex;
    revocationOutpoint: sdk.OutpointString;
    fields: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    signature: sdk.HexString;
    subject: sdk.PubKeyHex;
    keyringRevealer: sdk.KeyringRevealer;
    keyringForSubject: Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>;
    privileged: boolean;
    privilegedReason?: sdk.DescriptionString5to50Bytes;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

<details>

<summary>Interface ValidAcquireDirectCertificateArgs Details</summary>

##### Property subject

validated to an empty string, must be provided by wallet and must
match expectations of keyringForSubject

```ts
subject: sdk.PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidBasketInsertion

```ts
export interface ValidBasketInsertion {
    basket: sdk.BasketStringUnder300Bytes;
    customInstructions?: string;
    tags: sdk.OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidCreateActionArgs

```ts
export interface ValidCreateActionArgs extends ValidProcessActionArgs {
    description: sdk.DescriptionString5to50Bytes;
    inputBEEF?: sdk.BEEF;
    inputs: sdk.ValidCreateActionInput[];
    outputs: sdk.ValidCreateActionOutput[];
    lockTime: number;
    version: number;
    labels: string[];
    options: ValidCreateActionOptions;
    isSignAction: boolean;
}
```

See also: [BEEF](#type-beef), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [ValidCreateActionInput](#interface-validcreateactioninput), [ValidCreateActionOptions](#interface-validcreateactionoptions), [ValidCreateActionOutput](#interface-validcreateactionoutput), [ValidProcessActionArgs](#interface-validprocessactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidCreateActionInput

```ts
export interface ValidCreateActionInput {
    outpoint: OutPoint;
    inputDescription: sdk.DescriptionString5to50Bytes;
    sequenceNumber: sdk.PositiveIntegerOrZero;
    unlockingScript?: sdk.HexString;
    unlockingScriptLength: sdk.PositiveInteger;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutPoint](#interface-outpoint), [PositiveInteger](#type-positiveinteger), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidCreateActionOptions

```ts
export interface ValidCreateActionOptions extends ValidProcessActionOptions {
    signAndProcess: boolean;
    trustSelf?: sdk.TrustSelf;
    knownTxids: sdk.TXIDHexString[];
    noSendChange: OutPoint[];
    randomizeOutputs: boolean;
}
```

See also: [OutPoint](#interface-outpoint), [TXIDHexString](#type-txidhexstring), [TrustSelf](#type-trustself), [ValidProcessActionOptions](#interface-validprocessactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidCreateActionOutput

```ts
export interface ValidCreateActionOutput {
    lockingScript: sdk.HexString;
    satoshis: sdk.SatoshiValue;
    outputDescription: sdk.DescriptionString5to50Bytes;
    basket?: sdk.BasketStringUnder300Bytes;
    customInstructions?: string;
    tags: sdk.OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidDiscoverByAttributesArgs

```ts
export interface ValidDiscoverByAttributesArgs extends ValidWalletSignerArgs {
    attributes: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    limit: sdk.PositiveIntegerDefault10Max10000;
    offset: sdk.PositiveIntegerOrZero;
    seekPermission: boolean;
}
```

See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidDiscoverByIdentityKeyArgs

```ts
export interface ValidDiscoverByIdentityKeyArgs extends ValidWalletSignerArgs {
    identityKey: sdk.PubKeyHex;
    limit: sdk.PositiveIntegerDefault10Max10000;
    offset: sdk.PositiveIntegerOrZero;
    seekPermission: boolean;
}
```

See also: [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidInternalizeActionArgs

```ts
export interface ValidInternalizeActionArgs extends ValidWalletSignerArgs {
    tx: sdk.AtomicBEEF;
    outputs: sdk.InternalizeOutput[];
    description: sdk.DescriptionString5to50Bytes;
    labels: sdk.LabelStringUnder300Bytes[];
    seekPermission: sdk.BooleanDefaultTrue;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [InternalizeOutput](#interface-internalizeoutput), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidInternalizeOutput

```ts
export interface ValidInternalizeOutput {
    outputIndex: sdk.PositiveIntegerOrZero;
    protocol: "wallet payment" | "basket insertion";
    paymentRemittance?: ValidWalletPayment;
    insertionRemittance?: ValidBasketInsertion;
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [ValidBasketInsertion](#interface-validbasketinsertion), [ValidWalletPayment](#interface-validwalletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidListActionsArgs

```ts
export interface ValidListActionsArgs extends ValidWalletSignerArgs {
    labels: sdk.LabelStringUnder300Bytes[];
    labelQueryMode: "any" | "all";
    includeLabels: sdk.BooleanDefaultFalse;
    includeInputs: sdk.BooleanDefaultFalse;
    includeInputSourceLockingScripts: sdk.BooleanDefaultFalse;
    includeInputUnlockingScripts: sdk.BooleanDefaultFalse;
    includeOutputs: sdk.BooleanDefaultFalse;
    includeOutputLockingScripts: sdk.BooleanDefaultFalse;
    limit: sdk.PositiveIntegerDefault10Max10000;
    offset: sdk.PositiveIntegerOrZero;
    seekPermission: sdk.BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidListCertificatesArgs

```ts
export interface ValidListCertificatesArgs extends ValidWalletSignerArgs {
    partial?: {
        type?: sdk.Base64String;
        serialNumber?: sdk.Base64String;
        certifier?: sdk.PubKeyHex;
        subject?: sdk.PubKeyHex;
        revocationOutpoint?: sdk.OutpointString;
        signature?: sdk.HexString;
    };
    certifiers: sdk.PubKeyHex[];
    types: sdk.Base64String[];
    limit: sdk.PositiveIntegerDefault10Max10000;
    offset: sdk.PositiveIntegerOrZero;
    privileged: sdk.BooleanDefaultFalse;
    privilegedReason?: sdk.DescriptionString5to50Bytes;
}
```

See also: [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidListOutputsArgs

```ts
export interface ValidListOutputsArgs extends ValidWalletSignerArgs {
    basket: sdk.BasketStringUnder300Bytes;
    tags: sdk.OutputTagStringUnder300Bytes[];
    tagQueryMode: "all" | "any";
    includeLockingScripts: boolean;
    includeTransactions: boolean;
    includeCustomInstructions: sdk.BooleanDefaultFalse;
    includeTags: sdk.BooleanDefaultFalse;
    includeLabels: sdk.BooleanDefaultFalse;
    limit: sdk.PositiveIntegerDefault10Max10000;
    offset: sdk.PositiveIntegerOrZero;
    seekPermission: sdk.BooleanDefaultTrue;
    knownTxids: string[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidProcessActionArgs

```ts
export interface ValidProcessActionArgs extends ValidWalletSignerArgs {
    options: sdk.ValidProcessActionOptions;
    isSendWith: boolean;
    isNewTx: boolean;
    isNoSend: boolean;
    isDelayed: boolean;
}
```

See also: [ValidProcessActionOptions](#interface-validprocessactionoptions), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidProcessActionOptions

```ts
export interface ValidProcessActionOptions {
    acceptDelayedBroadcast: sdk.BooleanDefaultTrue;
    returnTXIDOnly: sdk.BooleanDefaultFalse;
    noSend: sdk.BooleanDefaultFalse;
    sendWith: sdk.TXIDHexString[];
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidProveCertificateArgs

```ts
export interface ValidProveCertificateArgs extends ValidWalletSignerArgs {
    type?: sdk.Base64String;
    serialNumber?: sdk.Base64String;
    certifier?: sdk.PubKeyHex;
    subject?: sdk.PubKeyHex;
    revocationOutpoint?: sdk.OutpointString;
    signature?: sdk.HexString;
    fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[];
    verifier: sdk.PubKeyHex;
    privileged: boolean;
    privilegedReason?: sdk.DescriptionString5to50Bytes;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidRelinquishCertificateArgs

```ts
export interface ValidRelinquishCertificateArgs extends ValidWalletSignerArgs {
    type: sdk.Base64String;
    serialNumber: sdk.Base64String;
    certifier: sdk.PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidRelinquishOutputArgs

```ts
export interface ValidRelinquishOutputArgs extends ValidWalletSignerArgs {
    basket: sdk.BasketStringUnder300Bytes;
    output: sdk.OutpointString;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutpointString](#type-outpointstring), [ValidWalletSignerArgs](#interface-validwalletsignerargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidSignActionArgs

```ts
export interface ValidSignActionArgs extends ValidProcessActionArgs {
    spends: Record<sdk.PositiveIntegerOrZero, sdk.SignActionSpend>;
    reference: sdk.Base64String;
    options: sdk.ValidSignActionOptions;
}
```

See also: [Base64String](#type-base64string), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SignActionSpend](#interface-signactionspend), [ValidProcessActionArgs](#interface-validprocessactionargs), [ValidSignActionOptions](#interface-validsignactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidSignActionOptions

```ts
export interface ValidSignActionOptions extends ValidProcessActionOptions {
    acceptDelayedBroadcast: boolean;
    returnTXIDOnly: boolean;
    noSend: boolean;
    sendWith: sdk.TXIDHexString[];
}
```

See also: [TXIDHexString](#type-txidhexstring), [ValidProcessActionOptions](#interface-validprocessactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidWalletPayment

```ts
export interface ValidWalletPayment {
    derivationPrefix: sdk.Base64String;
    derivationSuffix: sdk.Base64String;
    senderIdentityKey: sdk.PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: ValidWalletSignerArgs

```ts
export interface ValidWalletSignerArgs {
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: VerifyHmacArgs

```ts
export interface VerifyHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
    hmac: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: VerifyHmacResult

```ts
export interface VerifyHmacResult {
    valid: boolean;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: VerifySignatureArgs

```ts
export interface VerifySignatureArgs extends WalletEncryptionArgs {
    data?: Byte[];
    hashToDirectlyVerify?: Byte[];
    signature: Byte[];
    forSelf?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: VerifySignatureResult

```ts
export interface VerifySignatureResult {
    valid: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: Wallet

The Wallet interface defines a wallet capable of various tasks including transaction creation and signing,
encryption, decryption, identity certificate management, identity verification, and communication
with applications as per the BRC standards. This interface allows applications to interact with
the wallet for a range of functionalities aligned with the Babbage architectural principles.

Error Handling

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When an error occurs, an exception object may be thrown which must conform to the `WalletErrorObject` interface.
Serialization layers can rely on the `isError` property being unique to error objects to
deserialize and rethrow `WalletErrorObject` conforming objects.

```ts
export interface Wallet extends WalletCryptoObject {
    createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>;
    signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>;
    abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>;
    listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>;
    internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>;
    listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>;
    relinquishOutput: (args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishOutputResult>;
    acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AcquireCertificateResult>;
    listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>;
    proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>;
    relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishCertificateResult>;
    discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    isAuthenticated: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>;
    waitForAuthentication: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>;
    getHeight: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeightResult>;
    getHeaderForHeight: (args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeaderResult>;
    getNetwork: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetNetworkResult>;
    getVersion: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetVersionResult>;
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [AuthenticatedResult](#interface-authenticatedresult), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [GetHeaderArgs](#interface-getheaderargs), [GetHeaderResult](#interface-getheaderresult), [GetHeightResult](#interface-getheightresult), [GetNetworkResult](#interface-getnetworkresult), [GetVersionResult](#interface-getversionresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [WalletCryptoObject](#interface-walletcryptoobject), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [proveCertificate](#function-provecertificate), [signAction](#function-signaction)

<details>

<summary>Interface Wallet Details</summary>

##### Property abortAction

Aborts a transaction that is in progress and has not yet been finalized or sent to the network.

```ts
abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>
```
See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property acquireCertificate

Acquires an identity certificate, whether by acquiring one from the certifier or by directly receiving it.

```ts
acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AcquireCertificateResult>
```
See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property createAction

Creates a new Bitcoin transaction based on the provided inputs, outputs, labels, locks, and other options.

```ts
createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>
```
See also: [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property discoverByAttributes

Discovers identity certificates belonging to other users, where the documents contain specific attributes, issued by a trusted entity.

```ts
discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property discoverByIdentityKey

Discovers identity certificates, issued to a given identity key by a trusted entity.

```ts
discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property getHeaderForHeight

Retrieves the block header of a block at a specified height.

```ts
getHeaderForHeight: (args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeaderResult>
```
See also: [GetHeaderArgs](#interface-getheaderargs), [GetHeaderResult](#interface-getheaderresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property getHeight

Retrieves the current height of the blockchain.

```ts
getHeight: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeightResult>
```
See also: [GetHeightResult](#interface-getheightresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property getNetwork

Retrieves the Bitcoin network the client is using (mainnet or testnet).

```ts
getNetwork: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetNetworkResult>
```
See also: [GetNetworkResult](#interface-getnetworkresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property getVersion

Retrieves the current version string of the wallet.

```ts
getVersion: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetVersionResult>
```
See also: [GetVersionResult](#interface-getversionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property internalizeAction

Submits a transaction to be internalized and optionally labeled, outputs paid to the wallet balance, inserted into baskets, and/or tagged.

```ts
internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>
```
See also: [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property isAuthenticated

Checks the authentication status of the user.

```ts
isAuthenticated: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
```
See also: [AuthenticatedResult](#interface-authenticatedresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property listActions

Lists all transactions matching the specified labels.

```ts
listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>
```
See also: [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property listCertificates

Lists identity certificates belonging to the user, filtered by certifier(s) and type(s).

```ts
listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>
```
See also: [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property listOutputs

Lists the spendable outputs kept within a specific basket, optionally tagged with specific labels.

```ts
listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>
```
See also: [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property proveCertificate

Proves select fields of an identity certificate, as specified, when requested by a verifier.

```ts
proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult)

##### Property relinquishCertificate

Relinquishes an identity certificate, removing it from the wallet regardless of whether the revocation outpoint has become spent.

```ts
relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishCertificateResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult)

##### Property relinquishOutput

Relinquish an output out of a basket, removing it from tracking without spending it.

```ts
relinquishOutput: (args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishOutputResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult)

##### Property signAction

Signs a transaction previously created using `createAction`.

```ts
signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult)

##### Property waitForAuthentication

Continuously waits until the user is authenticated, returning the result once confirmed.

```ts
waitForAuthentication: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
```
See also: [AuthenticatedResult](#interface-authenticatedresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletAction

```ts
export interface WalletAction {
    txid: TXIDHexString;
    satoshis: SatoshiValue;
    status: ActionStatus;
    isOutgoing: boolean;
    description: DescriptionString5to50Bytes;
    labels?: LabelStringUnder300Bytes[];
    version: PositiveIntegerOrZero;
    lockTime: PositiveIntegerOrZero;
    inputs?: WalletActionInput[];
    outputs?: WalletActionOutput[];
}
```

See also: [ActionStatus](#type-actionstatus), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue), [TXIDHexString](#type-txidhexstring), [WalletActionInput](#interface-walletactioninput), [WalletActionOutput](#interface-walletactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletActionInput

```ts
export interface WalletActionInput {
    sourceOutpoint: OutpointString;
    sourceSatoshis: SatoshiValue;
    sourceLockingScript?: HexString;
    unlockingScript?: HexString;
    inputDescription: DescriptionString5to50Bytes;
    sequenceNumber: PositiveIntegerOrZero;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletActionOutput

```ts
export interface WalletActionOutput {
    satoshis: SatoshiValue;
    lockingScript?: HexString;
    spendable: boolean;
    customInstructions?: string;
    tags: OutputTagStringUnder300Bytes[];
    outputIndex: PositiveIntegerOrZero;
    outputDescription: DescriptionString5to50Bytes;
    basket: BasketStringUnder300Bytes;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletCertificate

```ts
export interface WalletCertificate {
    type: Base64String;
    subject: PubKeyHex;
    serialNumber: Base64String;
    certifier: PubKeyHex;
    revocationOutpoint: OutpointString;
    signature: HexString;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletCryptoObject

The WalletCryptoObject interface defines a wallet cryptographic capabilities including:
key derivation, encryption, decryption, hmac creation and verification, signature generation and verification

Error Handling

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When an error occurs, an exception object may be thrown which must conform to the `WalletErrorObject` interface.
Serialization layers can rely on the `isError` property being unique to error objects to
deserialize and rethrow `WalletErrorObject` conforming objects.

```ts
export interface WalletCryptoObject {
    getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>;
    revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>;
    revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>;
    encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletEncryptResult>;
    decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletDecryptResult>;
    createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateHmacResult>;
    verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifyHmacResult>;
    createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateSignatureResult>;
    verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifySignatureResult>;
}
```

See also: [CreateHmacArgs](#interface-createhmacargs), [CreateHmacResult](#interface-createhmacresult), [CreateSignatureArgs](#interface-createsignatureargs), [CreateSignatureResult](#interface-createsignatureresult), [GetPublicKeyArgs](#interface-getpublickeyargs), [GetPublicKeyResult](#interface-getpublickeyresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult), [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult), [VerifyHmacArgs](#interface-verifyhmacargs), [VerifyHmacResult](#interface-verifyhmacresult), [VerifySignatureArgs](#interface-verifysignatureargs), [VerifySignatureResult](#interface-verifysignatureresult), [WalletDecryptArgs](#interface-walletdecryptargs), [WalletDecryptResult](#interface-walletdecryptresult), [WalletEncryptArgs](#interface-walletencryptargs), [WalletEncryptResult](#interface-walletencryptresult)

<details>

<summary>Interface WalletCryptoObject Details</summary>

##### Property createHmac

Creates an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateHmacResult>
```
See also: [CreateHmacArgs](#interface-createhmacargs), [CreateHmacResult](#interface-createhmacresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property createSignature

Creates a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateSignatureResult>
```
See also: [CreateSignatureArgs](#interface-createsignatureargs), [CreateSignatureResult](#interface-createsignatureresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property decrypt

Decrypts the provided ciphertext using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletDecryptResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [WalletDecryptArgs](#interface-walletdecryptargs), [WalletDecryptResult](#interface-walletdecryptresult)

##### Property encrypt

Encrypts the provided plaintext data using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletEncryptResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [WalletEncryptArgs](#interface-walletencryptargs), [WalletEncryptResult](#interface-walletencryptresult)

##### Property getPublicKey

Retrieves a derived or identity public key based on the requested protocol, key ID, counterparty, and other factors.

```ts
getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>
```
See also: [GetPublicKeyArgs](#interface-getpublickeyargs), [GetPublicKeyResult](#interface-getpublickeyresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

##### Property revealCounterpartyKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, across all interactions with the counterparty.

```ts
revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult)

##### Property revealSpecificKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, with respect to a specific interaction.

```ts
revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult)

##### Property verifyHmac

Verifies an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifyHmacResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [VerifyHmacArgs](#interface-verifyhmacargs), [VerifyHmacResult](#interface-verifyhmacresult)

##### Property verifySignature

Verifies a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifySignatureResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [VerifySignatureArgs](#interface-verifysignatureargs), [VerifySignatureResult](#interface-verifysignatureresult)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletDecryptArgs

```ts
export interface WalletDecryptArgs extends WalletEncryptionArgs {
    ciphertext: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletDecryptResult

```ts
export interface WalletDecryptResult {
    plaintext: Byte[];
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletEncryptArgs

```ts
export interface WalletEncryptArgs extends WalletEncryptionArgs {
    plaintext: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletEncryptResult

```ts
export interface WalletEncryptResult {
    ciphertext: Byte[];
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletEncryptionArgs

```ts
export interface WalletEncryptionArgs {
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    counterparty?: WalletCounterparty;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [WalletCounterparty](#type-walletcounterparty), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletErrorObject

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When errors occur, an exception object may be thrown which must conform to the `WalletErrorObject` interface.
Serialization layers can rely on the `isError` property being unique to error objects.
Deserialization should rethrow `WalletErrorObject` conforming objects.

```ts
export interface WalletErrorObject extends Error {
    isError: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletOutput

```ts
export interface WalletOutput {
    satoshis: SatoshiValue;
    lockingScript?: HexString;
    spendable: boolean;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
    outpoint: OutpointString;
    labels?: LabelStringUnder300Bytes[];
}
```

See also: [HexString](#type-hexstring), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletPayment

```ts
export interface WalletPayment {
    derivationPrefix: Base64String;
    derivationSuffix: Base64String;
    senderIdentityKey: PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletServices

Defines standard interfaces to access functionality implemented by external transaction processing services.

```ts
export interface WalletServices {
    chain: sdk.Chain;
    getChainTracker(): Promise<bsv.ChainTracker>;
    getHeaderForHeight(height: number): Promise<number[]>;
    getHeight(): Promise<number>;
    getBsvExchangeRate(): Promise<number>;
    getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR"): Promise<number>;
    getRawTx(txid: string, useNext?: boolean): Promise<GetRawTxResult>;
    getMerklePath(txid: string, useNext?: boolean): Promise<GetMerklePathResult>;
    postTxs(beef: bsv.Beef, txids: string[]): Promise<PostTxsResult[]>;
    postBeef(beef: bsv.Beef, txids: string[]): Promise<PostBeefResult[]>;
    getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormat, useNext?: boolean): Promise<GetUtxoStatusResult>;
    hashToHeader(hash: string): Promise<sdk.BlockHeaderHex>;
    nLockTimeIsFinal(txOrLockTime: string | number[] | bsv.Transaction | number): Promise<boolean>;
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [Chain](#type-chain), [GetMerklePathResult](#interface-getmerklepathresult), [GetRawTxResult](#interface-getrawtxresult), [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult), [PostBeefResult](#interface-postbeefresult), [PostTxsResult](#interface-posttxsresult)

<details>

<summary>Interface WalletServices Details</summary>

##### Property chain

The chain being serviced.

```ts
chain: sdk.Chain
```
See also: [Chain](#type-chain)

##### Method getBsvExchangeRate

Approximate exchange rate US Dollar / BSV, USD / BSV

This is the US Dollar price of one BSV

```ts
getBsvExchangeRate(): Promise<number>
```

##### Method getChainTracker

```ts
getChainTracker(): Promise<bsv.ChainTracker>
```

Returns

standard `ChainTracker` service which requires `options.chaintracks` be valid.

##### Method getFiatExchangeRate

Approximate exchange rate currency per base.

```ts
getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR"): Promise<number>
```

##### Method getHeaderForHeight

```ts
getHeaderForHeight(height: number): Promise<number[]>
```

Returns

serialized block header for height on active chain

##### Method getHeight

```ts
getHeight(): Promise<number>
```

Returns

the height of the active chain

##### Method getMerklePath

Attempts to obtain the merkle proof associated with a 32 byte transaction hash (txid).

Cycles through configured transaction processing services attempting to get a valid response.

On success:
Result txid is the requested transaction hash
Result proof will be the merkle proof.
Result name will be the responding service's identifying name.
Returns result without incrementing active service.

On failure:
Result txid is the requested transaction hash
Result mapi will be the first mapi response obtained (service name and response), or null
Result error will be the first error thrown (service name and CwiError), or null
Increments to next configured service and tries again until all services have been tried.

```ts
getMerklePath(txid: string, useNext?: boolean): Promise<GetMerklePathResult>
```
See also: [GetMerklePathResult](#interface-getmerklepathresult)

Argument Details

+ **txid**
  + transaction hash for which proof is requested
+ **useNext**
  + optional, forces skip to next service before starting service requests cycle.

##### Method getRawTx

Attempts to obtain the raw transaction bytes associated with a 32 byte transaction hash (txid).

Cycles through configured transaction processing services attempting to get a valid response.

On success:
Result txid is the requested transaction hash
Result rawTx will be Buffer containing raw transaction bytes.
Result name will be the responding service's identifying name.
Returns result without incrementing active service.

On failure:
Result txid is the requested transaction hash
Result mapi will be the first mapi response obtained (service name and response), or null
Result error will be the first error thrown (service name and CwiError), or null
Increments to next configured service and tries again until all services have been tried.

```ts
getRawTx(txid: string, useNext?: boolean): Promise<GetRawTxResult>
```
See also: [GetRawTxResult](#interface-getrawtxresult)

Argument Details

+ **txid**
  + transaction hash for which raw transaction bytes are requested
+ **useNext**
  + optional, forces skip to next service before starting service requests cycle.

##### Method getUtxoStatus

Attempts to determine the UTXO status of a transaction output.

Cycles through configured transaction processing services attempting to get a valid response.

```ts
getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormat, useNext?: boolean): Promise<GetUtxoStatusResult>
```
See also: [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult)

Argument Details

+ **output**
  + transaction output identifier in format determined by `outputFormat`.
+ **chain**
  + which chain to post to, all of rawTx's inputs must be unspent on this chain.
+ **outputFormat**
  + optional, supported values:
'hashLE' little-endian sha256 hash of output script
'hashBE' big-endian sha256 hash of output script
'script' entire transaction output script
undefined if asBuffer length of `output` is 32 then 'hashBE`, otherwise 'script'.
+ **useNext**
  + optional, forces skip to next service before starting service requests cycle.

##### Method hashToHeader

```ts
hashToHeader(hash: string): Promise<sdk.BlockHeaderHex>
```
See also: [BlockHeaderHex](#interface-blockheaderhex)

Returns

a block header

Argument Details

+ **hash**
  + block hash

##### Method nLockTimeIsFinal

```ts
nLockTimeIsFinal(txOrLockTime: string | number[] | bsv.Transaction | number): Promise<boolean>
```

Returns

whether the locktime value allows the transaction to be mined at the current chain height

Argument Details

+ **txOrLockTime**
  + either a bitcoin locktime value or hex, binary, un-encoded Transaction

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletServicesOptions

```ts
export interface WalletServicesOptions {
    chain: sdk.Chain;
    taalApiKey?: string;
    bsvExchangeRate: BsvExchangeRate;
    bsvUpdateMsecs: number;
    fiatExchangeRates: FiatExchangeRates;
    fiatUpdateMsecs: number;
    disableMapiCallback?: boolean;
    exchangeratesapiKey?: string;
    chaintracksFiatExchangeRatesUrl?: string;
    chaintracks?: ChaintracksClientApi;
}
```

See also: [BsvExchangeRate](#interface-bsvexchangerate), [Chain](#type-chain), [FiatExchangeRates](#interface-fiatexchangerates)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletSigner

Subset of `NinjaApi` interface and `NinjaBase` methods and properties that are required to support
the `NinjaWallet` implementation of the `Wallet.interface` API

```ts
export interface WalletSigner {
    chain: sdk.Chain;
    keyDeriver: sdk.KeyDeriverApi;
    setServices(v: sdk.WalletServices): void;
    getServices(): sdk.WalletServices;
    getStorageIdentity(): StorageIdentity;
    listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>;
    listOutputs(args: bsv.ListOutputsArgs, knwonTxids: string[]): Promise<bsv.ListOutputsResult>;
    createAction(args: sdk.CreateActionArgs): Promise<sdk.CreateActionResult>;
    signAction(args: sdk.SignActionArgs): Promise<sdk.SignActionResult>;
    abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>;
    internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult>;
    relinquishOutput(args: bsv.RelinquishOutputArgs): Promise<bsv.RelinquishOutputResult>;
    acquireDirectCertificate(args: sdk.AcquireCertificateArgs): Promise<sdk.AcquireCertificateResult>;
    listCertificates(args: bsv.ListCertificatesArgs): Promise<bsv.ListCertificatesResult>;
    proveCertificate(args: sdk.ProveCertificateArgs): Promise<sdk.ProveCertificateResult>;
    relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<bsv.RelinquishCertificateResult>;
    discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult>;
    discoverByAttributes(args: sdk.DiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult>;
    getChain(): Promise<sdk.Chain>;
    getClientChangeKeyPair(): KeyPair;
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [Chain](#type-chain), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriverApi](#interface-keyderiverapi), [KeyPair](#interface-keypair), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [StorageIdentity](#interface-storageidentity), [WalletServices](#interface-walletservices), [acquireDirectCertificate](#function-acquiredirectcertificate), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [proveCertificate](#function-provecertificate), [signAction](#function-signaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletStorage

This is the `WalletStorage` interface implemented by a class such as `WalletStorageManager`,
which manges an active and set of backup storage providers.

Access and conrol is not directly managed. Typically each request is made with an associated identityKey
and it is left to the providers: physical access or remote channel authentication.

```ts
export interface WalletStorage {
    isStorageProvider(): boolean;
    isAvailable(): boolean;
    makeAvailable(): Promise<table.Settings>;
    migrate(storageName: string, storageIdentityKey: string): Promise<string>;
    destroy(): Promise<void>;
    setServices(v: sdk.WalletServices): void;
    getServices(): sdk.WalletServices;
    getSettings(): table.Settings;
    getAuth(): Promise<sdk.AuthId>;
    findOrInsertUser(identityKey: string): Promise<{
        user: table.User;
        isNew: boolean;
    }>;
    abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>;
    createAction(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>;
    processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>;
    internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult>;
    findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>;
    findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>;
    findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>;
    findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>;
    listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>;
    listCertificates(args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult>;
    listOutputs(args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult>;
    insertCertificate(certificate: table.CertificateX): Promise<number>;
    relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<number>;
    relinquishOutput(args: bsv.RelinquishOutputArgs): Promise<number>;
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AuthId](#interface-authid), [Certificate](#class-certificate), [FindCertificatesArgs](#interface-findcertificatesargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishOutputArgs](#interface-relinquishoutputargs), [StorageCreateActionResult](#interface-storagecreateactionresult), [StorageProcessActionArgs](#interface-storageprocessactionargs), [StorageProcessActionResults](#interface-storageprocessactionresults), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [WalletServices](#interface-walletservices), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [processAction](#function-processaction)

<details>

<summary>Interface WalletStorage Details</summary>

##### Method isStorageProvider

```ts
isStorageProvider(): boolean
```

Returns

false

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletStorageProvider

This is the `WalletStorage` interface implemented with authentication checking and
is the actual minimal interface implemented by storage and remoted storage providers.

```ts
export interface WalletStorageProvider extends WalletStorageSync {
    isStorageProvider(): boolean;
    setServices(v: sdk.WalletServices): void;
}
```

See also: [WalletServices](#interface-walletservices), [WalletStorageSync](#interface-walletstoragesync)

<details>

<summary>Interface WalletStorageProvider Details</summary>

##### Method isStorageProvider

```ts
isStorageProvider(): boolean
```

Returns

true if this object's interface can be extended to the full `StorageProvider` interface

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletStorageReader

```ts
export interface WalletStorageReader {
    isAvailable(): boolean;
    getServices(): sdk.WalletServices;
    getSettings(): table.Settings;
    findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>;
    findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>;
    findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs): Promise<table.Output[]>;
    findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>;
    listActions(auth: sdk.AuthId, args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>;
    listCertificates(auth: sdk.AuthId, args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult>;
    listOutputs(auth: sdk.AuthId, args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult>;
}
```

See also: [AuthId](#interface-authid), [Certificate](#class-certificate), [FindCertificatesArgs](#interface-findcertificatesargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [WalletServices](#interface-walletservices), [listCertificates](#function-listcertificates)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletStorageSync

```ts
export interface WalletStorageSync extends WalletStorageWriter {
    findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string): Promise<{
        syncState: table.SyncState;
        isNew: boolean;
    }>;
    getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk>;
    processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult>;
}
```

See also: [AuthId](#interface-authid), [ProcessSyncChunkResult](#interface-processsyncchunkresult), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [SyncChunk](#interface-syncchunk), [WalletStorageWriter](#interface-walletstoragewriter), [getSyncChunk](#function-getsyncchunk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: WalletStorageWriter

```ts
export interface WalletStorageWriter extends WalletStorageReader {
    makeAvailable(): Promise<table.Settings>;
    migrate(storageName: string, storageIdentityKey: string): Promise<string>;
    destroy(): Promise<void>;
    findOrInsertUser(identityKey: string): Promise<{
        user: table.User;
        isNew: boolean;
    }>;
    abortAction(auth: sdk.AuthId, args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>;
    createAction(auth: sdk.AuthId, args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult>;
    processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>;
    internalizeAction(auth: sdk.AuthId, args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult>;
    insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>;
    relinquishCertificate(auth: sdk.AuthId, args: bsv.RelinquishCertificateArgs): Promise<number>;
    relinquishOutput(auth: sdk.AuthId, args: bsv.RelinquishOutputArgs): Promise<number>;
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AuthId](#interface-authid), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishOutputArgs](#interface-relinquishoutputargs), [StorageCreateActionResult](#interface-storagecreateactionresult), [StorageProcessActionArgs](#interface-storageprocessactionargs), [StorageProcessActionResults](#interface-storageprocessactionresults), [ValidCreateActionArgs](#interface-validcreateactionargs), [WalletStorageReader](#interface-walletstoragereader), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [processAction](#function-processaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Interface: XValidCreateActionOutput

```ts
export interface XValidCreateActionOutput extends sdk.ValidCreateActionOutput {
    vout: number;
    providedBy: sdk.StorageProvidedBy;
    purpose?: string;
    derivationSuffix?: string;
    keyOffset?: string;
}
```

See also: [StorageProvidedBy](#type-storageprovidedby), [ValidCreateActionOutput](#interface-validcreateactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Classes

| | | |
| --- | --- | --- |
| [CachedKeyDeriver](#class-cachedkeyderiver) | [TaskCheckForProofs](#class-taskcheckforproofs) | [WERR_INVALID_PUBLIC_KEY](#class-werr_invalid_public_key) |
| [CertOps](#class-certops) | [TaskClock](#class-taskclock) | [WERR_MISSING_PARAMETER](#class-werr_missing_parameter) |
| [Certificate](#class-certificate) | [TaskFailAbandoned](#class-taskfailabandoned) | [WERR_NETWORK_CHAIN](#class-werr_network_chain) |
| [KeyDeriver](#class-keyderiver) | [TaskNewHeader](#class-tasknewheader) | [WERR_NOT_IMPLEMENTED](#class-werr_not_implemented) |
| [Monitor](#class-monitor) | [TaskPurge](#class-taskpurge) | [WERR_UNAUTHORIZED](#class-werr_unauthorized) |
| [MonitorDaemon](#class-monitordaemon) | [TaskSendWaiting](#class-tasksendwaiting) | [Wallet](#class-wallet) |
| [ScriptTemplateSABPPP](#class-scripttemplatesabppp) | [TaskSyncWhenIdle](#class-tasksyncwhenidle) | [WalletCrypto](#class-walletcrypto) |
| [ServiceCollection](#class-servicecollection) | [WERR_BAD_REQUEST](#class-werr_bad_request) | [WalletError](#class-walleterror) |
| [Services](#class-services) | [WERR_INSUFFICIENT_FUNDS](#class-werr_insufficient_funds) | [WalletMonitorTask](#class-walletmonitortask) |
| [StorageProvider](#class-storageprovider) | [WERR_INTERNAL](#class-werr_internal) | [WalletSigner](#class-walletsigner) |
| [StorageReader](#class-storagereader) | [WERR_INVALID_OPERATION](#class-werr_invalid_operation) | [WalletStorageManager](#class-walletstoragemanager) |
| [StorageReaderWriter](#class-storagereaderwriter) | [WERR_INVALID_PARAMETER](#class-werr_invalid_parameter) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: CachedKeyDeriver

A cached version of KeyDeriver that caches the results of key derivation methods.
This is useful for optimizing performance when the same keys are derived multiple times.
It supports configurable cache size with sane defaults and maintains cache entries using LRU (Least Recently Used) eviction policy.

```ts
export default class CachedKeyDeriver {
    constructor(rootKey: PrivateKey | "anyone", options?: {
        maxCacheSize?: number;
    }) 
    derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
    deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
    revealCounterpartySecret(counterparty: Counterparty): number[] 
    revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
}
```

See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

<details>

<summary>Class CachedKeyDeriver Details</summary>

##### Constructor

Initializes the CachedKeyDeriver instance with a root private key and optional cache settings.

```ts
constructor(rootKey: PrivateKey | "anyone", options?: {
    maxCacheSize?: number;
}) 
```

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.
+ **options**
  + Optional settings for the cache.

##### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived private key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

##### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived public key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **forSelf**
  + Whether deriving for self.

##### Method deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to derive a symmetric key for 'anyone'.

##### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Caches the result for future calls with the same parameters.

```ts
revealCounterpartySecret(counterparty: Counterparty): number[] 
```
See also: [Counterparty](#type-counterparty)

Returns

- The shared secret as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to reveal a shared secret for 'self'.

##### Method revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: CertOps

```ts
export class CertOps extends Certificate {
    _keyring?: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    _encryptedFields?: Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>;
    _decryptedFields?: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    constructor(public wallet: sdk.WalletCrypto, wc: sdk.WalletCertificate) 
    static async fromCounterparty(wallet: sdk.WalletCrypto, e: {
        certificate: sdk.WalletCertificate;
        keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
        counterparty: sdk.PubKeyHex;
    }): Promise<CertOps> 
    static async fromCertifier(wallet: sdk.WalletCrypto, e: {
        certificate: sdk.WalletCertificate;
        keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    }): Promise<CertOps> 
    static async fromEncrypted(wallet: sdk.WalletCrypto, wc: sdk.WalletCertificate, keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>): Promise<CertOps> 
    static async fromDecrypted(wallet: sdk.WalletCrypto, wc: sdk.WalletCertificate): Promise<CertOps> 
    static copyFields<T>(fields: Record<sdk.CertificateFieldNameUnder50Bytes, T>): Record<sdk.CertificateFieldNameUnder50Bytes, T> 
    static getProtocolForCertificateFieldEncryption(serialNumber: string, fieldName: string): {
        protocolID: sdk.WalletProtocol;
        keyID: string;
    } 
    exportForSubject(): {
        certificate: sdk.WalletCertificate;
        keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    } 
    toWalletCertificate(): sdk.WalletCertificate 
    async encryptFields(counterparty: "self" | sdk.PubKeyHex = "self"): Promise<{
        fields: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
        keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
    }> 
    async decryptFields(counterparty?: sdk.PubKeyHex, keyring?: Record<sdk.CertificateFieldNameUnder50Bytes, string>): Promise<Record<sdk.CertificateFieldNameUnder50Bytes, string>> 
    async exportForCounterparty(counterparty: sdk.PubKeyHex, fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[]): Promise<{
        certificate: sdk.WalletCertificate;
        keyring: Record<sdk.CertificateFieldNameUnder50Bytes, string>;
        counterparty: sdk.PubKeyHex;
    }> 
    async createKeyringForVerifier(verifierIdentityKey: sdk.PubKeyHex, fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[], originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>> 
    async encryptAndSignNewCertificate(): Promise<void> 
}
```

See also: [Base64String](#type-base64string), [Certificate](#class-certificate), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate), [WalletCrypto](#class-walletcrypto), [WalletProtocol](#type-walletprotocol)

<details>

<summary>Class CertOps Details</summary>

##### Method createKeyringForVerifier

Creates a verifiable certificate structure for a specific verifier, allowing them access to specified fields.
This method decrypts the master field keys for each field specified in `fieldsToReveal` and re-encrypts them
for the verifier's identity key. The resulting certificate structure includes only the fields intended to be
revealed and a verifier-specific keyring for field decryption.

```ts
async createKeyringForVerifier(verifierIdentityKey: sdk.PubKeyHex, fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[], originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>> 
```
See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex)

Returns

- A new certificate structure containing the original encrypted fields, the verifier-specific field decryption keyring, and essential certificate metadata.

Argument Details

+ **verifierIdentityKey**
  + The public identity key of the verifier who will receive access to the specified fields.
+ **fieldsToReveal**
  + An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
+ **originator**
  + Optional originator identifier, used if additional context is needed for decryption and encryption operations.

Throws

Throws an error if:
- fieldsToReveal is empty or a field in `fieldsToReveal` does not exist in the certificate.
- The decrypted master field key fails to decrypt the corresponding field (indicating an invalid key).

##### Method encryptAndSignNewCertificate

encrypt plaintext field values for the subject
update the signature using the certifier's private key.

```ts
async encryptAndSignNewCertificate(): Promise<void> 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: Certificate

Represents an Identity Certificate as per the Wallet interface specifications.

This class provides methods to serialize and deserialize certificates, as well as signing and verifying the certificate's signature.

```ts
export class Certificate {
    type: Base64String;
    serialNumber: Base64String;
    subject: PubKeyHex;
    certifier: PubKeyHex;
    revocationOutpoint: OutpointString;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
    signature?: HexString;
    constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString) 
    toBin(includeSignature: boolean = true): number[] 
    static fromBin(bin: number[]): Certificate 
    async verify(): Promise<boolean> 
    async sign(certifier: WalletCrypto): Promise<void> 
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [WalletCrypto](#class-walletcrypto)

<details>

<summary>Class Certificate Details</summary>

##### Constructor

Constructs a new Certificate.

```ts
constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString) 
```
See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Argument Details

+ **type**
  + Type identifier for the certificate, base64 encoded string, 32 bytes.
+ **serialNumber**
  + Unique serial number of the certificate, base64 encoded string, 32 bytes.
+ **subject**
  + The public key belonging to the certificate's subject, compressed public key hex string.
+ **certifier**
  + Public key of the certifier who issued the certificate, compressed public key hex string.
+ **revocationOutpoint**
  + The outpoint used to confirm that the certificate has not been revoked (TXID.OutputIndex), as a string.
+ **fields**
  + All the fields present in the certificate.
+ **signature**
  + Certificate signature by the certifier's private key, DER encoded hex string.

##### Property certifier

Public key of the certifier who issued the certificate, compressed public key hex string.

```ts
certifier: PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

##### Property fields

All the fields present in the certificate, with field names as keys and field values as strings.

```ts
fields: Record<CertificateFieldNameUnder50Bytes, string>
```
See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes)

##### Property revocationOutpoint

The outpoint used to confirm that the certificate has not been revoked (TXID.OutputIndex), as a string.

```ts
revocationOutpoint: OutpointString
```
See also: [OutpointString](#type-outpointstring)

##### Property serialNumber

Unique serial number of the certificate, base64 encoded string, 32 bytes.

```ts
serialNumber: Base64String
```
See also: [Base64String](#type-base64string)

##### Property signature

Certificate signature by the certifier's private key, DER encoded hex string.

```ts
signature?: HexString
```
See also: [HexString](#type-hexstring)

##### Property subject

The public key belonging to the certificate's subject, compressed public key hex string.

```ts
subject: PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

##### Property type

Type identifier for the certificate, base64 encoded string, 32 bytes.

```ts
type: Base64String
```
See also: [Base64String](#type-base64string)

##### Method fromBin

Deserializes a certificate from binary format.

```ts
static fromBin(bin: number[]): Certificate 
```
See also: [Certificate](#class-certificate)

Returns

- The deserialized Certificate object.

Argument Details

+ **bin**
  + The binary data representing the certificate.

##### Method sign

Signs the certificate using the provided certifier wallet.

```ts
async sign(certifier: WalletCrypto): Promise<void> 
```
See also: [WalletCrypto](#class-walletcrypto)

Argument Details

+ **certifier**
  + The wallet representing the certifier.

##### Method toBin

Serializes the certificate into binary format, with or without a signature.

```ts
toBin(includeSignature: boolean = true): number[] 
```

Returns

- The serialized certificate in binary format.

Argument Details

+ **includeSignature**
  + Whether to include the signature in the serialization.

##### Method verify

Verifies the certificate's signature.

```ts
async verify(): Promise<boolean> 
```

Returns

- A promise that resolves to true if the signature is valid.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: KeyDeriver

Class responsible for deriving various types of keys using a root private key.
It supports deriving public and private keys, symmetric keys, and revealing key linkages.

```ts
export class KeyDeriver implements KeyDeriverApi {
    rootKey: PrivateKey;
    identityKey: string;
    constructor(rootKey: PrivateKey | "anyone") 
    derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
    deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
    revealCounterpartySecret(counterparty: Counterparty): number[] 
    revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
}
```

See also: [Counterparty](#type-counterparty), [KeyDeriverApi](#interface-keyderiverapi), [WalletProtocol](#type-walletprotocol)

<details>

<summary>Class KeyDeriver Details</summary>

##### Constructor

Initializes the KeyDeriver instance with a root private key.

```ts
constructor(rootKey: PrivateKey | "anyone") 
```

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.

##### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived private key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

##### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived public key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **forSelf**
  + Whether deriving for self.

##### Method deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Note: Symmetric keys should not be derivable by everyone due to security risks.

```ts
deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to derive a symmetric key for 'anyone'.

##### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Note: This should not be used for 'self'.

```ts
revealCounterpartySecret(counterparty: Counterparty): number[] 
```
See also: [Counterparty](#type-counterparty)

Returns

- The shared secret as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to reveal a shared secret for 'self'.

##### Method revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.

```ts
revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
```
See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: Monitor

Background task to make sure transactions are processed, transaction proofs are received and propagated,
and potentially that reorgs update proofs that were already received.

```ts
export class Monitor {
    static createDefaultWalletMonitorOptions(chain: sdk.Chain, storage: MonitorStorage, services?: Services): MonitorOptions 
    options: MonitorOptions;
    services: Services;
    chain: sdk.Chain;
    storage: MonitorStorage;
    chaintracks: ChaintracksClientApi;
    constructor(options: MonitorOptions) 
    oneSecond = 1000;
    oneMinute = 60 * this.oneSecond;
    oneHour = 60 * this.oneMinute;
    oneDay = 24 * this.oneHour;
    oneWeek = 7 * this.oneDay;
    _tasks: WalletMonitorTask[] = [];
    _otherTasks: WalletMonitorTask[] = [];
    _tasksRunning = false;
    defaultPurgeParams: TaskPurgeParams = {
        purgeSpent: false,
        purgeCompleted: false,
        purgeFailed: true,
        purgeSpentAge: 2 * this.oneWeek,
        purgeCompletedAge: 2 * this.oneWeek,
        purgeFailedAge: 5 * this.oneDay
    };
    addAllTasksToOther(): void 
    addDefaultTasks(): void 
    addMultiUserTasks(): void 
    addTask(task: WalletMonitorTask): void 
    removeTask(name: string): void 
    async setupChaintracksListeners(): Promise<void> 
    async runTask(name: string): Promise<string> 
    async runOnce(runAsyncSetup: boolean = true): Promise<void> 
    async startTasks(): Promise<void> 
    async logEvent(event: string, details?: string): Promise<void> 
    stopTasks(): void 
    lastNewHeader: BlockHeader | undefined;
    lastNewHeaderWhen: Date | undefined;
    processNewBlockHeader(header: BlockHeader): void 
    processReorg(depth: number, oldTip: BlockHeader, newTip: BlockHeader): void 
}
```

See also: [Chain](#type-chain), [MonitorOptions](#interface-monitoroptions), [MonitorStorage](#type-monitorstorage), [Services](#class-services), [TaskPurgeParams](#interface-taskpurgeparams), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class Monitor Details</summary>

##### Property _otherTasks

_otherTasks can be run by runTask but not by scheduler.

```ts
_otherTasks: WalletMonitorTask[] = []
```
See also: [WalletMonitorTask](#class-walletmonitortask)

##### Property _tasks

_tasks are typically run by the scheduler but may also be run by runTask.

```ts
_tasks: WalletMonitorTask[] = []
```
See also: [WalletMonitorTask](#class-walletmonitortask)

##### Method addDefaultTasks

Default tasks with settings appropriate for a single user storage
possibly with sync'ing enabled

```ts
addDefaultTasks(): void 
```

##### Method addMultiUserTasks

Tasks appropriate for multi-user storage
without sync'ing enabled.

```ts
addMultiUserTasks(): void 
```

##### Method processNewBlockHeader

Process new chain header event received from Chaintracks

Kicks processing 'unconfirmed' and 'unmined' request processing.

```ts
processNewBlockHeader(header: BlockHeader): void 
```

##### Method processReorg

Process reorg event received from Chaintracks

Reorgs can move recent transactions to new blocks at new index positions.
Affected transaction proofs become invalid and must be updated.

It is possible for a transaction to become invalid.

Coinbase transactions always become invalid.

```ts
processReorg(depth: number, oldTip: BlockHeader, newTip: BlockHeader): void 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: MonitorDaemon

```ts
export class MonitorDaemon {
    setup?: MonitorDaemonSetup;
    doneListening?: Promise<void>;
    doneTasks?: Promise<void>;
    stopDaemon: boolean = false;
    constructor(public args: MonitorDaemonSetup, public noRunTasks?: boolean) 
    async createSetup(): Promise<void> 
    async start(): Promise<void> 
    async stop(): Promise<void> 
    async destroy(): Promise<void> 
    async runDaemon(): Promise<void> 
}
```

See also: [MonitorDaemonSetup](#interface-monitordaemonsetup)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: ScriptTemplateSABPPP

```ts
export class ScriptTemplateSABPPP implements ScriptTemplate {
    p2pkh: P2PKH;
    constructor(public params: ScriptTemplateParamsSABPPP) 
    getKeyID() 
    getKeyDeriver(privKey: PrivateKey | sdk.HexString): sdk.KeyDeriverApi 
    lock(lockerPrivKey: string, unlockerPubKey: string): LockingScript 
    unlock(unlockerPrivKey: string, lockerPubKey: string, sourceSatoshis?: number, lockingScript?: Script): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx?: Transaction, inputIndex?: number) => Promise<number>;
    } 
    unlockLength = 108;
}
```

See also: [HexString](#type-hexstring), [KeyDeriverApi](#interface-keyderiverapi), [ScriptTemplateParamsSABPPP](#interface-scripttemplateparamssabppp)

<details>

<summary>Class ScriptTemplateSABPPP Details</summary>

##### Property unlockLength

P2PKH unlock estimateLength is a constant

```ts
unlockLength = 108
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: ServiceCollection

```ts
export class ServiceCollection<T> {
    services: {
        name: string;
        service: T;
    }[];
    _index: number;
    constructor(services?: {
        name: string;
        service: T;
    }[]) 
    add(s: {
        name: string;
        service: T;
    }): ServiceCollection<T> 
    remove(name: string): void 
    get name() 
    get service() 
    get allServices() 
    get count() 
    get index() 
    reset() 
    next(): number 
    clone(): ServiceCollection<T> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: Services

```ts
export class Services implements sdk.WalletServices {
    static createDefaultOptions(chain: sdk.Chain): sdk.WalletServicesOptions 
    options: sdk.WalletServicesOptions;
    getMerklePathServices: ServiceCollection<sdk.GetMerklePathService>;
    getRawTxServices: ServiceCollection<sdk.GetRawTxService>;
    postTxsServices: ServiceCollection<sdk.PostTxsService>;
    postBeefServices: ServiceCollection<sdk.PostBeefService>;
    getUtxoStatusServices: ServiceCollection<sdk.GetUtxoStatusService>;
    updateFiatExchangeRateServices: ServiceCollection<sdk.UpdateFiatExchangeRateService>;
    chain: sdk.Chain;
    constructor(optionsOrChain: sdk.Chain | sdk.WalletServicesOptions) 
    async getChainTracker(): Promise<bsv.ChainTracker> 
    async getBsvExchangeRate(): Promise<number> 
    async getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR"): Promise<number> 
    get getProofsCount() 
    get getRawTxsCount() 
    get postTxsServicesCount() 
    get postBeefServicesCount() 
    get getUtxoStatsCount() 
    async getUtxoStatus(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormat, useNext?: boolean): Promise<sdk.GetUtxoStatusResult> 
    async postTxs(beef: bsv.Beef, txids: string[]): Promise<sdk.PostTxsResult[]> 
    async postBeef(beef: bsv.Beef, txids: string[]): Promise<sdk.PostBeefResult[]> 
    async getRawTx(txid: string, useNext?: boolean): Promise<sdk.GetRawTxResult> 
    async invokeChaintracksWithRetry<R>(method: () => Promise<R>): Promise<R> 
    async getHeaderForHeight(height: number): Promise<number[]> 
    async getHeight(): Promise<number> 
    async hashToHeader(hash: string): Promise<sdk.BlockHeaderHex> 
    async getMerklePath(txid: string, useNext?: boolean): Promise<sdk.GetMerklePathResult> 
    targetCurrencies = ["USD", "GBP", "EUR"];
    async updateFiatExchangeRates(rates?: sdk.FiatExchangeRates, updateMsecs?: number): Promise<sdk.FiatExchangeRates> 
    async nLockTimeIsFinal(tx: string | number[] | bsv.Transaction | number): Promise<boolean> 
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [Chain](#type-chain), [FiatExchangeRates](#interface-fiatexchangerates), [GetMerklePathResult](#interface-getmerklepathresult), [GetMerklePathService](#type-getmerklepathservice), [GetRawTxResult](#interface-getrawtxresult), [GetRawTxService](#type-getrawtxservice), [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult), [GetUtxoStatusService](#type-getutxostatusservice), [PostBeefResult](#interface-postbeefresult), [PostBeefService](#type-postbeefservice), [PostTxsResult](#interface-posttxsresult), [PostTxsService](#type-posttxsservice), [ServiceCollection](#class-servicecollection), [UpdateFiatExchangeRateService](#type-updatefiatexchangerateservice), [WalletServices](#interface-walletservices), [WalletServicesOptions](#interface-walletservicesoptions)

<details>

<summary>Class Services Details</summary>

##### Method postTxs

The beef must contain at least each rawTx for each txid.
Some services may require input transactions as well.
These will be fetched if missing, greatly extending the service response time.

```ts
async postTxs(beef: bsv.Beef, txids: string[]): Promise<sdk.PostTxsResult[]> 
```
See also: [PostTxsResult](#interface-posttxsresult)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: StorageProvider

```ts
export abstract class StorageProvider extends StorageReaderWriter implements sdk.WalletStorageProvider {
    isDirty = false;
    _services?: sdk.WalletServices;
    feeModel: sdk.StorageFeeModel;
    commissionSatoshis: number;
    commissionPubKeyHex?: sdk.PubKeyHex;
    maxRecursionDepth?: number;
    static defaultOptions() 
    static createStorageBaseOptions(chain: sdk.Chain): StorageProviderOptions 
    constructor(options: StorageProviderOptions) 
    abstract purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>;
    abstract allocateChangeInput(userId: number, basketId: number, targetSatoshis: number, exactSatoshis: number | undefined, excludeSending: boolean, transactionId: number): Promise<table.Output | undefined>;
    abstract getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx>;
    abstract getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken): Promise<number[] | undefined>;
    abstract getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]>;
    abstract getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]>;
    abstract listActions(auth: sdk.AuthId, args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>;
    abstract listOutputs(auth: sdk.AuthId, args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult>;
    abstract countChangeInputs(userId: number, basketId: number, excludeSending: boolean): Promise<number>;
    abstract findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>;
    abstract findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>;
    abstract findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs): Promise<table.Output[]>;
    abstract insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>;
    override isStorageProvider(): boolean 
    setServices(v: sdk.WalletServices) 
    getServices(): sdk.WalletServices 
    async abortAction(auth: sdk.AuthId, args: Partial<table.Transaction>): Promise<sdk.AbortActionResult> 
    async internalizeAction(auth: sdk.AuthId, args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> 
    async getReqsAndBeefToShareWithWorld(txids: string[], knownTxids: string[], trx?: sdk.TrxToken): Promise<GetReqsAndBeefResult> 
    async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken): Promise<void> 
    async getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<sdk.StorageProvenOrReq> 
    async updateTransactionsStatus(transactionIds: number[], status: sdk.TransactionStatus): Promise<void> 
    async updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken): Promise<void> 
    async createAction(auth: sdk.AuthId, args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult> 
    async processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults> 
    async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> 
    async listCertificates(auth: sdk.AuthId, args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult> 
    async verifyKnownValidTransaction(txid: string, trx?: sdk.TrxToken): Promise<boolean> 
    async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef> 
    async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef | undefined> 
    async getBeefForTransaction(txid: string, options: sdk.StorageGetBeefOptions): Promise<bsv.Beef> 
    async findMonitorEventById(id: number, trx?: sdk.TrxToken): Promise<table.MonitorEvent | undefined> 
    async relinquishCertificate(auth: sdk.AuthId, args: bsv.RelinquishCertificateArgs): Promise<number> 
    async relinquishOutput(auth: sdk.AuthId, args: bsv.RelinquishOutputArgs): Promise<number> 
    async processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult> 
    async updateProvenTxReqWithNewProvenTx(args: sdk.UpdateProvenTxReqWithNewProvenTxArgs): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult> 
    async confirmSpendableOutputs(): Promise<{
        invalidSpendableOutputs: table.Output[];
    }> 
    async updateProvenTxReqDynamics(id: number, update: Partial<table.ProvenTxReqDynamics>, trx?: sdk.TrxToken): Promise<number> 
}
```

See also: [AbortActionResult](#interface-abortactionresult), [AuthId](#interface-authid), [Certificate](#class-certificate), [Chain](#type-chain), [FindCertificatesArgs](#interface-findcertificatesargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputsArgs](#interface-findoutputsargs), [GetReqsAndBeefResult](#interface-getreqsandbeefresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [PostReqsToNetworkResult](#interface-postreqstonetworkresult), [ProcessSyncChunkResult](#interface-processsyncchunkresult), [ProvenOrRawTx](#interface-provenorrawtx), [PubKeyHex](#type-pubkeyhex), [PurgeParams](#interface-purgeparams), [PurgeResults](#interface-purgeresults), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [StorageCreateActionResult](#interface-storagecreateactionresult), [StorageFeeModel](#interface-storagefeemodel), [StorageGetBeefOptions](#interface-storagegetbeefoptions), [StorageProcessActionArgs](#interface-storageprocessactionargs), [StorageProcessActionResults](#interface-storageprocessactionresults), [StorageProvenOrReq](#interface-storageprovenorreq), [StorageProviderOptions](#interface-storageprovideroptions), [StorageReaderWriter](#class-storagereaderwriter), [SyncChunk](#interface-syncchunk), [TransactionStatus](#type-transactionstatus), [TrustSelf](#type-trustself), [TrxToken](#interface-trxtoken), [UpdateProvenTxReqWithNewProvenTxArgs](#interface-updateproventxreqwithnewproventxargs), [UpdateProvenTxReqWithNewProvenTxResult](#interface-updateproventxreqwithnewproventxresult), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [WalletServices](#interface-walletservices), [WalletStorageProvider](#interface-walletstorageprovider), [attemptToPostReqsToNetwork](#function-attempttopostreqstonetwork), [createAction](#function-createaction), [getBeefForTransaction](#function-getbeeffortransaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [processAction](#function-processaction)

<details>

<summary>Class StorageProvider Details</summary>

##### Method confirmSpendableOutputs

For each spendable output in the 'default' basket of the authenticated user,
verify that the output script, satoshis, vout and txid match that of an output
still in the mempool of at least one service provider.

```ts
async confirmSpendableOutputs(): Promise<{
    invalidSpendableOutputs: table.Output[];
}> 
```

Returns

object with invalidSpendableOutputs array. A good result is an empty array.

##### Method getProvenOrReq

Checks if txid is a known valid ProvenTx and returns it if found.
Next checks if txid is a current ProvenTxReq and returns that if found.
If `newReq` is provided and an existing ProvenTxReq isn't found,
use `newReq` to create a new ProvenTxReq.

This is safe "findOrInsert" operation using retry if unique index constraint
is violated by a race condition insert.

```ts
async getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<sdk.StorageProvenOrReq> 
```
See also: [StorageProvenOrReq](#interface-storageprovenorreq), [TrxToken](#interface-trxtoken)

##### Method getReqsAndBeefToShareWithWorld

Given an array of transaction txids with current ProvenTxReq ready-to-share status,
lookup their DojoProvenTxReqApi req records.
For the txids with reqs and status still ready to send construct a single merged beef.

```ts
async getReqsAndBeefToShareWithWorld(txids: string[], knownTxids: string[], trx?: sdk.TrxToken): Promise<GetReqsAndBeefResult> 
```
See also: [GetReqsAndBeefResult](#interface-getreqsandbeefresult), [TrxToken](#interface-trxtoken)

##### Method updateProvenTxReqWithNewProvenTx

Handles storage changes when a valid MerklePath and mined block header are found for a ProvenTxReq txid.

Performs the following storage updates (typically):
1. Lookup the exising `ProvenTxReq` record for its rawTx
2. Insert a new ProvenTx record using properties from `args` and rawTx, yielding a new provenTxId
3. Update ProvenTxReq record with status 'completed' and new provenTxId value (and history of status changed)
4. Unpack notify transactionIds from req and update each transaction's status to 'completed', provenTxId value.
5. Update ProvenTxReq history again to record that transactions have been notified.
6. Return results...

Alterations of "typically" to handle:

```ts
async updateProvenTxReqWithNewProvenTx(args: sdk.UpdateProvenTxReqWithNewProvenTxArgs): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult> 
```
See also: [UpdateProvenTxReqWithNewProvenTxArgs](#interface-updateproventxreqwithnewproventxargs), [UpdateProvenTxReqWithNewProvenTxResult](#interface-updateproventxreqwithnewproventxresult)

##### Method updateTransactionStatus

For all `status` values besides 'failed', just updates the transaction records status property.

For 'status' of 'failed', attempts to make outputs previously allocated as inputs to this transaction usable again.

```ts
async updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken): Promise<void> 
```
See also: [TransactionStatus](#type-transactionstatus), [TrxToken](#interface-trxtoken)

Throws

ERR_DOJO_COMPLETED_TX if current status is 'completed' and new status is not 'completed.

ERR_DOJO_PROVEN_TX if transaction has proof or provenTxId and new status is not 'completed'.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: StorageReader

The `StorageReader` abstract class is the base of the concrete wallet storage provider classes.

It is the minimal interface required to read all wallet state records and is the base class for sync readers.

The next class in the heirarchy is the `StorageReaderWriter` which supports sync readers and writers.

The last class in the heirarchy is the `Storage` class which supports all active wallet operations.

The ability to construct a properly configured instance of this class implies authentication.
As such there are no user specific authenticated access checks implied in the implementation of any of these methods.

```ts
export abstract class StorageReader implements sdk.StorageSyncReader {
    chain: sdk.Chain;
    _settings?: table.Settings;
    whenLastAccess?: Date;
    get dbtype(): DBType | undefined 
    constructor(options: StorageReaderOptions) 
    isAvailable(): boolean 
    async makeAvailable(): Promise<table.Settings> 
    getSettings(): table.Settings 
    isStorageProvider(): boolean 
    abstract destroy(): Promise<void>;
    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>;
    abstract readSettings(trx?: sdk.TrxToken): Promise<table.Settings>;
    abstract findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]>;
    abstract findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>;
    abstract findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]>;
    abstract findMonitorEvents(args: sdk.FindMonitorEventsArgs): Promise<table.MonitorEvent[]>;
    abstract findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>;
    abstract findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>;
    abstract findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]>;
    abstract findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]>;
    abstract findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]>;
    abstract findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]>;
    abstract findUsers(args: sdk.FindUsersArgs): Promise<table.User[]>;
    abstract countCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<number>;
    abstract countCertificates(args: sdk.FindCertificatesArgs): Promise<number>;
    abstract countCommissions(args: sdk.FindCommissionsArgs): Promise<number>;
    abstract countMonitorEvents(args: sdk.FindMonitorEventsArgs): Promise<number>;
    abstract countOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<number>;
    abstract countOutputs(args: sdk.FindOutputsArgs): Promise<number>;
    abstract countOutputTags(args: sdk.FindOutputTagsArgs): Promise<number>;
    abstract countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number>;
    abstract countTransactions(args: sdk.FindTransactionsArgs): Promise<number>;
    abstract countTxLabels(args: sdk.FindTxLabelsArgs): Promise<number>;
    abstract countUsers(args: sdk.FindUsersArgs): Promise<number>;
    abstract getProvenTxsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTx[]>;
    abstract getProvenTxReqsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.ProvenTxReq[]>;
    abstract getTxLabelMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.TxLabelMap[]>;
    abstract getOutputTagMapsForUser(args: sdk.FindForUserSincePagedArgs): Promise<table.OutputTagMap[]>;
    async findUserByIdentityKey(key: string): Promise<table.User | undefined> 
    async getSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk> 
    validateEntity<T extends sdk.EntityTimeStamp>(entity: T, dateFields?: string[], booleanFields?: string[]): T 
    validateEntities<T extends sdk.EntityTimeStamp>(entities: T[], dateFields?: string[], booleanFields?: string[]): T[] 
    validateEntityDate(date: Date | string | number): Date | string 
    validateOptionalEntityDate(date: Date | string | number | null | undefined, useNowAsDefault?: boolean): Date | string | undefined 
    validateDate(date: Date | string | number): Date 
    validateOptionalDate(date: Date | string | number | null | undefined): Date | undefined 
    validateDateForWhere(date: Date | string | number): Date | string | number 
}
```

See also: [Certificate](#class-certificate), [Chain](#type-chain), [EntityTimeStamp](#interface-entitytimestamp), [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs), [FindCertificatesArgs](#interface-findcertificatesargs), [FindCommissionsArgs](#interface-findcommissionsargs), [FindForUserSincePagedArgs](#interface-findforusersincepagedargs), [FindMonitorEventsArgs](#interface-findmonitoreventsargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputTagsArgs](#interface-findoutputtagsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindSyncStatesArgs](#interface-findsyncstatesargs), [FindTransactionsArgs](#interface-findtransactionsargs), [FindTxLabelsArgs](#interface-findtxlabelsargs), [FindUsersArgs](#interface-findusersargs), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [StorageReaderOptions](#interface-storagereaderoptions), [StorageSyncReader](#interface-storagesyncreader), [SyncChunk](#interface-syncchunk), [TrxToken](#interface-trxtoken), [getSyncChunk](#function-getsyncchunk)

<details>

<summary>Class StorageReader Details</summary>

##### Method validateEntities

Helper to force uniform behavior across database engines.
Use to process all arrays of records with time stamps retreived from database.

```ts
validateEntities<T extends sdk.EntityTimeStamp>(entities: T[], dateFields?: string[], booleanFields?: string[]): T[] 
```
See also: [EntityTimeStamp](#interface-entitytimestamp)

Returns

input `entities` array with contained values validated.

##### Method validateEntity

Helper to force uniform behavior across database engines.
Use to process all individual records with time stamps retreived from database.

```ts
validateEntity<T extends sdk.EntityTimeStamp>(entity: T, dateFields?: string[], booleanFields?: string[]): T 
```
See also: [EntityTimeStamp](#interface-entitytimestamp)

##### Method validateEntityDate

Force dates to strings on SQLite and Date objects on MySQL

```ts
validateEntityDate(date: Date | string | number): Date | string 
```

##### Method validateOptionalEntityDate

```ts
validateOptionalEntityDate(date: Date | string | number | null | undefined, useNowAsDefault?: boolean): Date | string | undefined 
```

Argument Details

+ **useNowAsDefault**
  + if true and date is null or undefiend, set to current time.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: StorageReaderWriter

```ts
export abstract class StorageReaderWriter extends StorageReader {
    constructor(options: StorageReaderWriterOptions) 
    abstract dropAllData(): Promise<void>;
    abstract migrate(storageName: string, storageIdentityKey: string): Promise<string>;
    abstract findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]>;
    abstract findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>;
    abstract findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]>;
    abstract findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]>;
    abstract countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number>;
    abstract countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number>;
    abstract countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number>;
    abstract countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number>;
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>;
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>;
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>;
    abstract insertMonitorEvent(event: table.MonitorEvent, trx?: sdk.TrxToken): Promise<number>;
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>;
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>;
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>;
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>;
    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>;
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>;
    abstract insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>;
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>;
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>;
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>;
    abstract insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>;
    abstract updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateMonitorEvent(id: number, update: Partial<table.MonitorEvent>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>;
    abstract updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>;
    async findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined> 
    async findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined> 
    async findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined> 
    async findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined> 
    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined> 
    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined> 
    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined> 
    async findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined> 
    async findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined> 
    async findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined> 
    async findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined> 
    async findOrInsertUser(identityKey: string, trx?: sdk.TrxToken): Promise<{
        user: table.User;
        isNew: boolean;
    }> 
    async findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken): Promise<{
        tx: table.Transaction;
        isNew: boolean;
    }> 
    async findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket> 
    async findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel> 
    async findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap> 
    async findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> 
    async findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> 
    async findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string): Promise<{
        syncState: table.SyncState;
        isNew: boolean;
    }> 
    async findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<{
        req: table.ProvenTxReq;
        isNew: boolean;
    }> 
    async findOrInsertProvenTx(newProven: table.ProvenTx, trx?: sdk.TrxToken): Promise<{
        proven: table.ProvenTx;
        isNew: boolean;
    }> 
    abstract processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult>;
    async tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void> 
}
```

See also: [AuthId](#interface-authid), [Certificate](#class-certificate), [FindOutputTagMapsArgs](#interface-findoutputtagmapsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [FindProvenTxsArgs](#interface-findproventxsargs), [FindTxLabelMapsArgs](#interface-findtxlabelmapsargs), [ProcessSyncChunkResult](#interface-processsyncchunkresult), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [StorageReader](#class-storagereader), [StorageReaderWriterOptions](#interface-storagereaderwriteroptions), [SyncChunk](#interface-syncchunk), [TrxToken](#interface-trxtoken)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskCheckForProofs

`TaskCheckForProofs` is a WalletMonitor task that retreives merkle proofs for
transactions.

It is normally triggered by the Chaintracks new block header event.

When a new block is found, cwi-external-services are used to obtain proofs for
any transactions that are currently in the 'unmined' or 'unknown' state.

If a proof is obtained and validated, a new ProvenTx record is created and
the original ProvenTxReq status is advanced to 'notifying'.

```ts
export class TaskCheckForProofs extends WalletMonitorTask {
    static taskName = "CheckForProofs";
    static checkNow = false;
    constructor(monitor: Monitor, public triggerMsecs = 0) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
    async getProofs(reqs: table.ProvenTxReq[], indent = 0, countsAsAttempt = false, ignoreStatus = false): Promise<{
        proven: table.ProvenTxReq[];
        invalid: table.ProvenTxReq[];
        log: string;
    }> 
}
```

See also: [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskCheckForProofs Details</summary>

##### Property checkNow

An external service such as the chaintracks new block header
listener can set this true to cause

```ts
static checkNow = false
```

##### Method getProofs

Process an array of table.ProvenTxReq (typically with status 'unmined' or 'unknown')

If req is invalid, set status 'invalid'

Verify the requests are valid, lookup proofs or updated transaction status using the array of getProofServices,

When proofs are found, create new ProvenTxApi records and transition the requests' status to 'unconfirmed' or 'notifying',
depending on chaintracks succeeding on proof verification. 

Increments attempts if proofs where requested.

```ts
async getProofs(reqs: table.ProvenTxReq[], indent = 0, countsAsAttempt = false, ignoreStatus = false): Promise<{
    proven: table.ProvenTxReq[];
    invalid: table.ProvenTxReq[];
    log: string;
}> 
```

Returns

reqs partitioned by status

##### Method trigger

Normally triggered by checkNow getting set by new block header found event from chaintracks

```ts
trigger(nowMsecsSinceEpoch: number): {
    run: boolean;
} 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskClock

```ts
export class TaskClock extends WalletMonitorTask {
    static taskName = "Clock";
    nextMinute: number;
    constructor(monitor: Monitor, public triggerMsecs = 1 * monitor.oneSecond) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
    getNextMinute(): number 
}
```

See also: [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskFailAbandoned

Handles transactions which do not have terminal status and have not been
updated for an extended time period.

Calls `updateTransactionStatus` to set `status` to `failed`.
This returns inputs to spendable status and verifies that any
outputs are not spendable.

```ts
export class TaskFailAbandoned extends WalletMonitorTask {
    static taskName = "FailAbandoned";
    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 5) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
}
```

See also: [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskNewHeader

```ts
export class TaskNewHeader extends WalletMonitorTask {
    static taskName = "NewHeader";
    header?: sdk.BlockHeaderHex;
    constructor(monitor: Monitor, public triggerMsecs = 1 * monitor.oneMinute) 
    async getHeader(): Promise<sdk.BlockHeaderHex> 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskPurge

```ts
export class TaskPurge extends WalletMonitorTask {
    static taskName = "Purge";
    static checkNow = false;
    constructor(monitor: Monitor, public params: TaskPurgeParams, public triggerMsecs = 0) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
}
```

See also: [Monitor](#class-monitor), [TaskPurgeParams](#interface-taskpurgeparams), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskPurge Details</summary>

##### Property checkNow

Set to true to trigger running this task

```ts
static checkNow = false
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskSendWaiting

```ts
export class TaskSendWaiting extends WalletMonitorTask {
    static taskName = "SendWaiting";
    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 5, public agedMsecs = 0) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
    async processUnsent(reqApis: table.ProvenTxReq[], indent = 0): Promise<string> 
}
```

See also: [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskSendWaiting Details</summary>

##### Method processUnsent

Process an array of 'unsent' status table.ProvenTxReq 

Send rawTx to transaction processor(s), requesting proof callbacks when possible.

Set status 'invalid' if req is invalid.

Set status to 'callback' on successful network submission with callback service.

Set status to 'unmined' on successful network submission without callback service.

Add mapi responses to database table if received.

Increments attempts if sending was attempted.

```ts
async processUnsent(reqApis: table.ProvenTxReq[], indent = 0): Promise<string> 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: TaskSyncWhenIdle

```ts
export class TaskSyncWhenIdle extends WalletMonitorTask {
    static taskName = "SyncWhenIdle";
    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 1) 
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    } 
    async runTask(): Promise<string> 
}
```

See also: [Monitor](#class-monitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_BAD_REQUEST

The request is invalid.

```ts
export class WERR_BAD_REQUEST extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_INSUFFICIENT_FUNDS

Insufficient funds in the available inputs to cover the cost of the required outputs
and the transaction fee (${moreSatoshisNeeded} more satoshis are needed,
for a total of ${totalSatoshisNeeded}), plus whatever would be required in order
to pay the fee to unlock and spend the outputs used to provide the additional satoshis.

```ts
export class WERR_INSUFFICIENT_FUNDS extends WalletError {
    constructor(public totalSatoshisNeeded: number, public moreSatoshisNeeded: number) 
}
```

See also: [WalletError](#class-walleterror)

<details>

<summary>Class WERR_INSUFFICIENT_FUNDS Details</summary>

##### Constructor

```ts
constructor(public totalSatoshisNeeded: number, public moreSatoshisNeeded: number) 
```

Argument Details

+ **totalSatoshisNeeded**
  + Total satoshis required to fund transactions after net of required inputs and outputs.
+ **moreSatoshisNeeded**
  + Shortfall on total satoshis required to fund transactions after net of required inputs and outputs.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_INTERNAL

An internal error has occurred.

This is an example of an error with an optional custom `message`.

```ts
export class WERR_INTERNAL extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_INVALID_OPERATION

The ${parameter} parameter is invalid.

This is an example of an error object with a custom property `parameter` and templated `message`.

```ts
export class WERR_INVALID_OPERATION extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_INVALID_PARAMETER

The ${parameter} parameter is invalid.

This is an example of an error object with a custom property `parameter` and templated `message`.

```ts
export class WERR_INVALID_PARAMETER extends WalletError {
    constructor(public parameter: string, mustBe?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_INVALID_PUBLIC_KEY

```ts
export class WERR_INVALID_PUBLIC_KEY extends WalletError {
    constructor(public key: string, network: WalletNetwork = "mainnet") 
}
```

See also: [WalletError](#class-walleterror), [WalletNetwork](#type-walletnetwork)

<details>

<summary>Class WERR_INVALID_PUBLIC_KEY Details</summary>

##### Constructor

```ts
constructor(public key: string, network: WalletNetwork = "mainnet") 
```
See also: [WalletNetwork](#type-walletnetwork)

Argument Details

+ **key**
  + The invalid public key that caused the error.
+ **environment**
  + Optional environment flag to control whether the key is included in the message.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_MISSING_PARAMETER

The required ${parameter} parameter is missing.

This is an example of an error object with a custom property `parameter`

```ts
export class WERR_MISSING_PARAMETER extends WalletError {
    constructor(public parameter: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_NETWORK_CHAIN

Configured network chain is invalid or does not match across services.

```ts
export class WERR_NETWORK_CHAIN extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_NOT_IMPLEMENTED

Not implemented.

```ts
export class WERR_NOT_IMPLEMENTED extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WERR_UNAUTHORIZED

Access is denied due to an authorization error.

```ts
export class WERR_UNAUTHORIZED extends WalletError {
    constructor(message?: string) 
}
```

See also: [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: Wallet

```ts
export class Wallet extends sdk.WalletCrypto implements sdk.Wallet {
    signer: sdk.WalletSigner;
    services?: sdk.WalletServices;
    monitor?: Monitor;
    beef: BeefParty;
    trustSelf?: sdk.TrustSelf;
    userParty: string;
    constructor(signer: sdk.WalletSigner, keyDeriver?: sdk.KeyDeriverApi, services?: sdk.WalletServices, monitor?: Monitor) 
    getServices(): sdk.WalletServices 
    getKnownTxids(newKnownTxids?: string[]): string[] 
    async listActions(args: bsv.ListActionsArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.ListActionsResult> 
    get storageParty(): string 
    async listOutputs(args: bsv.ListOutputsArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.ListOutputsResult> 
    async listCertificates(args: bsv.ListCertificatesArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.ListCertificatesResult> 
    async acquireCertificate(args: sdk.AcquireCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult> 
    async relinquishCertificate(args: bsv.RelinquishCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.RelinquishCertificateResult> 
    async proveCertificate(args: sdk.ProveCertificateArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult> 
    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> 
    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult> 
    async createAction(args: sdk.CreateActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult> 
    async signAction(args: sdk.SignActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult> 
    async abortAction(args: sdk.AbortActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult> 
    async internalizeAction(args: sdk.InternalizeActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult> 
    async relinquishOutput(args: bsv.RelinquishOutputArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.RelinquishOutputResult> 
    async isAuthenticated(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AuthenticatedResult> 
    async waitForAuthentication(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AuthenticatedResult> 
    async getHeight(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetHeightResult> 
    async getHeaderForHeight(args: sdk.GetHeaderArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetHeaderResult> 
    async getNetwork(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetNetworkResult> 
    async getVersion(args: {}, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetVersionResult> 
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [AuthenticatedResult](#interface-authenticatedresult), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [GetHeaderArgs](#interface-getheaderargs), [GetHeaderResult](#interface-getheaderresult), [GetHeightResult](#interface-getheightresult), [GetNetworkResult](#interface-getnetworkresult), [GetVersionResult](#interface-getversionresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriverApi](#interface-keyderiverapi), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [Monitor](#class-monitor), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [TrustSelf](#type-trustself), [WalletCrypto](#class-walletcrypto), [WalletServices](#interface-walletservices), [WalletSigner](#class-walletsigner), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [proveCertificate](#function-provecertificate), [signAction](#function-signaction)

<details>

<summary>Class Wallet Details</summary>

##### Method getKnownTxids

```ts
getKnownTxids(newKnownTxids?: string[]): string[] 
```

Returns

the full list of txids whose validity this wallet claims to know.

Argument Details

+ **newKnownTxids**
  + Optional. Additional new txids known to be valid by the caller to be merged.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WalletCrypto

WalletCrypto implements single-keyring wallet cryptography functions,
operating without context about whether its configured keyring is privileged.

```ts
export class WalletCrypto implements WalletCryptoObject {
    keyDeriver: KeyDeriverApi;
    constructor(keyDeriver: KeyDeriverApi | PrivateKey) 
    async getIdentityKey(originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        publicKey: PubKeyHex;
    }> 
    async getPublicKey(args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<RevealCounterpartyKeyLinkageResult> 
    async revealSpecificKeyLinkage(args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<RevealSpecificKeyLinkageResult> 
    async encrypt(args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<WalletEncryptResult> 
    async decrypt(args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<WalletDecryptResult> 
    async createHmac(args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<CreateHmacResult> 
    async verifyHmac(args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<VerifyHmacResult> 
    async createSignature(args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<CreateSignatureResult> 
    async verifySignature(args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<VerifySignatureResult> 
}
```

See also: [CreateHmacArgs](#interface-createhmacargs), [CreateHmacResult](#interface-createhmacresult), [CreateSignatureArgs](#interface-createsignatureargs), [CreateSignatureResult](#interface-createsignatureresult), [GetPublicKeyArgs](#interface-getpublickeyargs), [KeyDeriverApi](#interface-keyderiverapi), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex), [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult), [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult), [VerifyHmacArgs](#interface-verifyhmacargs), [VerifyHmacResult](#interface-verifyhmacresult), [VerifySignatureArgs](#interface-verifysignatureargs), [VerifySignatureResult](#interface-verifysignatureresult), [WalletCryptoObject](#interface-walletcryptoobject), [WalletDecryptArgs](#interface-walletdecryptargs), [WalletDecryptResult](#interface-walletdecryptresult), [WalletEncryptArgs](#interface-walletencryptargs), [WalletEncryptResult](#interface-walletencryptresult)

<details>

<summary>Class WalletCrypto Details</summary>

##### Method getIdentityKey

Convenience method to obtain the identityKey.

```ts
async getIdentityKey(originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
    publicKey: PubKeyHex;
}> 
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex)

Returns

`await this.getPublicKey({ identityKey: true }, originator)`

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WalletError

Derived class constructors should use the derived class name as the value for `name`,
and an internationalizable constant string for `message`.

If a derived class intends to wrap another WalletError, the public property should
be named `walletError` and will be recovered by `fromUnknown`.

Optionaly, the derived class `message` can include template parameters passed in
to the constructor. See WERR_MISSING_PARAMETER for an example.

To avoid derived class name colisions, packages should include a package specific
identifier after the 'WERR_' prefix. e.g. 'WERR_FOO_' as the prefix for Foo package error
classes.

```ts
export class WalletError extends Error implements WalletErrorObject {
    isError: true = true;
    constructor(name: string, message: string, stack?: string, public details?: Record<string, string>) 
    get code(): sdk.ErrorCodeString10To40Bytes 
    set code(v: sdk.ErrorCodeString10To40Bytes) 
    get description(): sdk.ErrorDescriptionString20To200Bytes 
    set description(v: sdk.ErrorDescriptionString20To200Bytes) 
    static fromUnknown(err: unknown): WalletError 
    asStatus(): {
        status: string;
        code: string;
        description: string;
    } 
}
```

See also: [ErrorCodeString10To40Bytes](#type-errorcodestring10to40bytes), [ErrorDescriptionString20To200Bytes](#type-errordescriptionstring20to200bytes), [WalletErrorObject](#interface-walleterrorobject)

<details>

<summary>Class WalletError Details</summary>

##### Method asStatus

```ts
asStatus(): {
    status: string;
    code: string;
    description: string;
} 
```

Returns

standard HTTP error status object with status property set to 'error'.

##### Method fromUnknown

Recovers all public fields from WalletError derived error classes and relevant Error derived errors.

Critical client data fields are preserved across HTTP DojoExpress / DojoExpressClient encoding.

```ts
static fromUnknown(err: unknown): WalletError 
```
See also: [WalletError](#class-walleterror)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WalletMonitorTask

A monitor task performs some periodic or state triggered maintenance function
on the data managed by a wallet (Bitcoin UTXO manager, aka wallet)

The monitor maintains a collection of tasks.

It runs each task's non-asynchronous trigger to determine if the runTask method needs to run.

Tasks that need to be run are run consecutively by awaiting their async runTask override method.

The monitor then waits a fixed interval before repeating...

Tasks may use the monitor_events table to persist their execution history.
This is done by accessing the wathman.storage object.

```ts
export abstract class WalletMonitorTask {
    lastRunMsecsSinceEpoch = 0;
    storage: MonitorStorage;
    constructor(public monitor: Monitor, public name: string) 
    async asyncSetup(): Promise<void> 
    abstract trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    };
    abstract runTask(): Promise<string>;
}
```

See also: [Monitor](#class-monitor), [MonitorStorage](#type-monitorstorage)

<details>

<summary>Class WalletMonitorTask Details</summary>

##### Property lastRunMsecsSinceEpoch

Set by monitor each time runTask completes

```ts
lastRunMsecsSinceEpoch = 0
```

##### Method asyncSetup

Override to handle async task setup configuration.

Called before first call to `trigger`

```ts
async asyncSetup(): Promise<void> 
```

##### Method trigger

Return true if `runTask` needs to be called now.

```ts
abstract trigger(nowMsecsSinceEpoch: number): {
    run: boolean;
}
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WalletSigner

```ts
export class WalletSigner implements sdk.WalletSigner {
    chain: sdk.Chain;
    keyDeriver: sdk.KeyDeriverApi;
    storage: WalletStorageManager;
    _services?: sdk.WalletServices;
    identityKey: string;
    pendingSignActions: Record<string, PendingSignAction>;
    constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: WalletStorageManager) 
    setServices(v: sdk.WalletServices) 
    getServices(): sdk.WalletServices 
    getStorageIdentity(): sdk.StorageIdentity 
    getClientChangeKeyPair(): sdk.KeyPair 
    async getChain(): Promise<sdk.Chain> 
    async listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult> 
    async listOutputs(args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult> 
    async listCertificates(args: bsv.ListCertificatesArgs): Promise<bsv.ListCertificatesResult> 
    async abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult> 
    async createAction(args: sdk.CreateActionArgs): Promise<sdk.CreateActionResult> 
    async signAction(args: sdk.SignActionArgs): Promise<sdk.SignActionResult> 
    async internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> 
    async relinquishOutput(args: bsv.RelinquishOutputArgs): Promise<bsv.RelinquishOutputResult> 
    async relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<bsv.RelinquishCertificateResult> 
    async acquireDirectCertificate(args: sdk.AcquireCertificateArgs): Promise<sdk.AcquireCertificateResult> 
    async proveCertificate(args: sdk.ProveCertificateArgs): Promise<sdk.ProveCertificateResult> 
    async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult> 
    async discoverByAttributes(args: sdk.DiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult> 
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [Chain](#type-chain), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriver](#class-keyderiver), [KeyDeriverApi](#interface-keyderiverapi), [KeyPair](#interface-keypair), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [PendingSignAction](#interface-pendingsignaction), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [StorageIdentity](#interface-storageidentity), [WalletServices](#interface-walletservices), [WalletStorageManager](#class-walletstoragemanager), [acquireDirectCertificate](#function-acquiredirectcertificate), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [proveCertificate](#function-provecertificate), [signAction](#function-signaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Class: WalletStorageManager

The `SignerStorage` class delivers authentication checking storage access to the wallet.

If manages multiple `StorageBase` derived storage services: one actice, the rest as backups.

Of the storage services, one is 'active' at any one time.
On startup, and whenever triggered by the wallet, `SignerStorage` runs a syncrhonization sequence:

1. While synchronizing, all other access to storage is blocked waiting.
2. The active service is confirmed, potentially triggering a resolution process if there is disagreement.
3. Changes are pushed from the active storage service to each inactive, backup service.

Some storage services do not support multiple writers. `SignerStorage` manages wait-blocking write requests
for these services.

```ts
export class WalletStorageManager implements sdk.WalletStorage {
    stores: sdk.WalletStorageProvider[] = [];
    _authId: sdk.AuthId;
    _services?: sdk.WalletServices;
    _userIdentityKeyToId: Record<string, number> = {};
    _readerCount: number = 0;
    _writerCount: number = 0;
    _isSingleWriter: boolean = true;
    _syncLocked: boolean = false;
    _storageProviderLocked: boolean = false;
    constructor(identityKey: string, active?: sdk.WalletStorageProvider, backups?: sdk.WalletStorageProvider[]) 
    isStorageProvider(): boolean 
    async getUserId(): Promise<number> 
    async getAuth(): Promise<sdk.AuthId> 
    getActive(): sdk.WalletStorageProvider 
    async getActiveForWriter(): Promise<sdk.WalletStorageWriter> 
    async getActiveForReader(): Promise<sdk.WalletStorageReader> 
    async getActiveForSync(): Promise<sdk.WalletStorageSync> 
    async getActiveForStorageProvider(): Promise<StorageProvider> 
    async runAsWriter<R>(writer: (active: sdk.WalletStorageWriter) => Promise<R>): Promise<R> 
    async runAsReader<R>(reader: (active: sdk.WalletStorageReader) => Promise<R>): Promise<R> 
    async runAsSync<R>(sync: (active: sdk.WalletStorageSync) => Promise<R>, activeSync?: sdk.WalletStorageSync): Promise<R> 
    async runAsStorageProvider<R>(sync: (active: StorageProvider) => Promise<R>): Promise<R> 
    isActiveStorageProvider(): boolean 
    isAvailable(): boolean 
    async addWalletStorageProvider(provider: sdk.WalletStorageProvider): Promise<void> 
    setServices(v: sdk.WalletServices) 
    getServices(): sdk.WalletServices 
    getSettings(): table.Settings 
    async makeAvailable(): Promise<table.Settings> 
    async migrate(storageName: string, storageIdentityKey: string): Promise<string> 
    async destroy(): Promise<void> 
    async findOrInsertUser(identityKey: string): Promise<{
        user: table.User;
        isNew: boolean;
    }> 
    async abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult> 
    async createAction(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateActionResult> 
    async internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> 
    async relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<number> 
    async relinquishOutput(args: bsv.RelinquishOutputArgs): Promise<number> 
    async processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults> 
    async insertCertificate(certificate: table.Certificate): Promise<number> 
    async listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult> 
    async listCertificates(args: sdk.ValidListCertificatesArgs): Promise<bsv.ListCertificatesResult> 
    async listOutputs(args: bsv.ListOutputsArgs): Promise<bsv.ListOutputsResult> 
    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> 
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> 
    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> 
    async findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]> 
    async syncFromReader(identityKey: string, reader: StorageSyncReader): Promise<void> 
    async updateBackups(activeSync?: sdk.WalletStorageSync) 
    async syncToWriter(auth: sdk.AuthId, writer: sdk.WalletStorageProvider, activeSync?: sdk.WalletStorageSync): Promise<{
        inserts: number;
        updates: number;
    }> 
    async setActive(storageIdentityKey: string): Promise<void> 
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AuthId](#interface-authid), [Certificate](#class-certificate), [FindCertificatesArgs](#interface-findcertificatesargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishOutputArgs](#interface-relinquishoutputargs), [StorageCreateActionResult](#interface-storagecreateactionresult), [StorageProcessActionArgs](#interface-storageprocessactionargs), [StorageProcessActionResults](#interface-storageprocessactionresults), [StorageProvider](#class-storageprovider), [StorageSyncReader](#interface-storagesyncreader), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [WalletServices](#interface-walletservices), [WalletStorage](#interface-walletstorage), [WalletStorageProvider](#interface-walletstorageprovider), [WalletStorageReader](#interface-walletstoragereader), [WalletStorageSync](#interface-walletstoragesync), [WalletStorageWriter](#interface-walletstoragewriter), [createAction](#function-createaction), [internalizeAction](#function-internalizeaction), [listCertificates](#function-listcertificates), [processAction](#function-processaction)

<details>

<summary>Class WalletStorageManager Details</summary>

##### Property _isSingleWriter

if true, allow only a single writer to proceed at a time.
queue the blocked requests so they get executed in order when released.

```ts
_isSingleWriter: boolean = true
```

##### Property _storageProviderLocked

if true, allow no new reader or writers or sync to proceed.
queue the blocked requests so they get executed in order when released.

```ts
_storageProviderLocked: boolean = false
```

##### Property _syncLocked

if true, allow no new reader or writers to proceed.
queue the blocked requests so they get executed in order when released.

```ts
_syncLocked: boolean = false
```

##### Method isActiveStorageProvider

```ts
isActiveStorageProvider(): boolean 
```

Returns

true if the active `WalletStorageProvider` also implements `StorageProvider`

##### Method runAsSync

```ts
async runAsSync<R>(sync: (active: sdk.WalletStorageSync) => Promise<R>, activeSync?: sdk.WalletStorageSync): Promise<R> 
```
See also: [WalletStorageSync](#interface-walletstoragesync)

Argument Details

+ **sync**
  + the function to run with sync access lock
+ **activeSync**
  + from chained sync functions, active storage already held under sync access lock.

##### Method setActive

Updates backups and switches to new active storage provider from among current backup providers.

```ts
async setActive(storageIdentityKey: string): Promise<void> 
```

Argument Details

+ **storageIdentityKey**
  + of current backup storage provider that is to become the new active provider.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Functions

| | | |
| --- | --- | --- |
| [acquireDirectCertificate](#function-acquiredirectcertificate) | [makeGetMerklePathFromTaalARC](#function-makegetmerklepathfromtaalarc) | [validateDiscoverByAttributesArgs](#function-validatediscoverbyattributesargs) |
| [arraysEqual](#function-arraysequal) | [makePostBeefResult](#function-makepostbeefresult) | [validateDiscoverByIdentityKeyArgs](#function-validatediscoverbyidentitykeyargs) |
| [asArray](#function-asarray) | [makePostBeefToTaalARC](#function-makepostbeeftotaalarc) | [validateGenerateChangeSdkParams](#function-validategeneratechangesdkparams) |
| [asBsvSdkPrivateKey](#function-asbsvsdkprivatekey) | [makePostTxsToTaalARC](#function-makeposttxstotaalarc) | [validateGenerateChangeSdkResult](#function-validategeneratechangesdkresult) |
| [asBsvSdkPublickKey](#function-asbsvsdkpublickkey) | [maxDate](#function-maxdate) | [validateInteger](#function-validateinteger) |
| [asBsvSdkScript](#function-asbsvsdkscript) | [offsetPubKey](#function-offsetpubkey) | [validateInternalizeActionArgs](#function-validateinternalizeactionargs) |
| [asBsvSdkTx](#function-asbsvsdktx) | [optionalArraysEqual](#function-optionalarraysequal) | [validateInternalizeOutput](#function-validateinternalizeoutput) |
| [asBuffer](#function-asbuffer) | [parseTxScriptOffsets](#function-parsetxscriptoffsets) | [validateListActionsArgs](#function-validatelistactionsargs) |
| [asString](#function-asstring) | [parseWalletOutpoint](#function-parsewalletoutpoint) | [validateListCertificatesArgs](#function-validatelistcertificatesargs) |
| [attemptToPostReqsToNetwork](#function-attempttopostreqstonetwork) | [postBeefToArcMiner](#function-postbeeftoarcminer) | [validateListOutputsArgs](#function-validatelistoutputsargs) |
| [completeSignedTransaction](#function-completesignedtransaction) | [postBeefToTaalArcMiner](#function-postbeeftotaalarcminer) | [validateOptionalInteger](#function-validateoptionalinteger) |
| [completeSignedTransaction](#function-completesignedtransaction) | [postTxsToTaalArcMiner](#function-posttxstotaalarcminer) | [validateOptionalOutpointString](#function-validateoptionaloutpointstring) |
| [convertProofToMerklePath](#function-convertprooftomerklepath) | [processAction](#function-processaction) | [validateOriginator](#function-validateoriginator) |
| [createAction](#function-createaction) | [processAction](#function-processaction) | [validateOutpointString](#function-validateoutpointstring) |
| [createAction](#function-createaction) | [proveCertificate](#function-provecertificate) | [validatePositiveIntegerOrZero](#function-validatepositiveintegerorzero) |
| [createDefaultWalletServicesOptions](#function-createdefaultwalletservicesoptions) | [randomBytes](#function-randombytes) | [validateProveCertificateArgs](#function-validateprovecertificateargs) |
| [createStorageServiceChargeScript](#function-createstorageservicechargescript) | [randomBytesBase64](#function-randombytesbase64) | [validateRelinquishCertificateArgs](#function-validaterelinquishcertificateargs) |
| [deserializeTscMerkleProofNodes](#function-deserializetscmerkleproofnodes) | [randomBytesHex](#function-randombyteshex) | [validateRelinquishOutputArgs](#function-validaterelinquishoutputargs) |
| [doubleSha256BE](#function-doublesha256be) | [sha256Hash](#function-sha256hash) | [validateSatoshis](#function-validatesatoshis) |
| [doubleSha256HashLE](#function-doublesha256hashle) | [signAction](#function-signaction) | [validateScriptHash](#function-validatescripthash) |
| [generateChangeSdk](#function-generatechangesdk) | [stampLog](#function-stamplog) | [validateSecondsSinceEpoch](#function-validatesecondssinceepoch) |
| [generateChangeSdkMakeStorage](#function-generatechangesdkmakestorage) | [stampLogFormat](#function-stamplogformat) | [validateSignActionArgs](#function-validatesignactionargs) |
| [getBeefForTransaction](#function-getbeeffortransaction) | [toBinaryBaseBlockHeaderHex](#function-tobinarybaseblockheaderhex) | [validateSignActionOptions](#function-validatesignactionoptions) |
| [getExchangeRatesIo](#function-getexchangeratesio) | [toWalletNetwork](#function-towalletnetwork) | [validateStorageFeeModel](#function-validatestoragefeemodel) |
| [getMerklePathFromTaalARC](#function-getmerklepathfromtaalarc) | [transactionInputSize](#function-transactioninputsize) | [validateStringLength](#function-validatestringlength) |
| [getMerklePathFromWhatsOnChainTsc](#function-getmerklepathfromwhatsonchaintsc) | [transactionOutputSize](#function-transactionoutputsize) | [validateWalletPayment](#function-validatewalletpayment) |
| [getRawTxFromWhatsOnChain](#function-getrawtxfromwhatsonchain) | [transactionSize](#function-transactionsize) | [varUintSize](#function-varuintsize) |
| [getSyncChunk](#function-getsyncchunk) | [updateBsvExchangeRate](#function-updatebsvexchangerate) | [verifyHexString](#function-verifyhexstring) |
| [getTaalArcServiceConfig](#function-gettaalarcserviceconfig) | [updateChaintracksFiatExchangeRates](#function-updatechaintracksfiatexchangerates) | [verifyId](#function-verifyid) |
| [getUtxoStatusFromWhatsOnChain](#function-getutxostatusfromwhatsonchain) | [updateExchangeratesapi](#function-updateexchangeratesapi) | [verifyInteger](#function-verifyinteger) |
| [internalizeAction](#function-internalizeaction) | [validateAbortActionArgs](#function-validateabortactionargs) | [verifyNumber](#function-verifynumber) |
| [internalizeAction](#function-internalizeaction) | [validateAcquireCertificateArgs](#function-validateacquirecertificateargs) | [verifyOne](#function-verifyone) |
| [isHexString](#function-ishexstring) | [validateAcquireDirectCertificateArgs](#function-validateacquiredirectcertificateargs) | [verifyOneOrNone](#function-verifyoneornone) |
| [listCertificates](#function-listcertificates) | [validateBasketInsertion](#function-validatebasketinsertion) | [verifyOptionalHexString](#function-verifyoptionalhexstring) |
| [lockScriptWithKeyOffsetFromPubKey](#function-lockscriptwithkeyoffsetfrompubkey) | [validateCreateActionArgs](#function-validatecreateactionargs) | [verifyTruthy](#function-verifytruthy) |
| [makeAtomicBeef](#function-makeatomicbeef) | [validateCreateActionInput](#function-validatecreateactioninput) | [wait](#function-wait) |
| [makeAtomicBeef](#function-makeatomicbeef) | [validateCreateActionOptions](#function-validatecreateactionoptions) |  |
| [makeErrorResult](#function-makeerrorresult) | [validateCreateActionOutput](#function-validatecreateactionoutput) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: acquireDirectCertificate

```ts
export async function acquireDirectCertificate(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidAcquireDirectCertificateArgs): Promise<sdk.AcquireCertificateResult> 
```

See also: [AcquireCertificateResult](#interface-acquirecertificateresult), [AuthId](#interface-authid), [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: arraysEqual

Compares lengths and direct equality of values.

```ts
export function arraysEqual(arr1: Number[], arr2: Number[]) 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asArray

```ts
export function asArray(val: Buffer | string | number[], encoding?: BufferEncoding): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asBsvSdkPrivateKey

```ts
export function asBsvSdkPrivateKey(privKey: string): PrivateKey 
```

<details>

<summary>Function asBsvSdkPrivateKey Details</summary>

Argument Details

+ **privKey**
  + bitcoin private key in 32 byte hex string form

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asBsvSdkPublickKey

```ts
export function asBsvSdkPublickKey(pubKey: string): PublicKey 
```

<details>

<summary>Function asBsvSdkPublickKey Details</summary>

Argument Details

+ **pubKey**
  + bitcoin public key in standard compressed key hex string form

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asBsvSdkScript

Coerce a bsv script encoded as a hex string, serialized Buffer, or Script to Script
If script is already a Script, just return it.

```ts
export function asBsvSdkScript(script: sdk.HexString | number[] | Script): Script {
    if (Array.isArray(script)) {
        script = Script.fromBinary(script);
    }
    else if (typeof script === "string") {
        script = Script.fromHex(script);
    }
    return script;
}
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asBsvSdkTx

Coerce a bsv transaction encoded as a hex string, serialized Buffer, or Transaction to Transaction
If tx is already a Transaction, just return it.

```ts
export function asBsvSdkTx(tx: sdk.HexString | number[] | Transaction): Transaction {
    if (Array.isArray(tx)) {
        tx = Transaction.fromBinary(tx);
    }
    else if (typeof tx === "string") {
        tx = Transaction.fromHex(tx);
    }
    return tx;
}
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asBuffer

Coerce a value to Buffer if currently encoded as a string or

```ts
export function asBuffer(val: Buffer | string | number[], encoding?: BufferEncoding): Buffer {
    let b: Buffer;
    if (Buffer.isBuffer(val))
        b = val;
    else if (typeof val === "string")
        b = Buffer.from(val, encoding ?? "hex");
    else
        b = Buffer.from(val);
    return b;
}
```

<details>

<summary>Function asBuffer Details</summary>

Returns

input val if it is a Buffer or new Buffer from string val

Argument Details

+ **val**
  + Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
+ **encoding**
  + defaults to 'hex'. Only applies to val of type string

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: asString

Coerce a value to an encoded string if currently a Buffer or number[]

```ts
export function asString(val: Buffer | string | number[], encoding?: BufferEncoding): string {
    if (Array.isArray(val))
        val = Buffer.from(val);
    return Buffer.isBuffer(val) ? val.toString(encoding ?? "hex") : val;
}
```

<details>

<summary>Function asString Details</summary>

Returns

input val if it is a string; or if number[], first converted to Buffer then as Buffer; if Buffer encoded using `encoding`

Argument Details

+ **val**
  + Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
+ **encoding**
  + defaults to 'hex'

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: attemptToPostReqsToNetwork

Attempt to post one or more `ProvenTxReq` with status 'unsent'
to the bitcoin network.

```ts
export async function attemptToPostReqsToNetwork(storage: StorageProvider, reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> 
```

See also: [PostReqsToNetworkResult](#interface-postreqstonetworkresult), [StorageProvider](#class-storageprovider), [TrxToken](#interface-trxtoken)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: completeSignedTransaction

```ts
export async function completeSignedTransaction(prior: PendingSignAction, spends: Record<number, sdk.SignActionSpend>, signer: WalletSigner): Promise<Transaction> 
```

See also: [PendingSignAction](#interface-pendingsignaction), [SignActionSpend](#interface-signactionspend), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: completeSignedTransaction

```ts
export async function completeSignedTransaction(prior: PendingSignAction, spends: Record<number, sdk.SignActionSpend>, ninja: WalletSigner): Promise<bsv.Transaction> 
```

See also: [PendingSignAction](#interface-pendingsignaction), [SignActionSpend](#interface-signactionspend), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: convertProofToMerklePath

```ts
export function convertProofToMerklePath(txid: string, proof: TscMerkleProofApi): bsv.MerklePath 
```

See also: [TscMerkleProofApi](#interface-tscmerkleproofapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createAction

```ts
export async function createAction(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidCreateActionArgs): Promise<sdk.CreateActionResult> 
```

See also: [AuthId](#interface-authid), [CreateActionResult](#interface-createactionresult), [ValidCreateActionArgs](#interface-validcreateactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createAction

```ts
export async function createAction(storage: StorageProvider, auth: sdk.AuthId, vargs: sdk.ValidCreateActionArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateActionResult> 
```

See also: [AuthId](#interface-authid), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [StorageCreateActionResult](#interface-storagecreateactionresult), [StorageProvider](#class-storageprovider), [ValidCreateActionArgs](#interface-validcreateactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createDefaultWalletServicesOptions

```ts
export function createDefaultWalletServicesOptions(chain: sdk.Chain): sdk.WalletServicesOptions 
```

See also: [Chain](#type-chain), [WalletServicesOptions](#interface-walletservicesoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: createStorageServiceChargeScript

```ts
export function createStorageServiceChargeScript(pubKeyHex: bsv.PubKeyHex): {
    script: string;
    keyOffset: string;
} 
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: deserializeTscMerkleProofNodes

```ts
export function deserializeTscMerkleProofNodes(nodes: Buffer): string[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: doubleSha256BE

Calculate the SHA256 hash of the SHA256 hash of an array of bytes.

```ts
export function doubleSha256BE(data: number[]): number[] {
    return doubleSha256HashLE(data).reverse();
}
```

See also: [doubleSha256HashLE](#function-doublesha256hashle)

<details>

<summary>Function doubleSha256BE Details</summary>

Returns

reversed (big-endian) double sha256 hash of data, byte 31 of hash first.

Argument Details

+ **data**
  + is an array of bytes.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: doubleSha256HashLE

Calculate the SHA256 hash of the SHA256 hash of an array of bytes.

```ts
export function doubleSha256HashLE(data: number[]): number[] {
    const first = new Hash.SHA256().update(data).digest();
    const second = new Hash.SHA256().update(first).digest();
    return second;
}
```

<details>

<summary>Function doubleSha256HashLE Details</summary>

Returns

double sha256 hash of data, byte 0 of hash first.

Argument Details

+ **data**
  + an array of bytes

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: generateChangeSdk

Simplifications:
 - only support one change type with fixed length scripts.
 - only support satsPerKb fee model.

Confirms for each availbleChange output that it remains available as they are allocated and selects alternate if not.

```ts
export async function generateChangeSdk(params: GenerateChangeSdkParams, allocateChangeInput: (targetSatoshis: number, exactSatoshis?: number) => Promise<GenerateChangeSdkChangeInput | undefined>, releaseChangeInput: (outputId: number) => Promise<void>): Promise<GenerateChangeSdkResult> 
```

See also: [GenerateChangeSdkChangeInput](#interface-generatechangesdkchangeinput), [GenerateChangeSdkParams](#interface-generatechangesdkparams), [GenerateChangeSdkResult](#interface-generatechangesdkresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: generateChangeSdkMakeStorage

```ts
export function generateChangeSdkMakeStorage(availableChange: GenerateChangeSdkChangeInput[]): {
    allocateChangeInput: (targetSatoshis: number, exactSatoshis?: number) => Promise<GenerateChangeSdkChangeInput | undefined>;
    releaseChangeInput: (outputId: number) => Promise<void>;
    getLog: () => string;
} 
```

See also: [GenerateChangeSdkChangeInput](#interface-generatechangesdkchangeinput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getBeefForTransaction

Creates a `Beef` to support the validity of a transaction identified by its `txid`.

`dojo.storage` is used to retrieve proven transactions and their merkle paths,
or proven_tx_req record with beef of external inputs (internal inputs meged by recursion).
Otherwise external services are used.

`dojo.options.maxRecursionDepth` can be set to prevent overly deep chained dependencies. Will throw ERR_EXTSVS_ENVELOPE_DEPTH if exceeded.

If `trustSelf` is true, a partial `Beef` will be returned where transactions known by `dojo.storage` to
be valid by verified proof are represented solely by 'txid'.

If `knownTxids` is defined, any 'txid' required by the `Beef` that appears in the array is represented solely as a 'known' txid.

```ts
export async function getBeefForTransaction(storage: StorageProvider, txid: string, options: sdk.StorageGetBeefOptions): Promise<bsv.Beef> 
```

See also: [StorageGetBeefOptions](#interface-storagegetbeefoptions), [StorageProvider](#class-storageprovider)

<details>

<summary>Function getBeefForTransaction Details</summary>

Argument Details

+ **storage**
  + the chain on which txid exists.
+ **txid**
  + the transaction hash for which an envelope is requested.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getExchangeRatesIo

```ts
export async function getExchangeRatesIo(key: string): Promise<ExchangeRatesIoApi> 
```

See also: [ExchangeRatesIoApi](#interface-exchangeratesioapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getMerklePathFromTaalARC

```ts
export async function getMerklePathFromTaalARC(txid: string, config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.GetMerklePathResult> 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getMerklePathFromWhatsOnChainTsc

WhatOnChain.com has their own "hash/pos/R/L" proof format and a more TSC compliant proof format.

The "/proof/tsc" endpoint is much closer to the TSC specification. It provides "index" directly and each node is just the provided hash value.
The "targetType" is unspecified and thus defaults to block header hash, requiring a Chaintracks lookup to get the merkleRoot...
Duplicate hash values are provided in full instead of being replaced by "*".

```ts
export async function getMerklePathFromWhatsOnChainTsc(txid: string, chain: sdk.Chain, services: sdk.WalletServices): Promise<sdk.GetMerklePathResult> 
```

See also: [Chain](#type-chain), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getRawTxFromWhatsOnChain

```ts
export async function getRawTxFromWhatsOnChain(txid: string, chain: sdk.Chain): Promise<sdk.GetRawTxResult> 
```

See also: [Chain](#type-chain), [GetRawTxResult](#interface-getrawtxresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getSyncChunk

Gets the next sync chunk of updated data from un-remoted storage (could be using a remote DB connection).

```ts
export async function getSyncChunk(storage: StorageReader, args: sdk.RequestSyncChunkArgs): Promise<sdk.SyncChunk> 
```

See also: [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [StorageReader](#class-storagereader), [SyncChunk](#interface-syncchunk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getTaalArcServiceConfig

```ts
export function getTaalArcServiceConfig(chain: sdk.Chain, apiKey: string): ArcServiceConfig 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [Chain](#type-chain)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: getUtxoStatusFromWhatsOnChain

```ts
export async function getUtxoStatusFromWhatsOnChain(output: string, chain: sdk.Chain, outputFormat?: sdk.GetUtxoStatusOutputFormat): Promise<sdk.GetUtxoStatusResult> 
```

See also: [Chain](#type-chain), [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: internalizeAction

Internalize Action allows a wallet to take ownership of outputs in a pre-existing transaction.
The transaction may, or may not already be known to both the storage and user.

Two types of outputs are handled: "wallet payments" and "basket insertions".

A "basket insertion" output is considered a custom output and has no effect on the wallet's "balance".

A "wallet payment" adds an outputs value to the wallet's change "balance". These outputs are assigned to the "default" basket.

Processing starts with simple validation and then checks for a pre-existing transaction.
If the transaction is already known to the user, then the outputs are reviewed against the existing outputs treatment,
and merge rules are added to the arguments passed to the storage layer.
The existing transaction must be in the 'unproven' or 'completed' status. Any other status is an error.

When the transaction already exists, the description is updated. The isOutgoing sense is not changed.

"basket insertion" Merge Rules:
1. The "default" basket may not be specified as the insertion basket.
2. A change output in the "default" basket may not be target of an insertion into a different basket.
3. These baskets do not affect the wallet's balance and are typed "custom".

"wallet payment" Merge Rules:
1. Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
2. Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's `amount`, and the wallet balance.

```ts
export async function internalizeAction(signer: WalletSigner, auth: sdk.AuthId, args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> 
```

See also: [AuthId](#interface-authid), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: internalizeAction

Internalize Action allows a wallet to take ownership of outputs in a pre-existing transaction.
The transaction may, or may not already be known to both the storage and user.

Two types of outputs are handled: "wallet payments" and "basket insertions".

A "basket insertion" output is considered a custom output and has no effect on the wallet's "balance".

A "wallet payment" adds an outputs value to the wallet's change "balance". These outputs are assigned to the "default" basket.

Processing starts with simple validation and then checks for a pre-existing transaction.
If the transaction is already known to the user, then the outputs are reviewed against the existing outputs treatment,
and merge rules are added to the arguments passed to the storage layer.
The existing transaction must be in the 'unproven' or 'completed' status. Any other status is an error.

When the transaction already exists, the description is updated. The isOutgoing sense is not changed.

"basket insertion" Merge Rules:
1. The "default" basket may not be specified as the insertion basket.
2. A change output in the "default" basket may not be target of an insertion into a different basket.
3. These baskets do not affect the wallet's balance and are typed "custom".

"wallet payment" Merge Rules:
1. Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
2. Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's `satoshis`, and the wallet balance.

```ts
export async function internalizeAction(storage: StorageProvider, auth: sdk.AuthId, args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult> 
```

See also: [AuthId](#interface-authid), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [StorageProvider](#class-storageprovider)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: isHexString

```ts
export function isHexString(s: string): boolean 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: listCertificates

```ts
export async function listCertificates(storage: StorageProvider, auth: sdk.AuthId, vargs: sdk.ValidListCertificatesArgs, originator?: bsv.OriginatorDomainNameStringUnder250Bytes): Promise<bsv.ListCertificatesResult> 
```

See also: [AuthId](#interface-authid), [ListCertificatesResult](#interface-listcertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [StorageProvider](#class-storageprovider), [ValidListCertificatesArgs](#interface-validlistcertificatesargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: lockScriptWithKeyOffsetFromPubKey

```ts
export function lockScriptWithKeyOffsetFromPubKey(pubKey: string, keyOffset?: string): {
    script: string;
    keyOffset: string;
} 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeAtomicBeef

```ts
export function makeAtomicBeef(tx: Transaction, beef: number[] | Beef): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeAtomicBeef

```ts
export function makeAtomicBeef(tx: bsv.Transaction, beef: number[] | bsv.Beef): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeErrorResult

```ts
export function makeErrorResult(error: sdk.WalletError, miner: ArcServiceConfig, beef: number[], txids: string[], dd?: ArcMinerPostBeefDataApi): sdk.PostBeefResult 
```

See also: [ArcMinerPostBeefDataApi](#interface-arcminerpostbeefdataapi), [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefResult](#interface-postbeefresult), [WalletError](#class-walleterror)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makeGetMerklePathFromTaalARC

```ts
export function makeGetMerklePathFromTaalARC(config: ArcServiceConfig): sdk.GetMerklePathService 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [GetMerklePathService](#type-getmerklepathservice)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makePostBeefResult

```ts
export function makePostBeefResult(dd: ArcMinerPostBeefDataApi, miner: ArcServiceConfig, beef: number[], txids: string[]): sdk.PostBeefResult 
```

See also: [ArcMinerPostBeefDataApi](#interface-arcminerpostbeefdataapi), [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefResult](#interface-postbeefresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makePostBeefToTaalARC

```ts
export function makePostBeefToTaalARC(config: ArcServiceConfig): sdk.PostBeefService 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefService](#type-postbeefservice)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: makePostTxsToTaalARC

```ts
export function makePostTxsToTaalARC(config: ArcServiceConfig): sdk.PostTxsService 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostTxsService](#type-posttxsservice)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: maxDate

```ts
export function maxDate(d1?: Date, d2?: Date): Date | undefined 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: offsetPubKey

```ts
export function offsetPubKey(pubKey: string, keyOffset?: string): {
    offsetPubKey: string;
    keyOffset: string;
} 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: optionalArraysEqual

```ts
export function optionalArraysEqual(arr1?: Number[], arr2?: Number[]) 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: parseTxScriptOffsets

```ts
export function parseTxScriptOffsets(rawTx: number[]): TxScriptOffsets 
```

See also: [TxScriptOffsets](#interface-txscriptoffsets)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: parseWalletOutpoint

```ts
export function parseWalletOutpoint(outpoint: string): {
    txid: string;
    vout: number;
} 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: postBeefToArcMiner

```ts
export async function postBeefToArcMiner(beef: bsv.Beef, txids: string[], config: ArcServiceConfig): Promise<sdk.PostBeefResult> 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefResult](#interface-postbeefresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: postBeefToTaalArcMiner

```ts
export async function postBeefToTaalArcMiner(beef: bsv.Beef, txids: string[], config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.PostBeefResult> 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefResult](#interface-postbeefresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: postTxsToTaalArcMiner

```ts
export async function postTxsToTaalArcMiner(beef: bsv.Beef, txids: string[], config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.PostTxsResult> 
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostTxsResult](#interface-posttxsresult), [WalletServices](#interface-walletservices)

<details>

<summary>Function postTxsToTaalArcMiner Details</summary>

Argument Details

+ **txs**
  + All transactions must have source transactions. Will just source locking scripts and satoshis do?? toHexEF() is used.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processAction

```ts
export async function processAction(prior: PendingSignAction | undefined, signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidProcessActionArgs): Promise<sdk.SendWithResult[] | undefined> 
```

See also: [AuthId](#interface-authid), [PendingSignAction](#interface-pendingsignaction), [SendWithResult](#interface-sendwithresult), [ValidProcessActionArgs](#interface-validprocessactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: processAction

```ts
export async function processAction(storage: StorageProvider, auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults> 
```

See also: [AuthId](#interface-authid), [StorageProcessActionArgs](#interface-storageprocessactionargs), [StorageProcessActionResults](#interface-storageprocessactionresults), [StorageProvider](#class-storageprovider)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: proveCertificate

```ts
export async function proveCertificate(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidProveCertificateArgs): Promise<sdk.ProveCertificateResult> 
```

See also: [AuthId](#interface-authid), [ProveCertificateResult](#interface-provecertificateresult), [ValidProveCertificateArgs](#interface-validprovecertificateargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: randomBytes

```ts
export function randomBytes(count: number): number[] 
```

<details>

<summary>Function randomBytes Details</summary>

Returns

count cryptographically secure random bytes as Buffer

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: randomBytesBase64

```ts
export function randomBytesBase64(count: number): string 
```

<details>

<summary>Function randomBytesBase64 Details</summary>

Returns

count cryptographically secure random bytes as base64 encoded string

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: randomBytesHex

```ts
export function randomBytesHex(count: number): string 
```

<details>

<summary>Function randomBytesHex Details</summary>

Returns

count cryptographically secure random bytes as hex encoded string

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: sha256Hash

Calculate the SHA256 hash of an array of bytes

```ts
export function sha256Hash(data: number[]): number[] {
    const first = new Hash.SHA256().update(data).digest();
    return first;
}
```

<details>

<summary>Function sha256Hash Details</summary>

Returns

sha256 hash of buffer contents.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: signAction

```ts
export async function signAction(signer: WalletSigner, auth: sdk.AuthId, vargs: sdk.ValidSignActionArgs): Promise<sdk.SignActionResult> 
```

See also: [AuthId](#interface-authid), [SignActionResult](#interface-signactionresult), [ValidSignActionArgs](#interface-validsignactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: stampLog

If a log is being kept, add a time stamped line.

```ts
export function stampLog(log: string | undefined | {
    log?: string;
}, lineToAdd: string): string | undefined 
```

<details>

<summary>Function stampLog Details</summary>

Returns

undefined or log extended by time stamped `lineToAdd` and new line.

Argument Details

+ **log**
  + Optional time stamped log to extend, or an object with a log property to update
+ **lineToAdd**
  + Content to add to line.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: stampLogFormat

Replaces individual timestamps with delta msecs.
Looks for two network crossings and adjusts clock for clock skew if found.
Assumes log built by repeated calls to `stampLog`

```ts
export function stampLogFormat(log?: string): string 
```

<details>

<summary>Function stampLogFormat Details</summary>

Returns

reformated multi-line event log

Argument Details

+ **log**
  + Each logged event starts with ISO time stamp, space, rest of line, terminated by `\n`.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: toBinaryBaseBlockHeaderHex

Serializes a block header as an 80 byte Buffer.
The exact serialized format is defined in the Bitcoin White Paper
such that computing a double sha256 hash of the buffer computes
the block hash for the header.

```ts
export function toBinaryBaseBlockHeaderHex(header: sdk.BaseBlockHeaderHex): number[] {
    const writer = new bsv.Utils.Writer();
    writer.writeUInt32BE(header.version);
    writer.writeReverse(asArray(header.previousHash));
    writer.writeReverse(asArray(header.merkleRoot));
    writer.writeUInt32BE(header.time);
    writer.writeUInt32BE(header.bits);
    writer.writeUInt32BE(header.nonce);
    const r = writer.toArray();
    return r;
}
```

See also: [BaseBlockHeaderHex](#interface-baseblockheaderhex), [asArray](#function-asarray)

<details>

<summary>Function toBinaryBaseBlockHeaderHex Details</summary>

Returns

80 byte Buffer

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: toWalletNetwork

```ts
export function toWalletNetwork(chain: Chain): sdk.WalletNetwork 
```

See also: [Chain](#type-chain), [WalletNetwork](#type-walletnetwork)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: transactionInputSize

```ts
export function transactionInputSize(scriptSize: number): number 
```

<details>

<summary>Function transactionInputSize Details</summary>

Returns

serialized byte length a transaction input

Argument Details

+ **scriptSize**
  + byte length of input script

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: transactionOutputSize

```ts
export function transactionOutputSize(scriptSize: number): number 
```

<details>

<summary>Function transactionOutputSize Details</summary>

Returns

serialized byte length a transaction output

Argument Details

+ **scriptSize**
  + byte length of output script

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: transactionSize

Compute the serialized binary transaction size in bytes
given the number of inputs and outputs,
and the size of each script.

```ts
export function transactionSize(inputs: number[], outputs: number[]): number 
```

<details>

<summary>Function transactionSize Details</summary>

Returns

total transaction size in bytes

Argument Details

+ **inputs**
  + array of input script lengths, in bytes
+ **outputs**
  + array of output script lengths, in bytes

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: updateBsvExchangeRate

```ts
export async function updateBsvExchangeRate(rate?: sdk.BsvExchangeRate, updateMsecs?: number): Promise<sdk.BsvExchangeRate> 
```

See also: [BsvExchangeRate](#interface-bsvexchangerate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: updateChaintracksFiatExchangeRates

```ts
export async function updateChaintracksFiatExchangeRates(targetCurrencies: string[], options: sdk.WalletServicesOptions): Promise<sdk.FiatExchangeRates> 
```

See also: [FiatExchangeRates](#interface-fiatexchangerates), [WalletServicesOptions](#interface-walletservicesoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: updateExchangeratesapi

```ts
export async function updateExchangeratesapi(targetCurrencies: string[], options: sdk.WalletServicesOptions): Promise<sdk.FiatExchangeRates> 
```

See also: [FiatExchangeRates](#interface-fiatexchangerates), [WalletServicesOptions](#interface-walletservicesoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateAbortActionArgs

```ts
export function validateAbortActionArgs(args: sdk.AbortActionArgs): ValidAbortActionArgs 
```

See also: [AbortActionArgs](#interface-abortactionargs), [ValidAbortActionArgs](#interface-validabortactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateAcquireCertificateArgs

```ts
export async function validateAcquireCertificateArgs(args: sdk.AcquireCertificateArgs): Promise<ValidAcquireCertificateArgs> 
```

See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [ValidAcquireCertificateArgs](#interface-validacquirecertificateargs)

<details>

<summary>Function validateAcquireCertificateArgs Details</summary>

Argument Details

+ **subject**
  + Must be valid for "direct" `acquisitionProtocol`. public key of the certificate subject.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateAcquireDirectCertificateArgs

```ts
export function validateAcquireDirectCertificateArgs(args: sdk.AcquireCertificateArgs): ValidAcquireDirectCertificateArgs 
```

See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateBasketInsertion

```ts
export function validateBasketInsertion(args?: sdk.BasketInsertion): ValidBasketInsertion | undefined 
```

See also: [BasketInsertion](#interface-basketinsertion), [ValidBasketInsertion](#interface-validbasketinsertion)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateCreateActionArgs

```ts
export function validateCreateActionArgs(args: sdk.CreateActionArgs): ValidCreateActionArgs 
```

See also: [CreateActionArgs](#interface-createactionargs), [ValidCreateActionArgs](#interface-validcreateactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateCreateActionInput

```ts
export function validateCreateActionInput(i: sdk.CreateActionInput): ValidCreateActionInput 
```

See also: [CreateActionInput](#interface-createactioninput), [ValidCreateActionInput](#interface-validcreateactioninput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateCreateActionOptions

Set all default true/false booleans to true or false if undefined.
Set all possibly undefined numbers to their default values.
Set all possibly undefined arrays to empty arrays.
Convert string outpoints to `{ txid: string, vout: number }`

```ts
export function validateCreateActionOptions(options?: sdk.CreateActionOptions): ValidCreateActionOptions 
```

See also: [CreateActionOptions](#interface-createactionoptions), [ValidCreateActionOptions](#interface-validcreateactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateCreateActionOutput

```ts
export function validateCreateActionOutput(o: sdk.CreateActionOutput): ValidCreateActionOutput 
```

See also: [CreateActionOutput](#interface-createactionoutput), [ValidCreateActionOutput](#interface-validcreateactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateDiscoverByAttributesArgs

```ts
export function validateDiscoverByAttributesArgs(args: sdk.DiscoverByAttributesArgs): ValidDiscoverByAttributesArgs 
```

See also: [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [ValidDiscoverByAttributesArgs](#interface-validdiscoverbyattributesargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateDiscoverByIdentityKeyArgs

```ts
export function validateDiscoverByIdentityKeyArgs(args: sdk.DiscoverByIdentityKeyArgs): ValidDiscoverByIdentityKeyArgs 
```

See also: [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [ValidDiscoverByIdentityKeyArgs](#interface-validdiscoverbyidentitykeyargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateGenerateChangeSdkParams

```ts
export function validateGenerateChangeSdkParams(params: GenerateChangeSdkParams) 
```

See also: [GenerateChangeSdkParams](#interface-generatechangesdkparams)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateGenerateChangeSdkResult

```ts
export function validateGenerateChangeSdkResult(params: GenerateChangeSdkParams, r: GenerateChangeSdkResult): {
    ok: boolean;
    log: string;
} 
```

See also: [GenerateChangeSdkParams](#interface-generatechangesdkparams), [GenerateChangeSdkResult](#interface-generatechangesdkresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateInteger

```ts
export function validateInteger(v: number | undefined, name: string, defaultValue?: number, min?: number, max?: number): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateInternalizeActionArgs

```ts
export function validateInternalizeActionArgs(args: sdk.InternalizeActionArgs): ValidInternalizeActionArgs 
```

See also: [InternalizeActionArgs](#interface-internalizeactionargs), [ValidInternalizeActionArgs](#interface-validinternalizeactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateInternalizeOutput

```ts
export function validateInternalizeOutput(args: sdk.InternalizeOutput): ValidInternalizeOutput 
```

See also: [InternalizeOutput](#interface-internalizeoutput), [ValidInternalizeOutput](#interface-validinternalizeoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateListActionsArgs

```ts
export function validateListActionsArgs(args: bsv.ListActionsArgs): ValidListActionsArgs 
```

See also: [ListActionsArgs](#interface-listactionsargs), [ValidListActionsArgs](#interface-validlistactionsargs)

<details>

<summary>Function validateListActionsArgs Details</summary>

Argument Details

+ **args.labels**
  + An array of labels used to filter actions.
+ **args.labelQueryMode**
  + Optional. Specifies how to match labels (default is any which matches any of the labels).
+ **args.includeLabels**
  + Optional. Whether to include transaction labels in the result set.
+ **args.includeInputs**
  + Optional. Whether to include input details in the result set.
+ **args.includeInputSourceLockingScripts**
  + Optional. Whether to include input source locking scripts in the result set.
+ **args.includeInputUnlockingScripts**
  + Optional. Whether to include input unlocking scripts in the result set.
+ **args.includeOutputs**
  + Optional. Whether to include output details in the result set.
+ **args.includeOutputLockingScripts**
  + Optional. Whether to include output locking scripts in the result set.
+ **args.limit**
  + Optional. The maximum number of transactions to retrieve.
+ **args.offset**
  + Optional. Number of transactions to skip before starting to return the results.
+ **args.seekPermission**
  + — Optional. Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateListCertificatesArgs

```ts
export function validateListCertificatesArgs(args: bsv.ListCertificatesArgs): ValidListCertificatesArgs 
```

See also: [ListCertificatesArgs](#interface-listcertificatesargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateListOutputsArgs

```ts
export function validateListOutputsArgs(args: bsv.ListOutputsArgs): ValidListOutputsArgs 
```

See also: [ListOutputsArgs](#interface-listoutputsargs), [ValidListOutputsArgs](#interface-validlistoutputsargs)

<details>

<summary>Function validateListOutputsArgs Details</summary>

Argument Details

+ **args.basket**
  + Required. The associated basket name whose outputs should be listed.
+ **args.tags**
  + Optional. Filter outputs based on these tags.
+ **args.tagQueryMode**
  + Optional. Filter mode, defining whether all or any of the tags must match. By default, any tag can match.
+ **args.include**
  + Optional. Whether to include locking scripts (with each output) or entire transactions (as aggregated BEEF, at the top level) in the result. By default, unless specified, neither are returned.
+ **args.includeEntireTransactions**
  + Optional. Whether to include the entire transaction(s) in the result.
+ **args.includeCustomInstructions**
  + Optional. Whether custom instructions should be returned in the result.
+ **args.includeTags**
  + Optional. Whether the tags associated with the output should be returned.
+ **args.includeLabels**
  + Optional. Whether the labels associated with the transaction containing the output should be returned.
+ **args.limit**
  + Optional limit on the number of outputs to return.
+ **args.offset**
  + Optional. Number of outputs to skip before starting to return results.
+ **args.seekPermission**
  + — Optional. Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateOptionalInteger

```ts
export function validateOptionalInteger(v: number | undefined, name: string, min?: number, max?: number): number | undefined 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateOptionalOutpointString

```ts
export function validateOptionalOutpointString(outpoint: string | undefined, name: string): string | undefined 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateOriginator

```ts
export function validateOriginator(s?: string): string | undefined 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateOutpointString

```ts
export function validateOutpointString(outpoint: string, name: string): string 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validatePositiveIntegerOrZero

```ts
export function validatePositiveIntegerOrZero(v: number, name: string): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateProveCertificateArgs

```ts
export function validateProveCertificateArgs(args: sdk.ProveCertificateArgs): ValidProveCertificateArgs 
```

See also: [ProveCertificateArgs](#interface-provecertificateargs), [ValidProveCertificateArgs](#interface-validprovecertificateargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateRelinquishCertificateArgs

```ts
export function validateRelinquishCertificateArgs(args: bsv.RelinquishCertificateArgs): ValidRelinquishCertificateArgs 
```

See also: [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateRelinquishOutputArgs

```ts
export function validateRelinquishOutputArgs(args: bsv.RelinquishOutputArgs): ValidRelinquishOutputArgs 
```

See also: [RelinquishOutputArgs](#interface-relinquishoutputargs), [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateSatoshis

```ts
export function validateSatoshis(v: number | undefined, name: string, min?: number): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateScriptHash

```ts
export function validateScriptHash(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormat): string 
```

See also: [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateSecondsSinceEpoch

```ts
export function validateSecondsSinceEpoch(time: number): Date 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateSignActionArgs

```ts
export function validateSignActionArgs(args: sdk.SignActionArgs): ValidSignActionArgs 
```

See also: [SignActionArgs](#interface-signactionargs), [ValidSignActionArgs](#interface-validsignactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateSignActionOptions

Set all default true/false booleans to true or false if undefined.
Set all possibly undefined numbers to their default values.
Set all possibly undefined arrays to empty arrays.
Convert string outpoints to `{ txid: string, vout: number }`

```ts
export function validateSignActionOptions(options?: sdk.SignActionOptions): ValidSignActionOptions 
```

See also: [SignActionOptions](#interface-signactionoptions), [ValidSignActionOptions](#interface-validsignactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateStorageFeeModel

```ts
export function validateStorageFeeModel(v?: sdk.StorageFeeModel): sdk.StorageFeeModel 
```

See also: [StorageFeeModel](#interface-storagefeemodel)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateStringLength

```ts
export function validateStringLength(s: string, name: string, min?: number, max?: number): string 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: validateWalletPayment

```ts
export function validateWalletPayment(args?: sdk.WalletPayment): ValidWalletPayment | undefined 
```

See also: [ValidWalletPayment](#interface-validwalletpayment), [WalletPayment](#interface-walletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: varUintSize

Returns the byte size required to encode number as Bitcoin VarUint

```ts
export function varUintSize(val: number): 1 | 3 | 5 | 9 {
    if (val < 0)
        throw new sdk.WERR_INVALID_PARAMETER("varUint", "non-negative");
    return (val <= 252 ? 1 : val <= 65535 ? 3 : val <= 4294967295 ? 5 : 9);
}
```

See also: [WERR_INVALID_PARAMETER](#class-werr_invalid_parameter)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyHexString

Helper function.

Verifies that a hex string is trimmed and lower case.

```ts
export function verifyHexString(v: string): string 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyId

Helper function.

Verifies that a database record identifier is an integer greater than zero.

```ts
export function verifyId(id: number | undefined | null): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyInteger

Helper function.

Verifies that an optional or null number has a numeric value.

```ts
export function verifyInteger(v: number | null | undefined): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyNumber

Helper function.

Verifies that an optional or null number has a numeric value.

```ts
export function verifyNumber(v: number | null | undefined): number 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyOne

Helper function.

```ts
export function verifyOne<T>(results: T[], errorDescrition?: string): T 
```

<details>

<summary>Function verifyOne Details</summary>

Returns

results[0].

Throws

WERR_BAD_REQUEST if results has length other than one.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyOneOrNone

Helper function.

```ts
export function verifyOneOrNone<T>(results: T[]): (T | undefined) 
```

<details>

<summary>Function verifyOneOrNone Details</summary>

Returns

results[0] or undefined if length is zero.

Throws

WERR_BAD_REQUEST if results has length greater than one.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyOptionalHexString

Helper function.

Verifies that an optional or null hex string is undefined or a trimmed lowercase string.

```ts
export function verifyOptionalHexString(v?: string | null): string | undefined 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: verifyTruthy

Helper function.

Verifies that a possibly optional value has a value.

```ts
export function verifyTruthy<T>(v: T | null | undefined, description?: string): T 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Function: wait

Returns an await'able Promise that resolves in the given number of msecs.

```ts
export function wait(msecs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, msecs));
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Types

| | | |
| --- | --- | --- |
| [AcquisitionProtocol](#type-acquisitionprotocol) | [GetRawTxService](#type-getrawtxservice) | [PostTxsService](#type-posttxsservice) |
| [ActionStatus](#type-actionstatus) | [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat) | [ProtocolString5To400Bytes](#type-protocolstring5to400bytes) |
| [AtomicBEEF](#type-atomicbeef) | [GetUtxoStatusService](#type-getutxostatusservice) | [ProvenTxReqStatus](#type-proventxreqstatus) |
| [BEEF](#type-beef) | [HexString](#type-hexstring) | [PubKeyHex](#type-pubkeyhex) |
| [Base64String](#type-base64string) | [ISOTimestampString](#type-isotimestampstring) | [SatoshiValue](#type-satoshivalue) |
| [BasketStringUnder300Bytes](#type-basketstringunder300bytes) | [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes) | [SendWithResultStatus](#type-sendwithresultstatus) |
| [BooleanDefaultFalse](#type-booleandefaultfalse) | [KeyringRevealer](#type-keyringrevealer) | [StorageProvidedBy](#type-storageprovidedby) |
| [BooleanDefaultTrue](#type-booleandefaulttrue) | [LabelStringUnder300Bytes](#type-labelstringunder300bytes) | [SyncProtocolVersion](#type-syncprotocolversion) |
| [Byte](#type-byte) | [MonitorStorage](#type-monitorstorage) | [SyncStatus](#type-syncstatus) |
| [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes) | [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes) | [TXIDHexString](#type-txidhexstring) |
| [Chain](#type-chain) | [OutpointString](#type-outpointstring) | [TransactionStatus](#type-transactionstatus) |
| [Counterparty](#type-counterparty) | [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes) | [TrustSelf](#type-trustself) |
| [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes) | [PositiveInteger](#type-positiveinteger) | [UpdateFiatExchangeRateService](#type-updatefiatexchangerateservice) |
| [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes) | [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000) | [VersionString7To30Bytes](#type-versionstring7to30bytes) |
| [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes) | [PositiveIntegerMax10](#type-positiveintegermax10) | [WalletCounterparty](#type-walletcounterparty) |
| [ErrorCodeString10To40Bytes](#type-errorcodestring10to40bytes) | [PositiveIntegerOrZero](#type-positiveintegerorzero) | [WalletNetwork](#type-walletnetwork) |
| [ErrorDescriptionString20To200Bytes](#type-errordescriptionstring20to200bytes) | [PostBeefService](#type-postbeefservice) | [WalletProtocol](#type-walletprotocol) |
| [GetMerklePathService](#type-getmerklepathservice) | [PostReqsToNetworkDetailsStatus](#type-postreqstonetworkdetailsstatus) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: AcquisitionProtocol

```ts
export type AcquisitionProtocol = "direct" | "issuance"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ActionStatus

```ts
export type ActionStatus = "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: AtomicBEEF

```ts
export type AtomicBEEF = Byte[]
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: BEEF

```ts
export type BEEF = Byte[]
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: Base64String

```ts
export type Base64String = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: BasketStringUnder300Bytes

```ts
export type BasketStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: BooleanDefaultFalse

```ts
export type BooleanDefaultFalse = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: BooleanDefaultTrue

```ts
export type BooleanDefaultTrue = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: Byte

```ts
export type Byte = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: CertificateFieldNameUnder50Bytes

```ts
export type CertificateFieldNameUnder50Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: Chain

```ts
export type Chain = "main" | "test"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: Counterparty

```ts
export type Counterparty = PublicKey | PubKeyHex | "self" | "anyone"
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: DescriptionString5to50Bytes

```ts
export type DescriptionString5to50Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: EntityIconURLStringMax500Bytes

```ts
export type EntityIconURLStringMax500Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: EntityNameStringMax100Bytes

```ts
export type EntityNameStringMax100Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ErrorCodeString10To40Bytes

```ts
export type ErrorCodeString10To40Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ErrorDescriptionString20To200Bytes

```ts
export type ErrorDescriptionString20To200Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: GetMerklePathService

```ts
export type GetMerklePathService = (txid: string, chain: sdk.Chain, services: WalletServices) => Promise<GetMerklePathResult>
```

See also: [Chain](#type-chain), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: GetRawTxService

```ts
export type GetRawTxService = (txid: string, chain: sdk.Chain) => Promise<GetRawTxResult>
```

See also: [Chain](#type-chain), [GetRawTxResult](#interface-getrawtxresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: GetUtxoStatusOutputFormat

```ts
export type GetUtxoStatusOutputFormat = "hashLE" | "hashBE" | "script"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: GetUtxoStatusService

```ts
export type GetUtxoStatusService = (output: string, chain: sdk.Chain, outputFormat?: GetUtxoStatusOutputFormat) => Promise<GetUtxoStatusResult>
```

See also: [Chain](#type-chain), [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: HexString

```ts
export type HexString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ISOTimestampString

```ts
export type ISOTimestampString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: KeyIDStringUnder800Bytes

```ts
export type KeyIDStringUnder800Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: KeyringRevealer

```ts
export type KeyringRevealer = PubKeyHex | "certifier"
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: LabelStringUnder300Bytes

```ts
export type LabelStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: MonitorStorage

```ts
export type MonitorStorage = WalletStorageManager
```

See also: [WalletStorageManager](#class-walletstoragemanager)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: OriginatorDomainNameStringUnder250Bytes

```ts
export type OriginatorDomainNameStringUnder250Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: OutpointString

```ts
export type OutpointString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: OutputTagStringUnder300Bytes

```ts
export type OutputTagStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PositiveInteger

```ts
export type PositiveInteger = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PositiveIntegerDefault10Max10000

```ts
export type PositiveIntegerDefault10Max10000 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PositiveIntegerMax10

```ts
export type PositiveIntegerMax10 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PositiveIntegerOrZero

```ts
export type PositiveIntegerOrZero = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PostBeefService

```ts
export type PostBeefService = (beef: bsv.Beef, txids: string[], services: WalletServices) => Promise<PostBeefResult>
```

See also: [PostBeefResult](#interface-postbeefresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PostReqsToNetworkDetailsStatus

```ts
export type PostReqsToNetworkDetailsStatus = "success" | "doubleSpend" | "unknown"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PostTxsService

```ts
export type PostTxsService = (beef: bsv.Beef, txids: string[], services: WalletServices) => Promise<PostTxsResult>
```

See also: [PostTxsResult](#interface-posttxsresult), [WalletServices](#interface-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ProtocolString5To400Bytes

```ts
export type ProtocolString5To400Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: ProvenTxReqStatus

Initial status (attempts === 0):

nosend: transaction was marked 'noSend'. It is complete and signed. It may be sent by an external party. Proof should be sought as if 'unmined'. No error if it remains unknown by network.

unprocessed: indicates req is about to be posted to network by non-acceptDelayedBroadcast application code, after posting status is normally advanced to 'sending'

unsent: rawTx has not yet been sent to the network for processing. req is queued for delayed processing.

sending: At least one attempt to send rawTx to transaction processors has occured without confirmation of acceptance.

unknown: rawTx status is unknown but is believed to have been previously sent to the network.

Attempts > 0 status, processing:

unknown: Last status update received did not recognize txid or wasn't understood.

nonfinal: rawTx has an un-expired nLockTime and is eligible for continuous updating by new transactions with additional outputs and incrementing sequence numbers.

unmined: Last attempt has txid waiting to be mined, possibly just sent without callback

callback: Waiting for proof confirmation callback from transaction processor.

unconfirmed: Potential proof has not been confirmed by chaintracks

Terminal status:

doubleSpend: Transaction spends same input as another transaction.

invalid: rawTx is structuraly invalid or was rejected by the network. Will never be re-attempted or completed.

completed: proven_txs record added, and notifications are complete.

```ts
export type ProvenTxReqStatus = "sending" | "unsent" | "nosend" | "unknown" | "nonfinal" | "unprocessed" | "unmined" | "callback" | "unconfirmed" | "completed" | "invalid" | "doubleSpend"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: PubKeyHex

```ts
export type PubKeyHex = HexString
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: SatoshiValue

```ts
export type SatoshiValue = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: SendWithResultStatus

```ts
export type SendWithResultStatus = "unproven" | "sending" | "failed"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: StorageProvidedBy

```ts
export type StorageProvidedBy = "you" | "storage" | "you-and-storage"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: SyncProtocolVersion

```ts
export type SyncProtocolVersion = "0.1.0"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: SyncStatus

success: Last sync of this user from this dojo was successful.

error: Last sync protocol operation for this user to this dojo threw and error.

identified: Configured sync dojo has been identified but not sync'ed.

unknown: Sync protocol state is unknown.

```ts
export type SyncStatus = "success" | "error" | "identified" | "updated" | "unknown"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: TXIDHexString

```ts
export type TXIDHexString = HexString
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: TransactionStatus

```ts
export type TransactionStatus = "completed" | "failed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: TrustSelf

Controls behavior of input BEEF validation.

If `known`, input transactions may omit supporting validity proof data for all TXIDs known to this wallet.

If undefined, input BEEFs must be complete and valid.

```ts
export type TrustSelf = "known"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: UpdateFiatExchangeRateService

```ts
export type UpdateFiatExchangeRateService = (targetCurrencies: string[], options: WalletServicesOptions) => Promise<FiatExchangeRates>
```

See also: [FiatExchangeRates](#interface-fiatexchangerates), [WalletServicesOptions](#interface-walletservicesoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: VersionString7To30Bytes

```ts
export type VersionString7To30Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: WalletCounterparty

```ts
export type WalletCounterparty = PubKeyHex | "self" | "anyone"
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: WalletNetwork

```ts
export type WalletNetwork = "mainnet" | "testnet"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Type: WalletProtocol

```ts
export type WalletProtocol = [
    0 | 1 | 2,
    ProtocolString5To400Bytes
]
```

See also: [ProtocolString5To400Bytes](#type-protocolstring5to400bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variables

| |
| --- |
| [ProvenTxReqNonTerminalStatus](#variable-proventxreqnonterminalstatus) |
| [ProvenTxReqTerminalStatus](#variable-proventxreqterminalstatus) |
| [brc29ProtocolID](#variable-brc29protocolid) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Variable: ProvenTxReqNonTerminalStatus

```ts
ProvenTxReqNonTerminalStatus: ProvenTxReqStatus[] = [
    "sending",
    "unsent",
    "nosend",
    "unknown",
    "nonfinal",
    "unprocessed",
    "unmined",
    "callback",
    "unconfirmed"
]
```

See also: [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Variable: ProvenTxReqTerminalStatus

```ts
ProvenTxReqTerminalStatus: ProvenTxReqStatus[] = [
    "completed",
    "invalid",
    "doubleSpend"
]
```

See also: [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
#### Variable: brc29ProtocolID

```ts
brc29ProtocolID: sdk.WalletProtocol = [2, "3241645161d8"]
```

See also: [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

<!--#endregion ts2md-api-merged-here-->

## License

The license for the code in this repository is the Open BSV License.
