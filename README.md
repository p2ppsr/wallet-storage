# wallet

BRC100 conforming wallet, wallet storage and wallet signer components

## API

<!--#region ts2md-api-merged-here-->

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

### Interfaces

|                                                                     |                                                                                     |                                                                                   |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [AbortActionArgs](#interface-abortactionargs)                       | [GetUtxoStatusResult](#interface-getutxostatusresult)                               | [StorageProcessActionSdkResults](#interface-storageprocessactionsdkresults)       |
| [AbortActionResult](#interface-abortactionresult)                   | [GetVersionResult](#interface-getversionresult)                                     | [StorageProvenOrReq](#interface-storageprovenorreq)                               |
| [AcquireCertificateArgs](#interface-acquirecertificateargs)         | [IdentityCertificate](#interface-identitycertificate)                               | [StorageSyncReader](#interface-storagesyncreader)                                 |
| [AcquireCertificateResult](#interface-acquirecertificateresult)     | [IdentityCertifier](#interface-identitycertifier)                                   | [StorageSyncReaderOptions](#interface-storagesyncreaderoptions)                   |
| [ArcMinerGetTxData](#interface-arcminergettxdata)                   | [InternalizeActionArgs](#interface-internalizeactionargs)                           | [TaskPurgeParams](#interface-taskpurgeparams)                                     |
| [ArcMinerPostBeefDataApi](#interface-arcminerpostbeefdataapi)       | [InternalizeActionResult](#interface-internalizeactionresult)                       | [TrxToken](#interface-trxtoken)                                                   |
| [ArcMinerPostTxsData](#interface-arcminerposttxsdata)               | [InternalizeOutput](#interface-internalizeoutput)                                   | [TscMerkleProofApi](#interface-tscmerkleproofapi)                                 |
| [ArcServiceConfig](#interface-arcserviceconfig)                     | [KeyDeriverApi](#interface-keyderiverapi)                                           | [ValidAbortActionArgs](#interface-validabortactionargs)                           |
| [AuthenticatedResult](#interface-authenticatedresult)               | [KeyLinkageResult](#interface-keylinkageresult)                                     | [ValidAcquireCertificateArgs](#interface-validacquirecertificateargs)             |
| [BaseBlockHeaderHex](#interface-baseblockheaderhex)                 | [KeyPair](#interface-keypair)                                                       | [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs) |
| [BasketInsertion](#interface-basketinsertion)                       | [ListActionsArgs](#interface-listactionsargs)                                       | [ValidBasketInsertion](#interface-validbasketinsertion)                           |
| [BlockHeaderHex](#interface-blockheaderhex)                         | [ListActionsResult](#interface-listactionsresult)                                   | [ValidCreateActionArgs](#interface-validcreateactionargs)                         |
| [BsvExchangeRate](#interface-bsvexchangerate)                       | [ListCertificatesArgs](#interface-listcertificatesargs)                             | [ValidCreateActionInput](#interface-validcreateactioninput)                       |
| [CertificateResult](#interface-certificateresult)                   | [ListCertificatesResult](#interface-listcertificatesresult)                         | [ValidCreateActionOptions](#interface-validcreateactionoptions)                   |
| [CreateActionArgs](#interface-createactionargs)                     | [ListOutputsArgs](#interface-listoutputsargs)                                       | [ValidCreateActionOutput](#interface-validcreateactionoutput)                     |
| [CreateActionInput](#interface-createactioninput)                   | [ListOutputsResult](#interface-listoutputsresult)                                   | [ValidDiscoverByAttributesArgs](#interface-validdiscoverbyattributesargs)         |
| [CreateActionOptions](#interface-createactionoptions)               | [OutPoint](#interface-outpoint)                                                     | [ValidDiscoverByIdentityKeyArgs](#interface-validdiscoverbyidentitykeyargs)       |
| [CreateActionOutput](#interface-createactionoutput)                 | [Paged](#interface-paged)                                                           | [ValidInternalizeActionArgs](#interface-validinternalizeactionargs)               |
| [CreateActionResult](#interface-createactionresult)                 | [PendingSignAction](#interface-pendingsignaction)                                   | [ValidInternalizeOutput](#interface-validinternalizeoutput)                       |
| [CreateHmacArgs](#interface-createhmacargs)                         | [PendingStorageInput](#interface-pendingstorageinput)                               | [ValidListActionsArgs](#interface-validlistactionsargs)                           |
| [CreateHmacResult](#interface-createhmacresult)                     | [PostBeefResult](#interface-postbeefresult)                                         | [ValidListCertificatesArgs](#interface-validlistcertificatesargs)                 |
| [CreateSignatureArgs](#interface-createsignatureargs)               | [PostReqsToNetworkDetails](#interface-postreqstonetworkdetails)                     | [ValidListOutputsArgs](#interface-validlistoutputsargs)                           |
| [CreateSignatureResult](#interface-createsignatureresult)           | [PostReqsToNetworkResult](#interface-postreqstonetworkresult)                       | [ValidProcessActionArgs](#interface-validprocessactionargs)                       |
| [DiscoverByAttributesArgs](#interface-discoverbyattributesargs)     | [PostTxResultForTxid](#interface-posttxresultfortxid)                               | [ValidProcessActionOptions](#interface-validprocessactionoptions)                 |
| [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs)   | [PostTxsResult](#interface-posttxsresult)                                           | [ValidProveCertificateArgs](#interface-validprovecertificateargs)                 |
| [DiscoverCertificatesResult](#interface-discovercertificatesresult) | [ProveCertificateArgs](#interface-provecertificateargs)                             | [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs)       |
| [EntityTimeStamp](#interface-entitytimestamp)                       | [ProveCertificateResult](#interface-provecertificateresult)                         | [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs)                 |
| [ExchangeRatesIoApi](#interface-exchangeratesioapi)                 | [ProvenOrRawTx](#interface-provenorrawtx)                                           | [ValidSignActionArgs](#interface-validsignactionargs)                             |
| [FiatExchangeRates](#interface-fiatexchangerates)                   | [PurgeParams](#interface-purgeparams)                                               | [ValidSignActionOptions](#interface-validsignactionoptions)                       |
| [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs)   | [PurgeResults](#interface-purgeresults)                                             | [ValidWalletPayment](#interface-validwalletpayment)                               |
| [FindCertificatesArgs](#interface-findcertificatesargs)             | [RelinquishCertificateArgs](#interface-relinquishcertificateargs)                   | [VerifyHmacArgs](#interface-verifyhmacargs)                                       |
| [FindCommissionsArgs](#interface-findcommissionsargs)               | [RelinquishCertificateResult](#interface-relinquishcertificateresult)               | [VerifyHmacResult](#interface-verifyhmacresult)                                   |
| [FindOutputBasketsArgs](#interface-findoutputbasketsargs)           | [RelinquishOutputArgs](#interface-relinquishoutputargs)                             | [VerifySignatureArgs](#interface-verifysignatureargs)                             |
| [FindOutputTagMapsArgs](#interface-findoutputtagmapsargs)           | [RelinquishOutputResult](#interface-relinquishoutputresult)                         | [VerifySignatureResult](#interface-verifysignatureresult)                         |
| [FindOutputTagsArgs](#interface-findoutputtagsargs)                 | [RequestSyncChunkArgs](#interface-requestsyncchunkargs)                             | [Wallet](#interface-wallet)                                                       |
| [FindOutputsArgs](#interface-findoutputsargs)                       | [RequestSyncChunkResult](#interface-requestsyncchunkresult)                         | [WalletAction](#interface-walletaction)                                           |
| [FindPartialSincePagedArgs](#interface-findpartialsincepagedargs)   | [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs)     | [WalletActionInput](#interface-walletactioninput)                                 |
| [FindProvenTxReqsArgs](#interface-findproventxreqsargs)             | [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult) | [WalletActionOutput](#interface-walletactionoutput)                               |
| [FindProvenTxsArgs](#interface-findproventxsargs)                   | [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs)             | [WalletCertificate](#interface-walletcertificate)                                 |
| [FindSincePagedArgs](#interface-findsincepagedargs)                 | [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult)         | [WalletCryptoObject](#interface-walletcryptoobject)                               |
| [FindSyncStatesArgs](#interface-findsyncstatesargs)                 | [ScriptTemplateParamsSABPPP](#interface-scripttemplateparamssabppp)                 | [WalletDecryptArgs](#interface-walletdecryptargs)                                 |
| [FindTransactionsArgs](#interface-findtransactionsargs)             | [SendWithResult](#interface-sendwithresult)                                         | [WalletDecryptResult](#interface-walletdecryptresult)                             |
| [FindTxLabelMapsArgs](#interface-findtxlabelmapsargs)               | [SignActionArgs](#interface-signactionargs)                                         | [WalletEncryptArgs](#interface-walletencryptargs)                                 |
| [FindTxLabelsArgs](#interface-findtxlabelsargs)                     | [SignActionOptions](#interface-signactionoptions)                                   | [WalletEncryptResult](#interface-walletencryptresult)                             |
| [FindUsersArgs](#interface-findusersargs)                           | [SignActionResult](#interface-signactionresult)                                     | [WalletEncryptionArgs](#interface-walletencryptionargs)                           |
| [FindWatchmanEventsArgs](#interface-findwatchmaneventsargs)         | [SignActionSpend](#interface-signactionspend)                                       | [WalletErrorObject](#interface-walleterrorobject)                                 |
| [GetHeaderArgs](#interface-getheaderargs)                           | [SignableTransaction](#interface-signabletransaction)                               | [WalletMonitorOptions](#interface-walletmonitoroptions)                           |
| [GetHeaderResult](#interface-getheaderresult)                       | [StorageCreateTransactionSdkInput](#interface-storagecreatetransactionsdkinput)     | [WalletOutput](#interface-walletoutput)                                           |
| [GetHeightResult](#interface-getheightresult)                       | [StorageCreateTransactionSdkOutput](#interface-storagecreatetransactionsdkoutput)   | [WalletPayment](#interface-walletpayment)                                         |
| [GetMerklePathResult](#interface-getmerklepathresult)               | [StorageCreateTransactionSdkResult](#interface-storagecreatetransactionsdkresult)   | [WalletServices](#interface-walletservices)                                       |
| [GetNetworkResult](#interface-getnetworkresult)                     | [StorageFeeModel](#interface-storagefeemodel)                                       | [WalletServicesOptions](#interface-walletservicesoptions)                         |
| [GetPublicKeyArgs](#interface-getpublickeyargs)                     | [StorageGetBeefOptions](#interface-storagegetbeefoptions)                           | [WalletSigner](#interface-walletsigner)                                           |
| [GetPublicKeyResult](#interface-getpublickeyresult)                 | [StorageIdentity](#interface-storageidentity)                                       | [WalletStorage](#interface-walletstorage)                                         |
| [GetRawTxResult](#interface-getrawtxresult)                         | [StorageInternalizeActionArgs](#interface-storageinternalizeactionargs)             |                                                                                   |
| [GetUtxoStatusDetails](#interface-getutxostatusdetails)             | [StorageProcessActionSdkParams](#interface-storageprocessactionsdkparams)           |                                                                                   |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AbortActionArgs

```ts
export interface AbortActionArgs {
  reference: Base64String
}
```

See also: [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AbortActionResult

```ts
export interface AbortActionResult {
  aborted: boolean
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AcquireCertificateArgs

```ts
export interface AcquireCertificateArgs {
  type: Base64String
  certifier: PubKeyHex
  acquisitionProtocol: AcquisitionProtocol
  fields: Record<CertificateFieldNameUnder50Bytes, string>
  serialNumber?: Base64String
  revocationOutpoint?: OutpointString
  signature?: HexString
  certifierUrl?: string
  keyringRevealer?: KeyringRevealer
  keyringForSubject?: Record<CertificateFieldNameUnder50Bytes, Base64String>
  privileged?: BooleanDefaultFalse
  privilegedReason?: DescriptionString5to50Bytes
}
```

See also: [AcquisitionProtocol](#type-acquisitionprotocol), [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AcquireCertificateResult

```ts
export interface AcquireCertificateResult extends WalletCertificate {}
```

See also: [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ArcMinerGetTxData

```ts
export interface ArcMinerGetTxData {
  status: number
  title: string
  blockHash: string
  blockHeight: number
  competingTxs: null | string[]
  extraInfo: string
  merklePath: string
  timestamp: string
  txid: string
  txStatus: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ArcMinerPostBeefDataApi

```ts
export interface ArcMinerPostBeefDataApi {
  status: number
  title: string
  blockHash?: string
  blockHeight?: number
  competingTxs?: null
  extraInfo: string
  merklePath?: string
  timestamp?: string
  txid?: string
  txStatus?: string
  type?: string
  detail?: string
  instance?: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ArcMinerPostTxsData

```ts
export interface ArcMinerPostTxsData {
  status: number
  title: string
  blockHash: string
  blockHeight: number
  competingTxs: null | string[]
  extraInfo: string
  merklePath: string
  timestamp: string
  txid: string
  txStatus: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ArcServiceConfig

```ts
export interface ArcServiceConfig {
  name: string
  url: string
  arcConfig: bsv.ArcConfig
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: AuthenticatedResult

```ts
export interface AuthenticatedResult {
  authenticated: boolean
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: BaseBlockHeaderHex

Like BlockHeader but 32 byte fields are hex encoded strings.

```ts
export interface BaseBlockHeaderHex {
  version: number
  previousHash: string
  merkleRoot: string
  time: number
  bits: number
  nonce: number
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: BasketInsertion

```ts
export interface BasketInsertion {
  basket: BasketStringUnder300Bytes
  customInstructions?: string
  tags?: OutputTagStringUnder300Bytes[]
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: BlockHeaderHex

Like BlockHeader but 32 byte fields are hex encoded strings.

```ts
export interface BlockHeaderHex extends BaseBlockHeaderHex {
  height: number
  hash: string
}
```

See also: [BaseBlockHeaderHex](#interface-baseblockheaderhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: BsvExchangeRate

```ts
export interface BsvExchangeRate {
  timestamp: Date
  base: 'USD'
  rate: number
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CertificateResult

```ts
export interface CertificateResult extends WalletCertificate {
  keyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
  verifier?: string
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateActionArgs

```ts
export interface CreateActionArgs {
  description: DescriptionString5to50Bytes
  inputBEEF?: BEEF
  inputs?: CreateActionInput[]
  outputs?: CreateActionOutput[]
  lockTime?: PositiveIntegerOrZero
  version?: PositiveIntegerOrZero
  labels?: LabelStringUnder300Bytes[]
  options?: CreateActionOptions
}
```

See also: [BEEF](#type-beef), [CreateActionInput](#interface-createactioninput), [CreateActionOptions](#interface-createactionoptions), [CreateActionOutput](#interface-createactionoutput), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateActionInput

```ts
export interface CreateActionInput {
  outpoint: OutpointString
  inputDescription: DescriptionString5to50Bytes
  unlockingScript?: HexString
  unlockingScriptLength?: PositiveInteger
  sequenceNumber?: PositiveIntegerOrZero
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateActionOptions

```ts
export interface CreateActionOptions {
  signAndProcess?: BooleanDefaultTrue
  acceptDelayedBroadcast?: BooleanDefaultTrue
  trustSelf?: TrustSelf
  knownTxids?: TXIDHexString[]
  returnTXIDOnly?: BooleanDefaultFalse
  noSend?: BooleanDefaultFalse
  noSendChange?: OutpointString[]
  sendWith?: TXIDHexString[]
  randomizeOutputs?: BooleanDefaultTrue
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutpointString](#type-outpointstring), [TXIDHexString](#type-txidhexstring), [TrustSelf](#type-trustself)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateActionOutput

```ts
export interface CreateActionOutput {
  lockingScript: HexString
  satoshis: SatoshiValue
  outputDescription: DescriptionString5to50Bytes
  basket?: BasketStringUnder300Bytes
  customInstructions?: string
  tags?: OutputTagStringUnder300Bytes[]
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateActionResult

```ts
export interface CreateActionResult {
  txid?: TXIDHexString
  tx?: AtomicBEEF
  noSendChange?: OutpointString[]
  sendWithResults?: SendWithResult[]
  signableTransaction?: SignableTransaction
}
```

See also: [AtomicBEEF](#type-atomicbeef), [OutpointString](#type-outpointstring), [SendWithResult](#interface-sendwithresult), [SignableTransaction](#interface-signabletransaction), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateHmacArgs

```ts
export interface CreateHmacArgs extends WalletEncryptionArgs {
  data: Byte[]
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateHmacResult

```ts
export interface CreateHmacResult {
  hmac: Byte[]
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateSignatureArgs

```ts
export interface CreateSignatureArgs extends WalletEncryptionArgs {
  data?: Byte[]
  hashToDirectlySign?: Byte[]
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: CreateSignatureResult

```ts
export interface CreateSignatureResult {
  signature: Byte[]
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: DiscoverByAttributesArgs

```ts
export interface DiscoverByAttributesArgs {
  attributes: Record<CertificateFieldNameUnder50Bytes, string>
  limit?: PositiveIntegerDefault10Max10000
  offset?: PositiveIntegerOrZero
  seekPermission?: BooleanDefaultTrue
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: DiscoverByIdentityKeyArgs

```ts
export interface DiscoverByIdentityKeyArgs {
  identityKey: PubKeyHex
  limit?: PositiveIntegerDefault10Max10000
  offset?: PositiveIntegerOrZero
  seekPermission?: BooleanDefaultTrue
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: DiscoverCertificatesResult

```ts
export interface DiscoverCertificatesResult {
  totalCertificates: PositiveIntegerOrZero
  certificates: IdentityCertificate[]
}
```

See also: [IdentityCertificate](#interface-identitycertificate), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: EntityTimeStamp

```ts
export interface EntityTimeStamp {
  created_at: Date
  updated_at: Date
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ExchangeRatesIoApi

```ts
export interface ExchangeRatesIoApi {
  success: boolean
  timestamp: number
  base: 'EUR' | 'USD'
  date: string
  rates: Record<string, number>
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FiatExchangeRates

```ts
export interface FiatExchangeRates {
  timestamp: Date
  base: 'USD'
  rates: Record<string, number>
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindCertificateFieldsArgs

```ts
export interface FindCertificateFieldsArgs extends FindSincePagedArgs {
  partial: Partial<table.CertificateField>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindCertificatesArgs

```ts
export interface FindCertificatesArgs extends FindSincePagedArgs {
  partial: Partial<table.Certificate>
  certifiers?: string[]
  types?: string[]
}
```

See also: [Certificate](#class-certificate), [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindCommissionsArgs

```ts
export interface FindCommissionsArgs extends FindSincePagedArgs {
  partial: Partial<table.Commission>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindOutputBasketsArgs

```ts
export interface FindOutputBasketsArgs extends FindSincePagedArgs {
  partial: Partial<table.OutputBasket>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindOutputTagMapsArgs

```ts
export interface FindOutputTagMapsArgs extends FindSincePagedArgs {
  partial: Partial<table.OutputTagMap>
  tagIds?: number[]
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindOutputTagsArgs

```ts
export interface FindOutputTagsArgs extends FindSincePagedArgs {
  partial: Partial<table.OutputTag>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindOutputsArgs

```ts
export interface FindOutputsArgs extends FindSincePagedArgs {
  partial: Partial<table.Output>
  noScript?: boolean
  txStatus?: sdk.TransactionStatus[]
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [TransactionStatus](#type-transactionstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindPartialSincePagedArgs

```ts
export interface FindPartialSincePagedArgs<T extends object> {
  partial: Partial<T>
  since?: Date
  paged?: sdk.Paged
  trx?: sdk.TrxToken
}
```

See also: [Paged](#interface-paged), [TrxToken](#interface-trxtoken)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindProvenTxReqsArgs

```ts
export interface FindProvenTxReqsArgs extends FindSincePagedArgs {
  partial: Partial<table.ProvenTxReq>
  status?: sdk.ProvenTxReqStatus[]
  txids?: string[]
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [ProvenTxReqStatus](#type-proventxreqstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindProvenTxsArgs

```ts
export interface FindProvenTxsArgs extends FindSincePagedArgs {
  partial: Partial<table.ProvenTx>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindSincePagedArgs

```ts
export interface FindSincePagedArgs {
  since?: Date
  paged?: sdk.Paged
  trx?: sdk.TrxToken
}
```

See also: [Paged](#interface-paged), [TrxToken](#interface-trxtoken)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindSyncStatesArgs

```ts
export interface FindSyncStatesArgs extends FindSincePagedArgs {
  partial: Partial<table.SyncState>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindTransactionsArgs

```ts
export interface FindTransactionsArgs extends FindSincePagedArgs {
  partial: Partial<table.Transaction>
  status?: sdk.TransactionStatus[]
  noRawTx?: boolean
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs), [TransactionStatus](#type-transactionstatus)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindTxLabelMapsArgs

```ts
export interface FindTxLabelMapsArgs extends FindSincePagedArgs {
  partial: Partial<table.TxLabelMap>
  labelIds?: number[]
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindTxLabelsArgs

```ts
export interface FindTxLabelsArgs extends FindSincePagedArgs {
  partial: Partial<table.TxLabel>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindUsersArgs

```ts
export interface FindUsersArgs extends FindSincePagedArgs {
  partial: Partial<table.User>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: FindWatchmanEventsArgs

```ts
export interface FindWatchmanEventsArgs extends FindSincePagedArgs {
  partial: Partial<table.WatchmanEvent>
}
```

See also: [FindSincePagedArgs](#interface-findsincepagedargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetHeaderArgs

```ts
export interface GetHeaderArgs {
  height: PositiveInteger
}
```

See also: [PositiveInteger](#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetHeaderResult

```ts
export interface GetHeaderResult {
  header: HexString
}
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetHeightResult

```ts
export interface GetHeightResult {
  height: PositiveInteger
}
```

See also: [PositiveInteger](#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetMerklePathResult

Properties on result returned from `WalletServices` function `getMerkleProof`.

```ts
export interface GetMerklePathResult {
  name?: string
  merklePath?: bsv.MerklePath
  header?: BlockHeaderHex
  error?: sdk.WalletError
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
  network: WalletNetwork
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
  identityKey?: true
  forSelf?: BooleanDefaultFalse
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetPublicKeyResult

```ts
export interface GetPublicKeyResult {
  publicKey: PubKeyHex
}
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetRawTxResult

Properties on result returned from `WalletServices` function `getRawTx`.

```ts
export interface GetRawTxResult {
  txid: string
  name?: string
  rawTx?: number[]
  error?: sdk.WalletError
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

#### Interface: GetUtxoStatusDetails

```ts
export interface GetUtxoStatusDetails {
  height?: number
  txid?: string
  index?: number
  satoshis?: number
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
  name: string
  status: 'success' | 'error'
  error?: sdk.WalletError
  isUtxo?: boolean
  details: GetUtxoStatusDetails[]
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
status: 'success' | 'error'
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: GetVersionResult

```ts
export interface GetVersionResult {
  version: VersionString7To30Bytes
}
```

See also: [VersionString7To30Bytes](#type-versionstring7to30bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: IdentityCertificate

```ts
export interface IdentityCertificate extends WalletCertificate {
  certifierInfo: IdentityCertifier
  publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
  decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [IdentityCertifier](#interface-identitycertifier), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: IdentityCertifier

```ts
export interface IdentityCertifier {
  name: EntityNameStringMax100Bytes
  iconUrl: EntityIconURLStringMax500Bytes
  description: DescriptionString5to50Bytes
  trust: PositiveIntegerMax10
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [PositiveIntegerMax10](#type-positiveintegermax10)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: InternalizeActionArgs

```ts
export interface InternalizeActionArgs {
  tx: AtomicBEEF
  outputs: InternalizeOutput[]
  description: DescriptionString5to50Bytes
  labels?: LabelStringUnder300Bytes[]
  seekPermission?: BooleanDefaultTrue
}
```

See also: [AtomicBEEF](#type-atomicbeef), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [InternalizeOutput](#interface-internalizeoutput), [LabelStringUnder300Bytes](#type-labelstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: InternalizeActionResult

```ts
export interface InternalizeActionResult {
  accepted: true
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: InternalizeOutput

```ts
export interface InternalizeOutput {
  outputIndex: PositiveIntegerOrZero
  protocol: 'wallet payment' | 'basket insertion'
  paymentRemittance?: WalletPayment
  insertionRemittance?: BasketInsertion
}
```

See also: [BasketInsertion](#interface-basketinsertion), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletPayment](#interface-walletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: KeyDeriverApi

```ts
export interface KeyDeriverApi {
  rootKey: PrivateKey
  identityKey: string
  derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean): PublicKey
  derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey
  deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey
  revealCounterpartySecret(counterparty: Counterparty): number[]
  revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[]
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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

##### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean): PublicKey
```

See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived public key.

Argument Details

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **forSelf**
  - Optional. false if undefined. Whether deriving for self.

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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: KeyLinkageResult

```ts
export interface KeyLinkageResult {
  encryptedLinkage: Byte[]
  encryptedLinkageProof: Byte[]
  prover: PubKeyHex
  verifier: PubKeyHex
  counterparty: PubKeyHex
}
```

See also: [Byte](#type-byte), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: KeyPair

```ts
export interface KeyPair {
  privateKey: string
  publicKey: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListActionsArgs

```ts
export interface ListActionsArgs {
  labels: LabelStringUnder300Bytes[]
  labelQueryMode?: 'any' | 'all'
  includeLabels?: BooleanDefaultFalse
  includeInputs?: BooleanDefaultFalse
  includeInputSourceLockingScripts?: BooleanDefaultFalse
  includeInputUnlockingScripts?: BooleanDefaultFalse
  includeOutputs?: BooleanDefaultFalse
  includeOutputLockingScripts?: BooleanDefaultFalse
  limit?: PositiveIntegerDefault10Max10000
  offset?: PositiveIntegerOrZero
  seekPermission?: BooleanDefaultTrue
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListActionsResult

```ts
export interface ListActionsResult {
  totalActions: PositiveIntegerOrZero
  actions: WalletAction[]
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletAction](#interface-walletaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListCertificatesArgs

```ts
export interface ListCertificatesArgs {
  certifiers: PubKeyHex[]
  types: Base64String[]
  limit?: PositiveIntegerDefault10Max10000
  offset?: PositiveIntegerOrZero
  privileged?: BooleanDefaultFalse
  privilegedReason?: DescriptionString5to50Bytes
}
```

See also: [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListCertificatesResult

```ts
export interface ListCertificatesResult {
  totalCertificates: PositiveIntegerOrZero
  certificates: CertificateResult[]
}
```

See also: [CertificateResult](#interface-certificateresult), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListOutputsArgs

```ts
export interface ListOutputsArgs {
  basket: BasketStringUnder300Bytes
  tags?: OutputTagStringUnder300Bytes[]
  tagQueryMode?: 'all' | 'any'
  include?: 'locking scripts' | 'entire transactions'
  includeCustomInstructions?: BooleanDefaultFalse
  includeTags?: BooleanDefaultFalse
  includeLabels?: BooleanDefaultFalse
  limit?: PositiveIntegerDefault10Max10000
  offset?: PositiveIntegerOrZero
  seekPermission?: BooleanDefaultTrue
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ListOutputsResult

```ts
export interface ListOutputsResult {
  totalOutputs: PositiveIntegerOrZero
  BEEF?: BEEF
  outputs: WalletOutput[]
}
```

See also: [BEEF](#type-beef), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletOutput](#interface-walletoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: OutPoint

Identifies a unique transaction output by its `txid` and index `vout`

```ts
export interface OutPoint {
  txid: string
  vout: number
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
  limit: number
  offset?: number
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PendingSignAction

```ts
export interface PendingSignAction {
  reference: string
  dcr: sdk.StorageCreateTransactionSdkResult
  args: sdk.ValidCreateActionArgs
  tx: Transaction
  amount: number
  pdi: PendingStorageInput[]
}
```

See also: [PendingStorageInput](#interface-pendingstorageinput), [StorageCreateTransactionSdkResult](#interface-storagecreatetransactionsdkresult), [ValidCreateActionArgs](#interface-validcreateactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PendingStorageInput

```ts
export interface PendingStorageInput {
  vin: number
  derivationPrefix: string
  derivationSuffix: string
  unlockerPubKey?: string
  sourceSatoshis: number
  lockingScript: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PostBeefResult

```ts
export interface PostBeefResult extends PostTxsResult {}
```

See also: [PostTxsResult](#interface-posttxsresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PostReqsToNetworkDetails

```ts
export interface PostReqsToNetworkDetails {
  txid: string
  req: entity.ProvenTxReq
  status: PostReqsToNetworkDetailsStatus
  pbrft: sdk.PostTxResultForTxid
  data?: string
  error?: string
}
```

See also: [PostReqsToNetworkDetailsStatus](#type-postreqstonetworkdetailsstatus), [PostTxResultForTxid](#interface-posttxresultfortxid)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PostReqsToNetworkResult

```ts
export interface PostReqsToNetworkResult {
  status: 'success' | 'error'
  beef: bsv.Beef
  details: PostReqsToNetworkDetails[]
  pbr?: sdk.PostBeefResult
  log: string
}
```

See also: [PostBeefResult](#interface-postbeefresult), [PostReqsToNetworkDetails](#interface-postreqstonetworkdetails)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PostTxResultForTxid

```ts
export interface PostTxResultForTxid {
  txid: string
  status: 'success' | 'error'
  alreadyKnown?: boolean
  blockHash?: string
  blockHeight?: number
  merklePath?: bsv.MerklePath
  data?: object
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
status: 'success' | 'error'
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PostTxsResult

Properties on array items of result returned from `WalletServices` function `postBeef`.

```ts
export interface PostTxsResult {
  name: string
  status: 'success' | 'error'
  error?: sdk.WalletError
  txidResults: PostTxResultForTxid[]
  data?: object
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
status: 'success' | 'error'
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ProveCertificateArgs

```ts
export interface ProveCertificateArgs {
  certificate: Partial<WalletCertificate>
  fieldsToReveal: CertificateFieldNameUnder50Bytes[]
  verifier: PubKeyHex
  privileged?: BooleanDefaultFalse
  privilegedReason?: DescriptionString5to50Bytes
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ProveCertificateResult

```ts
export interface ProveCertificateResult {
  keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>
  certificate: WalletCertificate
  verifier: PubKeyHex
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ProvenOrRawTx

```ts
export interface ProvenOrRawTx {
  proven?: table.ProvenTx
  rawTx?: number[]
  inputBEEF?: number[]
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: PurgeParams

```ts
export interface PurgeParams {
  purgeCompleted: boolean
  purgeFailed: boolean
  purgeSpent: boolean
  purgeCompletedAge?: number
  purgeFailedAge?: number
  purgeSpentAge?: number
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
  count: number
  log: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RelinquishCertificateArgs

```ts
export interface RelinquishCertificateArgs {
  type: Base64String
  serialNumber: Base64String
  certifier: PubKeyHex
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RelinquishCertificateResult

```ts
export interface RelinquishCertificateResult {
  relinquished: true
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RelinquishOutputArgs

```ts
export interface RelinquishOutputArgs {
  basket: BasketStringUnder300Bytes
  output: OutpointString
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutpointString](#type-outpointstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RelinquishOutputResult

```ts
export interface RelinquishOutputResult {
  relinquished: true
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RequestSyncChunkArgs

```ts
export interface RequestSyncChunkArgs {
  identityKey: string
  since?: Date
  maxRoughSize: number
  maxItems: number
  offsets: {
    name: string
    offset: number
  }[]
}
```

<details>

<summary>Interface RequestSyncChunkArgs Details</summary>

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
  name: string
  offset: number
}
;[]
```

##### Property since

The max updated_at time received from the storage service receiving the request.
Will be undefiend if this is the first request or if no data was previously sync'ed.

`since` must include items if 'updated_at' is greater or equal. Thus, when not undefined, a sync request should always return at least one item already seen.

```ts
since?: Date
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RequestSyncChunkResult

Result received from remote `WalletStorage` in response to a `RequestSyncChunkArgs` request.

Each property is undefined if there was no attempt to update it. Typically this is caused by size and count limits on this result.

If all properties are empty arrays the sync process has received all available new and updated items.

```ts
export interface RequestSyncChunkResult {
  provenTxs?: table.ProvenTx[]
  provenTxReqs?: table.ProvenTxReq[]
  outputBaskets?: table.OutputBasket[]
  txLabels?: table.TxLabel[]
  outputTags?: table.OutputTag[]
  transactions?: table.Transaction[]
  txLabelMaps?: table.TxLabelMap[]
  commissions?: table.Commission[]
  outputs?: table.Output[]
  outputTagMaps?: table.OutputTagMap[]
  certificates?: table.Certificate[]
  certificateFields?: table.CertificateField[]
}
```

See also: [Certificate](#class-certificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RevealCounterpartyKeyLinkageArgs

```ts
export interface RevealCounterpartyKeyLinkageArgs {
  counterparty: PubKeyHex
  verifier: PubKeyHex
  privileged?: BooleanDefaultFalse
  privilegedReason?: DescriptionString5to50Bytes
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RevealCounterpartyKeyLinkageResult

```ts
export interface RevealCounterpartyKeyLinkageResult extends KeyLinkageResult {
  revelationTime: ISOTimestampString
}
```

See also: [ISOTimestampString](#type-isotimestampstring), [KeyLinkageResult](#interface-keylinkageresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RevealSpecificKeyLinkageArgs

```ts
export interface RevealSpecificKeyLinkageArgs {
  counterparty: WalletCounterparty
  verifier: PubKeyHex
  protocolID: WalletProtocol
  keyID: KeyIDStringUnder800Bytes
  privilegedReason?: DescriptionString5to50Bytes
  privileged?: BooleanDefaultFalse
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [PubKeyHex](#type-pubkeyhex), [WalletCounterparty](#type-walletcounterparty), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: RevealSpecificKeyLinkageResult

```ts
export interface RevealSpecificKeyLinkageResult extends KeyLinkageResult {
  protocolID: WalletProtocol
  keyID: KeyIDStringUnder800Bytes
  proofType: Byte
}
```

See also: [Byte](#type-byte), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [KeyLinkageResult](#interface-keylinkageresult), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ScriptTemplateParamsSABPPP

```ts
export interface ScriptTemplateParamsSABPPP {
  derivationPrefix?: string
  derivationSuffix?: string
  keyDeriver: sdk.KeyDeriverApi
}
```

See also: [KeyDeriverApi](#interface-keyderiverapi)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SendWithResult

```ts
export interface SendWithResult {
  txid: TXIDHexString
  status: SendWithResultStatus
}
```

See also: [SendWithResultStatus](#type-sendwithresultstatus), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SignActionArgs

```ts
export interface SignActionArgs {
  spends: Record<PositiveIntegerOrZero, SignActionSpend>
  reference: Base64String
  options?: SignActionOptions
}
```

See also: [Base64String](#type-base64string), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SignActionOptions](#interface-signactionoptions), [SignActionSpend](#interface-signactionspend)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SignActionOptions

```ts
export interface SignActionOptions {
  acceptDelayedBroadcast?: BooleanDefaultTrue
  returnTXIDOnly?: BooleanDefaultFalse
  noSend?: BooleanDefaultFalse
  sendWith?: TXIDHexString[]
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SignActionResult

```ts
export interface SignActionResult {
  txid?: TXIDHexString
  tx?: AtomicBEEF
  sendWithResults?: SendWithResult[]
}
```

See also: [AtomicBEEF](#type-atomicbeef), [SendWithResult](#interface-sendwithresult), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SignActionSpend

```ts
export interface SignActionSpend {
  unlockingScript: HexString
  sequenceNumber?: PositiveIntegerOrZero
}
```

See also: [HexString](#type-hexstring), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: SignableTransaction

```ts
export interface SignableTransaction {
  tx: AtomicBEEF
  reference: Base64String
}
```

See also: [AtomicBEEF](#type-atomicbeef), [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageCreateTransactionSdkInput

```ts
export interface StorageCreateTransactionSdkInput {
  vin: number
  sourceTxid: string
  sourceVout: number
  sourceSatoshis: number
  sourceLockingScript: string
  unlockingScriptLength: number
  providedBy: StorageProvidedBy
  type: string
  spendingDescription?: string
  derivationPrefix?: string
  derivationSuffix?: string
  senderIdentityKey?: string
}
```

See also: [StorageProvidedBy](#type-storageprovidedby)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageCreateTransactionSdkOutput

```ts
export interface StorageCreateTransactionSdkOutput extends sdk.ValidCreateActionOutput {
  vout: number
  providedBy: StorageProvidedBy
  purpose?: string
  derivationSuffix?: string
}
```

See also: [StorageProvidedBy](#type-storageprovidedby), [ValidCreateActionOutput](#interface-validcreateactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageCreateTransactionSdkResult

```ts
export interface StorageCreateTransactionSdkResult {
  inputBeef?: number[]
  inputs: StorageCreateTransactionSdkInput[]
  outputs: StorageCreateTransactionSdkOutput[]
  noSendChangeOutputVouts?: number[]
  derivationPrefix: string
  version: number
  lockTime: number
  reference: string
}
```

See also: [StorageCreateTransactionSdkInput](#interface-storagecreatetransactionsdkinput), [StorageCreateTransactionSdkOutput](#interface-storagecreatetransactionsdkoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageFeeModel

Specifies the available options for computing transaction fees.

```ts
export interface StorageFeeModel {
  model: 'sat/kb'
  value?: number
}
```

<details>

<summary>Interface StorageFeeModel Details</summary>

##### Property model

Available models. Currently only "sat/kb" is supported.

```ts
model: 'sat/kb'
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
  trustSelf?: 'known'
  knownTxids?: string[]
  mergeToBeef?: bsv.Beef | number[]
  ignoreStorage?: boolean
  ignoreServices?: boolean
  ignoreNewProven?: boolean
  minProofLevel?: number
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
  storageIdentityKey: string
  storageName: string
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

#### Interface: StorageInternalizeActionArgs

```ts
export interface StorageInternalizeActionArgs extends sdk.ValidInternalizeActionArgs {
  commonDerivationPrefix: string | undefined
}
```

See also: [ValidInternalizeActionArgs](#interface-validinternalizeactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageProcessActionSdkParams

```ts
export interface StorageProcessActionSdkParams {
  isNewTx: boolean
  isSendWith: boolean
  isNoSend: boolean
  isDelayed: boolean
  reference?: string
  txid?: string
  rawTx?: number[]
  sendWith: string[]
  log?: string
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageProcessActionSdkResults

```ts
export interface StorageProcessActionSdkResults {
  sendWithResults?: sdk.SendWithResult[]
  log?: string
}
```

See also: [SendWithResult](#interface-sendwithresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageProvenOrReq

```ts
export interface StorageProvenOrReq {
  proven?: table.ProvenTx
  req?: table.ProvenTxReq
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageSyncReader

```ts
export interface StorageSyncReader {
  isAvailable(): boolean
  makeAvailable(): Promise<void>
  settings?: table.Settings
  destroy(): Promise<void>
  getSettings(trx?: sdk.TrxToken): Promise<table.Settings>
  getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>
  getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]>
  getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]>
  getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]>
  findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]>
  findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>
  findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]>
  findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>
  findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>
  findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]>
  findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]>
  findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]>
  findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]>
  findUsers(args: sdk.FindUsersArgs): Promise<table.User[]>
  requestSyncChunk(args: RequestSyncChunkArgs): Promise<RequestSyncChunkResult>
}
```

See also: [Certificate](#class-certificate), [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs), [FindCertificatesArgs](#interface-findcertificatesargs), [FindCommissionsArgs](#interface-findcommissionsargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputTagsArgs](#interface-findoutputtagsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindSyncStatesArgs](#interface-findsyncstatesargs), [FindTransactionsArgs](#interface-findtransactionsargs), [FindTxLabelsArgs](#interface-findtxlabelsargs), [FindUsersArgs](#interface-findusersargs), [Paged](#interface-paged), [RequestSyncChunkArgs](#interface-requestsyncchunkargs), [RequestSyncChunkResult](#interface-requestsyncchunkresult), [TrxToken](#interface-trxtoken)

<details>

<summary>Interface StorageSyncReader Details</summary>

##### Property settings

Valid if isAvailable() returns true which requires makeAvailable() to complete successfully.

```ts
settings?: table.Settings
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: StorageSyncReaderOptions

```ts
export interface StorageSyncReaderOptions {
  chain: sdk.Chain
}
```

See also: [Chain](#type-chain)

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
  - Delete tag and label mapping records
  - Delete output records
  - Delete transaction records
  - Delete mapi_responses records
  - Delete proven_tx_reqs records
  - Delete commissions records
  - Update output records marked spentBy failed transactions
- Completed transactions, delete transient data including:
  - transactions table set truncatedExternalInputs = null
  - transactions table set beef = null
  - transactions table set rawTx = null
  - Delete mapi_responses records
  - proven_tx_reqs table delete records

```ts
export interface TaskPurgeParams extends sdk.PurgeParams {}
```

See also: [PurgeParams](#interface-purgeparams)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: TrxToken

Place holder for the transaction control object used by actual storage provider implementation.

```ts
export interface TrxToken {}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: TscMerkleProofApi

```ts
export interface TscMerkleProofApi {
  height: number
  index: number
  nodes: string[]
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidAbortActionArgs

```ts
export interface ValidAbortActionArgs {
  reference: sdk.Base64String
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidAcquireCertificateArgs

```ts
export interface ValidAcquireCertificateArgs {
  acquisitionProtocol: sdk.AcquisitionProtocol
  type: sdk.Base64String
  serialNumber?: sdk.Base64String
  certifier: sdk.PubKeyHex
  revocationOutpoint?: sdk.OutpointString
  fields: Record<sdk.CertificateFieldNameUnder50Bytes, string>
  signature?: sdk.HexString
  certifierUrl?: string
  keyringRevealer?: sdk.KeyringRevealer
  keyringForSubject?: Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>
  privileged: boolean
  privilegedReason?: sdk.DescriptionString5to50Bytes
  userId?: string
  log?: string
}
```

See also: [AcquisitionProtocol](#type-acquisitionprotocol), [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidAcquireDirectCertificateArgs

```ts
export interface ValidAcquireDirectCertificateArgs {
  type: sdk.Base64String
  serialNumber: sdk.Base64String
  certifier: sdk.PubKeyHex
  revocationOutpoint: sdk.OutpointString
  fields: Record<sdk.CertificateFieldNameUnder50Bytes, string>
  signature: sdk.HexString
  subject: sdk.PubKeyHex
  keyringRevealer: sdk.KeyringRevealer
  keyringForSubject: Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>
  privileged: boolean
  privilegedReason?: sdk.DescriptionString5to50Bytes
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

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
  basket: sdk.BasketStringUnder300Bytes
  customInstructions?: string
  tags: sdk.OutputTagStringUnder300Bytes[]
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidCreateActionArgs

```ts
export interface ValidCreateActionArgs extends ValidProcessActionArgs {
  description: sdk.DescriptionString5to50Bytes
  inputBEEF?: sdk.BEEF
  inputs: sdk.ValidCreateActionInput[]
  outputs: sdk.ValidCreateActionOutput[]
  lockTime: number
  version: number
  labels: string[]
  options: ValidCreateActionOptions
  isSignAction: boolean
  userId?: number
  log?: string
}
```

See also: [BEEF](#type-beef), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [ValidCreateActionInput](#interface-validcreateactioninput), [ValidCreateActionOptions](#interface-validcreateactionoptions), [ValidCreateActionOutput](#interface-validcreateactionoutput), [ValidProcessActionArgs](#interface-validprocessactionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidCreateActionInput

```ts
export interface ValidCreateActionInput {
  outpoint: OutPoint
  inputDescription: sdk.DescriptionString5to50Bytes
  sequenceNumber: sdk.PositiveIntegerOrZero
  unlockingScript?: sdk.HexString
  unlockingScriptLength: sdk.PositiveInteger
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutPoint](#interface-outpoint), [PositiveInteger](#type-positiveinteger), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidCreateActionOptions

```ts
export interface ValidCreateActionOptions extends ValidProcessActionOptions {
  signAndProcess: boolean
  trustSelf?: sdk.TrustSelf
  knownTxids: sdk.TXIDHexString[]
  noSendChange: OutPoint[]
  randomizeOutputs: boolean
}
```

See also: [OutPoint](#interface-outpoint), [TXIDHexString](#type-txidhexstring), [TrustSelf](#type-trustself), [ValidProcessActionOptions](#interface-validprocessactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidCreateActionOutput

```ts
export interface ValidCreateActionOutput {
  lockingScript: sdk.HexString
  satoshis: sdk.SatoshiValue
  outputDescription: sdk.DescriptionString5to50Bytes
  basket?: sdk.BasketStringUnder300Bytes
  customInstructions?: string
  tags: sdk.OutputTagStringUnder300Bytes[]
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidDiscoverByAttributesArgs

```ts
export interface ValidDiscoverByAttributesArgs {
  attributes: Record<sdk.CertificateFieldNameUnder50Bytes, string>
  limit: sdk.PositiveIntegerDefault10Max10000
  offset: sdk.PositiveIntegerOrZero
  seekPermission: boolean
  userId?: number
  log?: string
}
```

See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidDiscoverByIdentityKeyArgs

```ts
export interface ValidDiscoverByIdentityKeyArgs {
  identityKey: sdk.PubKeyHex
  limit: sdk.PositiveIntegerDefault10Max10000
  offset: sdk.PositiveIntegerOrZero
  seekPermission: boolean
  userId?: number
  log?: string
}
```

See also: [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidInternalizeActionArgs

```ts
export interface ValidInternalizeActionArgs {
  tx: sdk.AtomicBEEF
  outputs: sdk.InternalizeOutput[]
  description: sdk.DescriptionString5to50Bytes
  labels: sdk.LabelStringUnder300Bytes[]
  seekPermission: sdk.BooleanDefaultTrue
  userId?: number
  log?: string
}
```

See also: [AtomicBEEF](#type-atomicbeef), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [InternalizeOutput](#interface-internalizeoutput), [LabelStringUnder300Bytes](#type-labelstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidInternalizeOutput

```ts
export interface ValidInternalizeOutput {
  outputIndex: sdk.PositiveIntegerOrZero
  protocol: 'wallet payment' | 'basket insertion'
  paymentRemittance?: ValidWalletPayment
  insertionRemittance?: ValidBasketInsertion
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [ValidBasketInsertion](#interface-validbasketinsertion), [ValidWalletPayment](#interface-validwalletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidListActionsArgs

```ts
export interface ValidListActionsArgs {
  labels: sdk.LabelStringUnder300Bytes[]
  labelQueryMode: 'any' | 'all'
  includeLabels: sdk.BooleanDefaultFalse
  includeInputs: sdk.BooleanDefaultFalse
  includeInputSourceLockingScripts: sdk.BooleanDefaultFalse
  includeInputUnlockingScripts: sdk.BooleanDefaultFalse
  includeOutputs: sdk.BooleanDefaultFalse
  includeOutputLockingScripts: sdk.BooleanDefaultFalse
  limit: sdk.PositiveIntegerDefault10Max10000
  offset: sdk.PositiveIntegerOrZero
  seekPermission: sdk.BooleanDefaultTrue
  userId?: number
  log?: string
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidListCertificatesArgs

```ts
export interface ValidListCertificatesArgs {
  partial?: {
    type?: sdk.Base64String
    serialNumber?: sdk.Base64String
    certifier?: sdk.PubKeyHex
    subject?: sdk.PubKeyHex
    revocationOutpoint?: sdk.OutpointString
    signature?: sdk.HexString
  }
  certifiers: sdk.PubKeyHex[]
  types: sdk.Base64String[]
  limit: sdk.PositiveIntegerDefault10Max10000
  offset: sdk.PositiveIntegerOrZero
  privileged: sdk.BooleanDefaultFalse
  privilegedReason?: sdk.DescriptionString5to50Bytes
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidListOutputsArgs

```ts
export interface ValidListOutputsArgs {
  basket: sdk.BasketStringUnder300Bytes
  tags: sdk.OutputTagStringUnder300Bytes[]
  tagQueryMode: 'all' | 'any'
  includeLockingScripts: boolean
  includeTransactions: boolean
  includeCustomInstructions: sdk.BooleanDefaultFalse
  includeTags: sdk.BooleanDefaultFalse
  includeLabels: sdk.BooleanDefaultFalse
  limit: sdk.PositiveIntegerDefault10Max10000
  offset: sdk.PositiveIntegerOrZero
  seekPermission: sdk.BooleanDefaultTrue
  knownTxids: string[]
  userId?: number
  log?: string
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidProcessActionArgs

```ts
export interface ValidProcessActionArgs {
  options: sdk.ValidProcessActionOptions
  isSendWith: boolean
  isNewTx: boolean
  isNoSend: boolean
  isDelayed: boolean
  userId?: number
  log?: string
}
```

See also: [ValidProcessActionOptions](#interface-validprocessactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidProcessActionOptions

```ts
export interface ValidProcessActionOptions {
  acceptDelayedBroadcast: sdk.BooleanDefaultTrue
  returnTXIDOnly: sdk.BooleanDefaultFalse
  noSend: sdk.BooleanDefaultFalse
  sendWith: sdk.TXIDHexString[]
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidProveCertificateArgs

```ts
export interface ValidProveCertificateArgs {
  type?: sdk.Base64String
  serialNumber?: sdk.Base64String
  certifier?: sdk.PubKeyHex
  subject?: sdk.PubKeyHex
  revocationOutpoint?: sdk.OutpointString
  signature?: sdk.HexString
  fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[]
  verifier: sdk.PubKeyHex
  privileged: boolean
  privilegedReason?: sdk.DescriptionString5to50Bytes
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidRelinquishCertificateArgs

```ts
export interface ValidRelinquishCertificateArgs {
  type: sdk.Base64String
  serialNumber: sdk.Base64String
  certifier: sdk.PubKeyHex
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidRelinquishOutputArgs

```ts
export interface ValidRelinquishOutputArgs {
  basket: sdk.BasketStringUnder300Bytes
  output: sdk.OutpointString
  userId?: number
  log?: string
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutpointString](#type-outpointstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidSignActionArgs

```ts
export interface ValidSignActionArgs extends ValidProcessActionArgs {
  spends: Record<sdk.PositiveIntegerOrZero, sdk.SignActionSpend>
  reference: sdk.Base64String
  options: sdk.ValidSignActionOptions
  userId?: number
  log?: string
}
```

See also: [Base64String](#type-base64string), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SignActionSpend](#interface-signactionspend), [ValidProcessActionArgs](#interface-validprocessactionargs), [ValidSignActionOptions](#interface-validsignactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidSignActionOptions

```ts
export interface ValidSignActionOptions extends ValidProcessActionOptions {
  acceptDelayedBroadcast: boolean
  returnTXIDOnly: boolean
  noSend: boolean
  sendWith: sdk.TXIDHexString[]
}
```

See also: [TXIDHexString](#type-txidhexstring), [ValidProcessActionOptions](#interface-validprocessactionoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: ValidWalletPayment

```ts
export interface ValidWalletPayment {
  derivationPrefix: sdk.Base64String
  derivationSuffix: sdk.Base64String
  senderIdentityKey: sdk.PubKeyHex
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: VerifyHmacArgs

```ts
export interface VerifyHmacArgs extends WalletEncryptionArgs {
  data: Byte[]
  hmac: Byte[]
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: VerifyHmacResult

```ts
export interface VerifyHmacResult {
  valid: boolean
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: VerifySignatureArgs

```ts
export interface VerifySignatureArgs extends WalletEncryptionArgs {
  data?: Byte[]
  hashToDirectlyVerify?: Byte[]
  signature: Byte[]
  forSelf?: BooleanDefaultFalse
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: VerifySignatureResult

```ts
export interface VerifySignatureResult {
  valid: true
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
  createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>
  signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>
  abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>
  listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>
  internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>
  listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>
  relinquishOutput: (args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishOutputResult>
  acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AcquireCertificateResult>
  listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>
  proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>
  relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishCertificateResult>
  discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
  discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
  isAuthenticated: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
  waitForAuthentication: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
  getHeight: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeightResult>
  getHeaderForHeight: (args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeaderResult>
  getNetwork: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetNetworkResult>
  getVersion: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetVersionResult>
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [AuthenticatedResult](#interface-authenticatedresult), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [GetHeaderArgs](#interface-getheaderargs), [GetHeaderResult](#interface-getheaderresult), [GetHeightResult](#interface-getheightresult), [GetNetworkResult](#interface-getnetworkresult), [GetVersionResult](#interface-getversionresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [WalletCryptoObject](#interface-walletcryptoobject)

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
  txid: TXIDHexString
  satoshis: SatoshiValue
  status: ActionStatus
  isOutgoing: boolean
  description: DescriptionString5to50Bytes
  labels?: LabelStringUnder300Bytes[]
  version: PositiveIntegerOrZero
  lockTime: PositiveIntegerOrZero
  inputs?: WalletActionInput[]
  outputs?: WalletActionOutput[]
}
```

See also: [ActionStatus](#type-actionstatus), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue), [TXIDHexString](#type-txidhexstring), [WalletActionInput](#interface-walletactioninput), [WalletActionOutput](#interface-walletactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletActionInput

```ts
export interface WalletActionInput {
  sourceOutpoint: OutpointString
  sourceSatoshis: SatoshiValue
  sourceLockingScript?: HexString
  unlockingScript?: HexString
  inputDescription: DescriptionString5to50Bytes
  sequenceNumber: PositiveIntegerOrZero
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletActionOutput

```ts
export interface WalletActionOutput {
  satoshis: SatoshiValue
  lockingScript?: HexString
  spendable: boolean
  customInstructions?: string
  tags: OutputTagStringUnder300Bytes[]
  outputIndex: PositiveIntegerOrZero
  outputDescription: DescriptionString5to50Bytes
  basket: BasketStringUnder300Bytes
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletCertificate

```ts
export interface WalletCertificate {
  type: Base64String
  subject: PubKeyHex
  serialNumber: Base64String
  certifier: PubKeyHex
  revocationOutpoint: OutpointString
  signature: HexString
  fields: Record<CertificateFieldNameUnder50Bytes, string>
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
  getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>
  revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>
  revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>
  encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletEncryptResult>
  decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletDecryptResult>
  createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateHmacResult>
  verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifyHmacResult>
  createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateSignatureResult>
  verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifySignatureResult>
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
  ciphertext: Byte[]
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletDecryptResult

```ts
export interface WalletDecryptResult {
  plaintext: Byte[]
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletEncryptArgs

```ts
export interface WalletEncryptArgs extends WalletEncryptionArgs {
  plaintext: Byte[]
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletEncryptResult

```ts
export interface WalletEncryptResult {
  ciphertext: Byte[]
}
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletEncryptionArgs

```ts
export interface WalletEncryptionArgs {
  protocolID: WalletProtocol
  keyID: KeyIDStringUnder800Bytes
  counterparty?: WalletCounterparty
  privileged?: BooleanDefaultFalse
  privilegedReason?: DescriptionString5to50Bytes
  seekPermission?: BooleanDefaultTrue
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
  isError: true
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletMonitorOptions

```ts
export interface WalletMonitorOptions {
  chain: sdk.Chain
  services: WalletServices
  storage: WalletStorage
  chaintracks: ChaintracksClientApi
  msecsWaitPerMerkleProofServiceReq: number
  taskRunWaitMsecs: number
  abandonedMsecs: number
  unprovenAttemptsLimitTest: number
  unprovenAttemptsLimitMain: number
}
```

See also: [Chain](#type-chain), [WalletServices](#class-walletservices), [WalletStorage](#interface-walletstorage)

<details>

<summary>Interface WalletMonitorOptions Details</summary>

##### Property msecsWaitPerMerkleProofServiceReq

How many msecs to wait after each getMerkleProof service request.

```ts
msecsWaitPerMerkleProofServiceReq: number
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletOutput

```ts
export interface WalletOutput {
  satoshis: SatoshiValue
  lockingScript?: HexString
  spendable: boolean
  customInstructions?: string
  tags?: OutputTagStringUnder300Bytes[]
  outpoint: OutpointString
  labels?: LabelStringUnder300Bytes[]
}
```

See also: [HexString](#type-hexstring), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletPayment

```ts
export interface WalletPayment {
  derivationPrefix: Base64String
  derivationSuffix: Base64String
  senderIdentityKey: PubKeyHex
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletServices

Defines standard interfaces to access functionality implemented by external transaction processing services.

```ts
export interface WalletServices {
  chain: sdk.Chain
  getChainTracker(): Promise<bsv.ChainTracker>
  getHeaderForHeight(height: number): Promise<number[]>
  getHeight(): Promise<number>
  getBsvExchangeRate(): Promise<number>
  getFiatExchangeRate(currency: 'USD' | 'GBP' | 'EUR', base?: 'USD' | 'GBP' | 'EUR'): Promise<number>
  getRawTx(txid: string, useNext?: boolean): Promise<GetRawTxResult>
  getMerklePath(txid: string, useNext?: boolean): Promise<GetMerklePathResult>
  postTxs(beef: bsv.Beef, txids: string[]): Promise<PostTxsResult[]>
  postBeef(beef: bsv.Beef, txids: string[]): Promise<PostBeefResult[]>
  getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormat, useNext?: boolean): Promise<GetUtxoStatusResult>
  hashToHeader(hash: string): Promise<sdk.BlockHeaderHex>
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

- **txid**
  - transaction hash for which proof is requested
- **useNext**
  - optional, forces skip to next service before starting service requests cycle.

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

- **txid**
  - transaction hash for which raw transaction bytes are requested
- **useNext**
  - optional, forces skip to next service before starting service requests cycle.

##### Method getUtxoStatus

Attempts to determine the UTXO status of a transaction output.

Cycles through configured transaction processing services attempting to get a valid response.

```ts
getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormat, useNext?: boolean): Promise<GetUtxoStatusResult>
```

See also: [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult)

Argument Details

- **output**
  - transaction output identifier in format determined by `outputFormat`.
- **chain**
  - which chain to post to, all of rawTx's inputs must be unspent on this chain.
- **outputFormat**
  - optional, supported values:
    'hashLE' little-endian sha256 hash of output script
    'hashBE' big-endian sha256 hash of output script
    'script' entire transaction output script
    undefined if asBuffer length of `output` is 32 then 'hashBE`, otherwise 'script'.
- **useNext**
  - optional, forces skip to next service before starting service requests cycle.

##### Method hashToHeader

```ts
hashToHeader(hash: string): Promise<sdk.BlockHeaderHex>
```

See also: [BlockHeaderHex](#interface-blockheaderhex)

Returns

a block header

Argument Details

- **hash**
  - block hash

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletServicesOptions

```ts
export interface WalletServicesOptions {
  chain: sdk.Chain
  taalApiKey?: string
  bsvExchangeRate: BsvExchangeRate
  bsvUpdateMsecs: number
  fiatExchangeRates: FiatExchangeRates
  fiatUpdateMsecs: number
  disableMapiCallback?: boolean
  exchangeratesapiKey?: string
  chaintracksFiatExchangeRatesUrl?: string
  chaintracks?: ChaintracksClientApi
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
  chain?: sdk.Chain
  isAuthenticated(): boolean
  getClientChangeKeyPair(): KeyPair
  keyDeriver?: sdk.KeyDeriverApi
  storageIdentity?: StorageIdentity
  setServices(v: sdk.WalletServices): void
  getServices(): sdk.WalletServices
  authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>
  listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
  signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>
  abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult>
  acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult>
  listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult>
  proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
  relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
  discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  getChain(): Promise<sdk.Chain>
}
```

See also: [AbortActionResult](#interface-abortactionresult), [AcquireCertificateResult](#interface-acquirecertificateresult), [Chain](#type-chain), [CreateActionResult](#interface-createactionresult), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriverApi](#interface-keyderiverapi), [KeyPair](#interface-keypair), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionResult](#interface-signactionresult), [StorageIdentity](#interface-storageidentity), [ValidAbortActionArgs](#interface-validabortactionargs), [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidDiscoverByAttributesArgs](#interface-validdiscoverbyattributesargs), [ValidDiscoverByIdentityKeyArgs](#interface-validdiscoverbyidentitykeyargs), [ValidInternalizeActionArgs](#interface-validinternalizeactionargs), [ValidListActionsArgs](#interface-validlistactionsargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [ValidListOutputsArgs](#interface-validlistoutputsargs), [ValidProveCertificateArgs](#interface-validprovecertificateargs), [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs), [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs), [ValidSignActionArgs](#interface-validsignactionargs), [WalletServices](#class-walletservices), [createActionSdk](#function-createactionsdk), [internalizeActionSdk](#function-internalizeactionsdk), [proveCertificateSdk](#function-provecertificatesdk), [relinquishCertificateSdk](#function-relinquishcertificatesdk), [relinquishOutputSdk](#function-relinquishoutputsdk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Interface: WalletStorage

```ts
export interface WalletStorage extends sdk.StorageSyncReader {
  destroy(): Promise<void>
  dropAllData(): Promise<void>
  migrate(storageName: string): Promise<string>
  purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>
  getServices(): sdk.WalletServices
  setServices(v: sdk.WalletServices): void
  updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken)
  internalizeActionSdk(sargs: sdk.StorageInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult>
  processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults>
  abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<sdk.StorageProvenOrReq>
  findOrInsertTransaction(
    newTx: table.Transaction,
    trx?: sdk.TrxToken
  ): Promise<{
    tx: table.Transaction
    isNew: boolean
  }>
  findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket>
  findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel>
  findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap>
  findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag>
  findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap>
  tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void>
  insertCertificate(certificate: table.CertificateX, trx?: sdk.TrxToken): Promise<number>
  insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>
  insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>
  insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>
  insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>
  insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>
  insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>
  insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>
  insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>
  insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>
  insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>
  insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>
  insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>
  insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>
  insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken): Promise<number>
  updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>
  updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>
  updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>
  updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>
  updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>
  updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>
  updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>
  updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>
  updateProvenTxReq(id: number, update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>
  updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
  updateTransaction(id: number, update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>
  updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>
  updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>
  updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>
  updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number>
  getSettings(trx?: sdk.TrxToken): Promise<table.Settings>
  getProvenOrRawTx(txid: string, trx?: sdk.TrxToken)
  getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken)
  getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>
  getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]>
  getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]>
  getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]>
  getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]>
  getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]>
  transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>
  listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult>
  findCertificateFields(args: FindCertificateFieldsArgs): Promise<table.CertificateField[]>
  findCertificates(args: FindCertificatesArgs): Promise<table.Certificate[]>
  findCommissions(args: FindCommissionsArgs): Promise<table.Commission[]>
  findOutputBaskets(args: FindOutputBasketsArgs): Promise<table.OutputBasket[]>
  findOutputs(args: FindOutputsArgs): Promise<table.Output[]>
  findOutputTagMaps(args: FindOutputTagMapsArgs): Promise<table.OutputTagMap[]>
  findOutputTags(args: FindOutputTagsArgs): Promise<table.OutputTag[]>
  findProvenTxReqs(args: FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>
  findProvenTxs(args: FindProvenTxsArgs): Promise<table.ProvenTx[]>
  findSyncStates(args: FindSyncStatesArgs): Promise<table.SyncState[]>
  findTransactions(args: FindTransactionsArgs): Promise<table.Transaction[]>
  findTxLabelMaps(args: FindTxLabelMapsArgs): Promise<table.TxLabelMap[]>
  findTxLabels(args: FindTxLabelsArgs): Promise<table.TxLabel[]>
  findUsers(args: FindUsersArgs): Promise<table.User[]>
  findWatchmanEvents(args: FindWatchmanEventsArgs): Promise<table.WatchmanEvent[]>
  findUserByIdentityKey(key: string, trx?: sdk.TrxToken): Promise<table.User | undefined>
  findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined>
  findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined>
  findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined>
  findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined>
  findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined>
  findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined>
  findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined>
  findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined>
  findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined>
  findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined>
  findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined>
  findWatchmanEventById(id: number, trx?: sdk.TrxToken): Promise<table.WatchmanEvent | undefined>
  countCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<number>
  countCertificates(args: sdk.FindCertificatesArgs): Promise<number>
  countCommissions(args: sdk.FindCommissionsArgs): Promise<number>
  countOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<number>
  countOutputs(args: sdk.FindOutputsArgs): Promise<number>
  countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number>
  countOutputTags(args: sdk.FindOutputTagsArgs): Promise<number>
  countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number>
  countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number>
  countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number>
  countTransactions(args: sdk.FindTransactionsArgs): Promise<number>
  countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number>
  countTxLabels(args: sdk.FindTxLabelsArgs): Promise<number>
  countUsers(args: sdk.FindUsersArgs): Promise<number>
  countWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<number>
}
```

See also: [AbortActionResult](#interface-abortactionresult), [Certificate](#class-certificate), [FindCertificateFieldsArgs](#interface-findcertificatefieldsargs), [FindCertificatesArgs](#interface-findcertificatesargs), [FindCommissionsArgs](#interface-findcommissionsargs), [FindOutputBasketsArgs](#interface-findoutputbasketsargs), [FindOutputTagMapsArgs](#interface-findoutputtagmapsargs), [FindOutputTagsArgs](#interface-findoutputtagsargs), [FindOutputsArgs](#interface-findoutputsargs), [FindProvenTxReqsArgs](#interface-findproventxreqsargs), [FindProvenTxsArgs](#interface-findproventxsargs), [FindSyncStatesArgs](#interface-findsyncstatesargs), [FindTransactionsArgs](#interface-findtransactionsargs), [FindTxLabelMapsArgs](#interface-findtxlabelmapsargs), [FindTxLabelsArgs](#interface-findtxlabelsargs), [FindUsersArgs](#interface-findusersargs), [FindWatchmanEventsArgs](#interface-findwatchmaneventsargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [Paged](#interface-paged), [PurgeParams](#interface-purgeparams), [PurgeResults](#interface-purgeresults), [StorageCreateTransactionSdkResult](#interface-storagecreatetransactionsdkresult), [StorageInternalizeActionArgs](#interface-storageinternalizeactionargs), [StorageProcessActionSdkParams](#interface-storageprocessactionsdkparams), [StorageProcessActionSdkResults](#interface-storageprocessactionsdkresults), [StorageProvenOrReq](#interface-storageprovenorreq), [StorageSyncReader](#interface-storagesyncreader), [TransactionStatus](#type-transactionstatus), [TrxToken](#interface-trxtoken), [ValidAbortActionArgs](#interface-validabortactionargs), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidListActionsArgs](#interface-validlistactionsargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [ValidListOutputsArgs](#interface-validlistoutputsargs), [WalletServices](#class-walletservices), [internalizeActionSdk](#function-internalizeactionsdk), [processActionSdk](#function-processactionsdk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Classes

|                                                     |                                                           |                                                         |
| --------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| [CachedKeyDeriver](#class-cachedkeyderiver)         | [TaskNotifyOfProofs](#class-tasknotifyofproofs)           | [WERR_MISSING_PARAMETER](#class-werr_missing_parameter) |
| [CertOps](#class-certops)                           | [TaskPurge](#class-taskpurge)                             | [WERR_NETWORK_CHAIN](#class-werr_network_chain)         |
| [Certificate](#class-certificate)                   | [TaskSendWaiting](#class-tasksendwaiting)                 | [WERR_NOT_IMPLEMENTED](#class-werr_not_implemented)     |
| [KeyDeriver](#class-keyderiver)                     | [TaskSyncWhenIdle](#class-tasksyncwhenidle)               | [WERR_UNAUTHORIZED](#class-werr_unauthorized)           |
| [ScriptTemplateSABPPP](#class-scripttemplatesabppp) | [TaskValidate](#class-taskvalidate)                       | [Wallet](#class-wallet)                                 |
| [ServiceCollection](#class-servicecollection)       | [WERR_BAD_REQUEST](#class-werr_bad_request)               | [WalletCrypto](#class-walletcrypto)                     |
| [TaskCheckForProofs](#class-taskcheckforproofs)     | [WERR_INSUFFICIENT_FUNDS](#class-werr_insufficient_funds) | [WalletError](#class-walleterror)                       |
| [TaskCheckProofs](#class-taskcheckproofs)           | [WERR_INTERNAL](#class-werr_internal)                     | [WalletMonitor](#class-walletmonitor)                   |
| [TaskClock](#class-taskclock)                       | [WERR_INVALID_OPERATION](#class-werr_invalid_operation)   | [WalletMonitorTask](#class-walletmonitortask)           |
| [TaskFailAbandoned](#class-taskfailabandoned)       | [WERR_INVALID_PARAMETER](#class-werr_invalid_parameter)   | [WalletServices](#class-walletservices)                 |
| [TaskNewHeader](#class-tasknewheader)               | [WERR_INVALID_PUBLIC_KEY](#class-werr_invalid_public_key) | [WalletSigner](#class-walletsigner)                     |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: CachedKeyDeriver

A cached version of KeyDeriver that caches the results of key derivation methods.
This is useful for optimizing performance when the same keys are derived multiple times.
It supports configurable cache size with sane defaults and maintains cache entries using LRU (Least Recently Used) eviction policy.

```ts
export default class CachedKeyDeriver {
  constructor(
    rootKey: PrivateKey | 'anyone',
    options?: {
      maxCacheSize?: number
    }
  )
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

- **rootKey**
  - The root private key or the string 'anyone'.
- **options**
  - Optional settings for the cache.

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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **forSelf**
  - Whether deriving for self.

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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.

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
    async createKeyringForVerifier(verifierIdentityKey: sdk.PubKeyHex, fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[], originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>>
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
async createKeyringForVerifier(verifierIdentityKey: sdk.PubKeyHex, fieldsToReveal: sdk.CertificateFieldNameUnder50Bytes[], originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<Record<sdk.CertificateFieldNameUnder50Bytes, sdk.Base64String>>
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex)

Returns

- A new certificate structure containing the original encrypted fields, the verifier-specific field decryption keyring, and essential certificate metadata.

Argument Details

- **verifierIdentityKey**
  - The public identity key of the verifier who will receive access to the specified fields.
- **fieldsToReveal**
  - An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
- **originator**
  - Optional originator identifier, used if additional context is needed for decryption and encryption operations.

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
  type: Base64String
  serialNumber: Base64String
  subject: PubKeyHex
  certifier: PubKeyHex
  revocationOutpoint: OutpointString
  fields: Record<CertificateFieldNameUnder50Bytes, string>
  signature?: HexString
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

- **type**
  - Type identifier for the certificate, base64 encoded string, 32 bytes.
- **serialNumber**
  - Unique serial number of the certificate, base64 encoded string, 32 bytes.
- **subject**
  - The public key belonging to the certificate's subject, compressed public key hex string.
- **certifier**
  - Public key of the certifier who issued the certificate, compressed public key hex string.
- **revocationOutpoint**
  - The outpoint used to confirm that the certificate has not been revoked (TXID.OutputIndex), as a string.
- **fields**
  - All the fields present in the certificate.
- **signature**
  - Certificate signature by the certifier's private key, DER encoded hex string.

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

- **bin**
  - The binary data representing the certificate.

##### Method sign

Signs the certificate using the provided certifier wallet.

```ts
async sign(certifier: WalletCrypto): Promise<void>
```

See also: [WalletCrypto](#class-walletcrypto)

Argument Details

- **certifier**
  - The wallet representing the certifier.

##### Method toBin

Serializes the certificate into binary format, with or without a signature.

```ts
toBin(includeSignature: boolean = true): number[]
```

Returns

- The serialized certificate in binary format.

Argument Details

- **includeSignature**
  - Whether to include the signature in the serialization.

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
  rootKey: PrivateKey
  identityKey: string
  constructor(rootKey: PrivateKey | 'anyone')
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

- **rootKey**
  - The root private key or the string 'anyone'.

##### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey
```

See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived private key.

Argument Details

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

##### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey
```

See also: [Counterparty](#type-counterparty), [WalletProtocol](#type-walletprotocol)

Returns

- The derived public key.

Argument Details

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **forSelf**
  - Whether deriving for self.

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

- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.
- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').

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

- **counterparty**
  - The counterparty's public key or a predefined value ('self' or 'anyone').
- **protocolID**
  - The protocol ID including a security level and protocol name.
- **keyID**
  - The key identifier.

</details>

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
    name: string
    service: T
  }[]
  _index: number
  constructor(
    services?: {
      name: string
      service: T
    }[]
  )
  add(s: { name: string; service: T }): ServiceCollection<T>
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
    constructor(monitor: WalletMonitor, public triggerMsecs = 0)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskCheckForProofs Details</summary>

##### Property checkNow

An external service such as the chaintracks new block header
listener can set this true to cause

```ts
static checkNow = false
```

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

#### Class: TaskCheckProofs

```ts
export class TaskCheckProofs extends WalletMonitorTask {
    static taskName = "CheckProofs";
    static checkNow = false;
    constructor(monitor: WalletMonitor, public triggerMsecs = 1000 * 60 * 60 * 4)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskCheckProofs Details</summary>

##### Property checkNow

Set to true to trigger running this task

```ts
static checkNow = false
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskClock

```ts
export class TaskClock extends WalletMonitorTask {
    static taskName = "Clock";
    nextMinute: number;
    constructor(monitor: WalletMonitor, public triggerMsecs = 1 * monitor.oneSecond)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
    getNextMinute(): number
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

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
    constructor(monitor: WalletMonitor, public triggerMsecs = 1000 * 60 * 5)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskNewHeader

```ts
export class TaskNewHeader extends WalletMonitorTask {
    static taskName = "NewHeader";
    header?: sdk.BlockHeaderHex;
    constructor(monitor: WalletMonitor, public triggerMsecs = 1 * monitor.oneMinute)
    async getHeader(): Promise<sdk.BlockHeaderHex>
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskNotifyOfProofs

```ts
export class TaskNotifyOfProofs extends WalletMonitorTask {
    static taskName = "NotifyOfProofs";
    static checkNow = false;
    constructor(monitor: WalletMonitor, public triggerMsecs = 0)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskNotifyOfProofs Details</summary>

##### Property checkNow

Set to true to trigger running this task

```ts
static checkNow = false
```

##### Method trigger

Normally triggered by checkNow getting set to true when a new proof is obtained.

```ts
trigger(nowMsecsSinceEpoch: number): {
    run: boolean;
}
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskPurge

```ts
export class TaskPurge extends WalletMonitorTask {
    static taskName = "Purge";
    static checkNow = false;
    constructor(monitor: WalletMonitor, public params: TaskPurgeParams, public triggerMsecs = 0)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [TaskPurgeParams](#interface-taskpurgeparams), [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

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
    constructor(monitor: WalletMonitor, public triggerMsecs = 1000 * 60 * 5, public agedMsecs = 0)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskSyncWhenIdle

```ts
export class TaskSyncWhenIdle extends WalletMonitorTask {
    static taskName = "SyncWhenIdle";
    constructor(monitor: WalletMonitor, public triggerMsecs = 1000 * 60 * 1)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: TaskValidate

```ts
export class TaskValidate extends WalletMonitorTask {
    static taskName = "Validate";
    static checkNow = false;
    constructor(monitor: WalletMonitor, public triggerMsecs = 0)
    trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    }
    async runTask(): Promise<void>
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletMonitorTask](#class-walletmonitortask)

<details>

<summary>Class TaskValidate Details</summary>

##### Property checkNow

Set to true to trigger running this task

```ts
static checkNow = false
```

</details>

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

- **totalSatoshisNeeded**
  - Total satoshis required to fund transactions after net of required inputs and outputs.
- **moreSatoshisNeeded**
  - Shortfall on total satoshis required to fund transactions after net of required inputs and outputs.

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

- **key**
  - The invalid public key that caused the error.
- **environment**
  - Optional environment flag to control whether the key is included in the message.

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
  signer: sdk.WalletSigner
  services?: sdk.WalletServices
  monitor?: WalletMonitor
  beef: BeefParty
  trustSelf?: sdk.TrustSelf
  storageParty: string
  userParty: string
  isLogging: boolean
  constructor(signer: sdk.WalletSigner, keyDeriver?: sdk.KeyDeriverApi, services?: sdk.WalletServices, monitor?: WalletMonitor)
  startLog(
    vargs: {
      log?: string
    },
    name: string
  )
  endLog(
    vargs: {
      log?: string
    },
    name: string
  )
  getServices(): sdk.WalletServices
  getKnownTxids(newKnownTxids?: string[]): string[]
  async listActions(args: sdk.ListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  async listOutputs(args: sdk.ListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  async listCertificates(args: sdk.ListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult>
  async acquireCertificate(args: sdk.AcquireCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult>
  async relinquishCertificate(args: sdk.RelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
  async proveCertificate(args: sdk.ProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
  async discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  async discoverByAttributes(args: sdk.DiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  async createAction(args: sdk.CreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
  async signAction(args: sdk.SignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>
  async abortAction(args: sdk.AbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  async internalizeAction(args: sdk.InternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  async relinquishOutput(args: sdk.RelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult>
  async isAuthenticated(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AuthenticatedResult>
  async waitForAuthentication(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AuthenticatedResult>
  async getHeight(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetHeightResult>
  async getHeaderForHeight(args: sdk.GetHeaderArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetHeaderResult>
  async getNetwork(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetNetworkResult>
  async getVersion(args: {}, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.GetVersionResult>
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [AuthenticatedResult](#interface-authenticatedresult), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [GetHeaderArgs](#interface-getheaderargs), [GetHeaderResult](#interface-getheaderresult), [GetHeightResult](#interface-getheightresult), [GetNetworkResult](#interface-getnetworkresult), [GetVersionResult](#interface-getversionresult), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriverApi](#interface-keyderiverapi), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputArgs](#interface-relinquishoutputargs), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [TrustSelf](#type-trustself), [WalletCrypto](#class-walletcrypto), [WalletMonitor](#class-walletmonitor), [WalletServices](#class-walletservices), [WalletSigner](#class-walletsigner)

<details>

<summary>Class Wallet Details</summary>

##### Method getKnownTxids

```ts
getKnownTxids(newKnownTxids?: string[]): string[]
```

Returns

the full list of txids whose validity this wallet claims to know.

Argument Details

- **newKnownTxids**
  - Optional. Additional new txids known to be valid by the caller to be merged.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Class: WalletCrypto

WalletCrypto implements single-keyring wallet cryptography functions,
operating without context about whether its configured keyring is privileged.

```ts
export class WalletCrypto implements WalletCryptoObject {
  keyDeriver: KeyDeriverApi
  constructor(keyDeriver: KeyDeriverApi | PrivateKey)
  async getIdentityKey(originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
    publicKey: PubKeyHex
  }>
  async getPublicKey(
    args: GetPublicKeyArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
    publicKey: PubKeyHex
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
identifier after the 'WERR*' prefix. e.g. 'WERR_FOO*' as the prefix for Foo package error
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

#### Class: WalletMonitor

Background task to make sure transactions are processed, transaction proofs are received and propagated,
and potentially that reorgs update proofs that were already received.

```ts
export class WalletMonitor {
  static createDefaultWalletMonitorOptions(chain: sdk.Chain, storage: WalletStorage, services?: WalletServices): WalletMonitorOptions
  options: WalletMonitorOptions
  services: WalletServices
  chain: sdk.Chain
  storage: WalletStorage
  chaintracks: ChaintracksClientApi
  constructor(options: WalletMonitorOptions)
  oneSecond = 1000
  oneMinute = 60 * this.oneSecond
  oneHour = 60 * this.oneMinute
  oneDay = 24 * this.oneHour
  oneWeek = 7 * this.oneDay
  _tasks: WalletMonitorTask[] = []
  _otherTasks: WalletMonitorTask[] = []
  _tasksRunning = false
  addAllTasksToOther(): void
  addDefaultTasks(): void
  addMultiUserTasks(): void
  addTask(task: WalletMonitorTask): void
  removeTask(name: string): void
  async setupChaintracksListeners(): Promise<void>
  async runTask(name: string): Promise<void>
  async startTasks(): Promise<void>
  stopTasks(): void
  async confirmSpendableOutputs(): Promise<{
    invalidSpendableOutputs: table.Output[]
  }>
  async processProvenTxReqs(): Promise<void>
  async processUnsent(reqApis: table.ProvenTxReq[], indent = 0): Promise<string>
  lastNewHeader: BlockHeader | undefined
  lastNewHeaderWhen: Date | undefined
  processNewBlockHeader(header: BlockHeader): void
  processReorg(depth: number, oldTip: BlockHeader, newTip: BlockHeader): void
  async getProofs(
    reqs: table.ProvenTxReq[],
    indent = 0,
    countsAsAttempt = false,
    ignoreStatus = false
  ): Promise<{
    proven: table.ProvenTxReq[]
    invalid: table.ProvenTxReq[]
    log: string
  }>
  async notifyOfProvenTx(
    reqs: table.ProvenTxReq[],
    indent = 0
  ): Promise<{
    notified: table.ProvenTxReq[]
    log: string
  }>
  async reviewTransactionAmounts()
  async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef>
  async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken): Promise<bsv.Beef | undefined>
  async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken): Promise<void>
  async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult>
}
```

See also: [Chain](#type-chain), [PostReqsToNetworkResult](#interface-postreqstonetworkresult), [TrustSelf](#type-trustself), [TrxToken](#interface-trxtoken), [WalletMonitorOptions](#interface-walletmonitoroptions), [WalletMonitorTask](#class-walletmonitortask), [WalletServices](#class-walletservices), [WalletStorage](#interface-walletstorage)

<details>

<summary>Class WalletMonitor Details</summary>

##### Property \_otherTasks

\_otherTasks can be run by runTask but not by scheduler.

```ts
_otherTasks: WalletMonitorTask[] = []
```

See also: [WalletMonitorTask](#class-walletmonitortask)

##### Property \_tasks

\_tasks are typically run by the scheduler but may also be run by runTask.

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

##### Method attemptToPostReqsToNetwork

Attempt to post one or more `ProvenTxReq` with status 'unsent'
to the bitcoin network.

```ts
async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult>
```

See also: [PostReqsToNetworkResult](#interface-postreqstonetworkresult), [TrxToken](#interface-trxtoken)

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

##### Method notifyOfProvenTx

Process an array of 'notifying' status table.ProvenTxReq

notifying: proven_txs record added, while notifications are being processed.

When a proof is received for a transaction, make the following updates:

1. Set the provenTxId column
2. Set the proof column to a stringified copy of the proof in standard form until no longer needed.
3. Set unconfirmedInputChainLength to zero
4. Set truncatedExternalInputs to '' (why not null?)
5. Set rawTx to null when clients access through provenTxId instead...

Finally set the req status to 'completed' which will clean up the record after a period of time.

```ts
async notifyOfProvenTx(reqs: table.ProvenTxReq[], indent = 0): Promise<{
    notified: table.ProvenTxReq[];
    log: string;
}>
```

##### Method processNewBlockHeader

Process new chain header event received from Chaintracks

Kicks processing 'unconfirmed' and 'unmined' request processing.

```ts
processNewBlockHeader(header: BlockHeader): void
```

##### Method processProvenTxReqs

Using an array of proof providing services, attempt to process each outstanding record
in storage's `proven_tx_reqs` table.

Must manage switching services when a service goes down,
and when a service imposes rate limits,
and when a proof is not yet available,
and when a request is invalid,
and maintain history of attempts,
and report / handle overloads,
and notifiy relevant parties when successful.

Updates history, attempts, status

```ts
async processProvenTxReqs(): Promise<void>
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

##### Method reviewTransactionAmounts

Review all completed transactions to confirm that the transaction satoshis makes sense based on undestood data protocols:

Balance displayed by MetaNet Client is sum of owned spendable outputs IN THE 'default' BASKET.
It is NOT the sum of completed transaction satoshiss for userId.
Transaction satoshis value appears to be critical in capturing external value effect (inputs and outputs) of each transaction.
Transaction isOutgoing seems to be incorrect sometimes???
Output 'change' column appears to be unused, always 0. Instead 'purpose' = 'change' appears to be used. Actual value is either 'change' or null currently.
Output 'providedBy' column is currently only 'storage', 'you', or null.
Output 'tracked' ????
Output 'senderIdentityKey' is currently often an uncompressed key

A standard funding account from satoshi shopper adds 'purpose' = 'change' outputs

Relevant schema columns and conventions:

- owned outputs: outputs where output.userId = transaction.userId
- commission: commissions where commission.transactionId = transaction.transactionId, there is no outputs record for commissions, max one per transaction(?)
- owned input: owned output where output.transactionId != transaction.transactionId, marked by redeemedOutputs in truncatedExternalInputs when under construction and then by outputs.spentBy column when completed???
- Case 1: Normal Spend
  satoshis = -(input - mychange)
  spent = owned outputs with purpose null or != 'change'
  txIn = sum of output.spentBy = transactionId, output.userId = userId outputs
  txOut = sum of new owned outputs (change) + sum
  transaction inputs are all owned outputs, all new owned outputs are marked purpose = 'change'

select txid, transactionId, satoshis, input, spent, mychange, commission, (input - spent - mychange - commission) as fee, if(-satoshis = input - mychange, 'ok', "???") as F
from
(select
ifnull((select sum(o.satoshis) from outputs as o where o.spentBy = t.transactionId), 0) as 'input',
ifnull((select sum(o.satoshis) from outputs as o where o.transactionId = t.transactionId and (purpose != 'change' or purpose is null)), 0) as 'spent',
ifnull((select sum(o.satoshis) from outputs as o where o.transactionId = t.transactionId and purpose = 'change'), 0) as 'mychange',
ifnull((select sum(c.satoshis) from commissions as c where c.transactionId = t.transactionId), 0) as 'commission',
t.transactionId, t.satoshis, t.txid from transactions as t where t.userId = 213 and t.status = 'completed' and isOutgoing = 1 order by transactionId) as vals
;

THIS IS A WORK IN PROGRESS, PARTS ARE KNOWN TO BE INACCURATE

```ts
async reviewTransactionAmounts()
```

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

Tasks may use the watchman_events table to persist their execution history.
This is done by accessing the wathman.storage object.

```ts
export abstract class WalletMonitorTask {
    lastRunMsecsSinceEpoch = 0;
    storage: WalletStorage;
    constructor(public monitor: WalletMonitor, public name: string)
    async asyncSetup(): Promise<void>
    abstract trigger(nowMsecsSinceEpoch: number): {
        run: boolean;
    };
    abstract runTask(): Promise<void>;
}
```

See also: [WalletMonitor](#class-walletmonitor), [WalletStorage](#interface-walletstorage)

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

#### Class: WalletServices

```ts
export class WalletServices implements sdk.WalletServices {
  static createDefaultOptions(chain: sdk.Chain): sdk.WalletServicesOptions
  options: sdk.WalletServicesOptions
  getMerklePathServices: ServiceCollection<sdk.GetMerklePathService>
  getRawTxServices: ServiceCollection<sdk.GetRawTxService>
  postTxsServices: ServiceCollection<sdk.PostTxsService>
  postBeefServices: ServiceCollection<sdk.PostBeefService>
  getUtxoStatusServices: ServiceCollection<sdk.GetUtxoStatusService>
  updateFiatExchangeRateServices: ServiceCollection<sdk.UpdateFiatExchangeRateService>
  chain: sdk.Chain
  constructor(optionsOrChain: sdk.Chain | sdk.WalletServicesOptions)
  async getChainTracker(): Promise<bsv.ChainTracker>
  async getBsvExchangeRate(): Promise<number>
  async getFiatExchangeRate(currency: 'USD' | 'GBP' | 'EUR', base?: 'USD' | 'GBP' | 'EUR'): Promise<number>
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
  targetCurrencies = ['USD', 'GBP', 'EUR']
  async updateFiatExchangeRates(rates?: sdk.FiatExchangeRates, updateMsecs?: number): Promise<sdk.FiatExchangeRates>
}
```

See also: [BlockHeaderHex](#interface-blockheaderhex), [Chain](#type-chain), [FiatExchangeRates](#interface-fiatexchangerates), [GetMerklePathResult](#interface-getmerklepathresult), [GetMerklePathService](#type-getmerklepathservice), [GetRawTxResult](#interface-getrawtxresult), [GetRawTxService](#type-getrawtxservice), [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat), [GetUtxoStatusResult](#interface-getutxostatusresult), [GetUtxoStatusService](#type-getutxostatusservice), [PostBeefResult](#interface-postbeefresult), [PostBeefService](#type-postbeefservice), [PostTxsResult](#interface-posttxsresult), [PostTxsService](#type-posttxsservice), [ServiceCollection](#class-servicecollection), [UpdateFiatExchangeRateService](#type-updatefiatexchangerateservice), [WalletServicesOptions](#interface-walletservicesoptions)

<details>

<summary>Class WalletServices Details</summary>

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

#### Class: WalletSigner

```ts
export class WalletSigner implements sdk.WalletSigner {
  chain: sdk.Chain
  keyDeriver: sdk.KeyDeriverApi
  storage: sdk.WalletStorage
  storageIdentity: sdk.StorageIdentity
  _services?: sdk.WalletServices
  _isAuthenticated: boolean
  _isStorageAvailable: boolean
  _user?: table.User
  pendingSignActions: Record<string, PendingSignAction>
  constructor(chain: sdk.Chain, keyDeriver: sdk.KeyDeriver, storage: WalletStorage)
  setServices(v: sdk.WalletServices)
  getServices(): sdk.WalletServices
  getClientChangeKeyPair(): sdk.KeyPair
  isAuthenticated(): boolean
  async getChain(): Promise<sdk.Chain>
  async getUserId(): Promise<number>
  async authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>
  async verifyStorageAvailable(): Promise<void>
  async waitForStorageAccessMode(mode: 'singleUser' | 'multiUser' | 'sync'): Promise<void>
  async listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  async listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult>
  async abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  async createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
  async signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>
  async internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  async relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult>
  async acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult>
  async proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
  async relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
  async discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  async discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
}
```

See also: [AbortActionResult](#interface-abortactionresult), [AcquireCertificateResult](#interface-acquirecertificateresult), [Chain](#type-chain), [CreateActionResult](#interface-createactionresult), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [InternalizeActionResult](#interface-internalizeactionresult), [KeyDeriver](#class-keyderiver), [KeyDeriverApi](#interface-keyderiverapi), [KeyPair](#interface-keypair), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PendingSignAction](#interface-pendingsignaction), [ProveCertificateResult](#interface-provecertificateresult), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [RelinquishOutputResult](#interface-relinquishoutputresult), [SignActionResult](#interface-signactionresult), [StorageIdentity](#interface-storageidentity), [ValidAbortActionArgs](#interface-validabortactionargs), [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs), [ValidCreateActionArgs](#interface-validcreateactionargs), [ValidDiscoverByAttributesArgs](#interface-validdiscoverbyattributesargs), [ValidDiscoverByIdentityKeyArgs](#interface-validdiscoverbyidentitykeyargs), [ValidInternalizeActionArgs](#interface-validinternalizeactionargs), [ValidListActionsArgs](#interface-validlistactionsargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs), [ValidListOutputsArgs](#interface-validlistoutputsargs), [ValidProveCertificateArgs](#interface-validprovecertificateargs), [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs), [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs), [ValidSignActionArgs](#interface-validsignactionargs), [WalletServices](#class-walletservices), [WalletStorage](#interface-walletstorage), [createActionSdk](#function-createactionsdk), [internalizeActionSdk](#function-internalizeactionsdk), [proveCertificateSdk](#function-provecertificatesdk), [relinquishCertificateSdk](#function-relinquishcertificatesdk), [relinquishOutputSdk](#function-relinquishoutputsdk)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Functions

|                                                                                    |                                                                                        |                                                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [acquireDirectCertificateSdk](#function-acquiredirectcertificatesdk)               | [optionalArraysEqual](#function-optionalarraysequal)                                   | [validateInternalizeActionArgs](#function-validateinternalizeactionargs)         |
| [arraysEqual](#function-arraysequal)                                               | [parseWalletOutpoint](#function-parsewalletoutpoint)                                   | [validateInternalizeOutput](#function-validateinternalizeoutput)                 |
| [asArray](#function-asarray)                                                       | [postBeefToArcMiner](#function-postbeeftoarcminer)                                     | [validateListActionsArgs](#function-validatelistactionsargs)                     |
| [asBsvSdkPrivateKey](#function-asbsvsdkprivatekey)                                 | [postBeefToTaalArcMiner](#function-postbeeftotaalarcminer)                             | [validateListCertificatesArgs](#function-validatelistcertificatesargs)           |
| [asBsvSdkPublickKey](#function-asbsvsdkpublickkey)                                 | [postTxsToTaalArcMiner](#function-posttxstotaalarcminer)                               | [validateListOutputsArgs](#function-validatelistoutputsargs)                     |
| [asBsvSdkScript](#function-asbsvsdkscript)                                         | [processActionSdk](#function-processactionsdk)                                         | [validateOptionalInteger](#function-validateoptionalinteger)                     |
| [asBsvSdkTx](#function-asbsvsdktx)                                                 | [proveCertificateSdk](#function-provecertificatesdk)                                   | [validateOptionalOutpointString](#function-validateoptionaloutpointstring)       |
| [asBuffer](#function-asbuffer)                                                     | [randomBytes](#function-randombytes)                                                   | [validateOriginator](#function-validateoriginator)                               |
| [asString](#function-asstring)                                                     | [randomBytesBase64](#function-randombytesbase64)                                       | [validateOutpointString](#function-validateoutpointstring)                       |
| [completeSignedTransaction](#function-completesignedtransaction)                   | [randomBytesHex](#function-randombyteshex)                                             | [validatePositiveIntegerOrZero](#function-validatepositiveintegerorzero)         |
| [convertProofToMerklePath](#function-convertprooftomerklepath)                     | [relinquishCertificateSdk](#function-relinquishcertificatesdk)                         | [validateProveCertificateArgs](#function-validateprovecertificateargs)           |
| [createActionSdk](#function-createactionsdk)                                       | [relinquishOutputSdk](#function-relinquishoutputsdk)                                   | [validateRelinquishCertificateArgs](#function-validaterelinquishcertificateargs) |
| [createDefaultWalletServicesOptions](#function-createdefaultwalletservicesoptions) | [sha256Hash](#function-sha256hash)                                                     | [validateRelinquishOutputArgs](#function-validaterelinquishoutputargs)           |
| [deserializeTscMerkleProofNodes](#function-deserializetscmerkleproofnodes)         | [stampLog](#function-stamplog)                                                         | [validateSatoshis](#function-validatesatoshis)                                   |
| [doubleSha256BE](#function-doublesha256be)                                         | [stampLogFormat](#function-stamplogformat)                                             | [validateScriptHash](#function-validatescripthash)                               |
| [doubleSha256HashLE](#function-doublesha256hashle)                                 | [toBinaryBaseBlockHeaderHex](#function-tobinarybaseblockheaderhex)                     | [validateSecondsSinceEpoch](#function-validatesecondssinceepoch)                 |
| [getExchangeRatesIo](#function-getexchangeratesio)                                 | [toWalletNetwork](#function-towalletnetwork)                                           | [validateSignActionArgs](#function-validatesignactionargs)                       |
| [getMerklePathFromTaalARC](#function-getmerklepathfromtaalarc)                     | [updateBsvExchangeRate](#function-updatebsvexchangerate)                               | [validateSignActionOptions](#function-validatesignactionoptions)                 |
| [getMerklePathFromWhatsOnChainTsc](#function-getmerklepathfromwhatsonchaintsc)     | [updateChaintracksFiatExchangeRates](#function-updatechaintracksfiatexchangerates)     | [validateStringLength](#function-validatestringlength)                           |
| [getRawTxFromWhatsOnChain](#function-getrawtxfromwhatsonchain)                     | [updateExchangeratesapi](#function-updateexchangeratesapi)                             | [validateWalletPayment](#function-validatewalletpayment)                         |
| [getTaalArcServiceConfig](#function-gettaalarcserviceconfig)                       | [validateAbortActionArgs](#function-validateabortactionargs)                           | [verifyHexString](#function-verifyhexstring)                                     |
| [getUtxoStatusFromWhatsOnChain](#function-getutxostatusfromwhatsonchain)           | [validateAcquireCertificateArgs](#function-validateacquirecertificateargs)             | [verifyId](#function-verifyid)                                                   |
| [internalizeActionSdk](#function-internalizeactionsdk)                             | [validateAcquireDirectCertificateArgs](#function-validateacquiredirectcertificateargs) | [verifyInteger](#function-verifyinteger)                                         |
| [isHexString](#function-ishexstring)                                               | [validateBasketInsertion](#function-validatebasketinsertion)                           | [verifyNumber](#function-verifynumber)                                           |
| [makeAtomicBeef](#function-makeatomicbeef)                                         | [validateCreateActionArgs](#function-validatecreateactionargs)                         | [verifyOne](#function-verifyone)                                                 |
| [makeErrorResult](#function-makeerrorresult)                                       | [validateCreateActionInput](#function-validatecreateactioninput)                       | [verifyOneOrNone](#function-verifyoneornone)                                     |
| [makeGetMerklePathFromTaalARC](#function-makegetmerklepathfromtaalarc)             | [validateCreateActionOptions](#function-validatecreateactionoptions)                   | [verifyOptionalHexString](#function-verifyoptionalhexstring)                     |
| [makePostBeefResult](#function-makepostbeefresult)                                 | [validateCreateActionOutput](#function-validatecreateactionoutput)                     | [verifyTruthy](#function-verifytruthy)                                           |
| [makePostBeefToTaalARC](#function-makepostbeeftotaalarc)                           | [validateDiscoverByAttributesArgs](#function-validatediscoverbyattributesargs)         | [wait](#function-wait)                                                           |
| [makePostTxsToTaalARC](#function-makeposttxstotaalarc)                             | [validateDiscoverByIdentityKeyArgs](#function-validatediscoverbyidentitykeyargs)       |                                                                                  |
| [maxDate](#function-maxdate)                                                       | [validateInteger](#function-validateinteger)                                           |                                                                                  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: acquireDirectCertificateSdk

```ts
export async function acquireDirectCertificateSdk(signer: WalletSigner, vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AcquireCertificateResult>
```

See also: [AcquireCertificateResult](#interface-acquirecertificateresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ValidAcquireDirectCertificateArgs](#interface-validacquiredirectcertificateargs), [WalletSigner](#class-walletsigner)

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

- **privKey**
  - bitcoin private key in 32 byte hex string form

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

- **pubKey**
  - bitcoin public key in standard compressed key hex string form

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: asBsvSdkScript

Coerce a bsv script encoded as a hex string, serialized Buffer, or Script to Script
If script is already a Script, just return it.

```ts
export function asBsvSdkScript(script: sdk.HexString | number[] | Script): Script {
  if (Array.isArray(script)) {
    script = Script.fromBinary(script)
  } else if (typeof script === 'string') {
    script = Script.fromHex(script)
  }
  return script
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
    tx = Transaction.fromBinary(tx)
  } else if (typeof tx === 'string') {
    tx = Transaction.fromHex(tx)
  }
  return tx
}
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: asBuffer

Coerce a value to Buffer if currently encoded as a string or

```ts
export function asBuffer(val: Buffer | string | number[], encoding?: BufferEncoding): Buffer {
  let b: Buffer
  if (Buffer.isBuffer(val)) b = val
  else if (typeof val === 'string') b = Buffer.from(val, encoding ?? 'hex')
  else b = Buffer.from(val)
  return b
}
```

<details>

<summary>Function asBuffer Details</summary>

Returns

input val if it is a Buffer or new Buffer from string val

Argument Details

- **val**
  - Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
- **encoding**
  - defaults to 'hex'. Only applies to val of type string

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: asString

Coerce a value to an encoded string if currently a Buffer or number[]

```ts
export function asString(val: Buffer | string | number[], encoding?: BufferEncoding): string {
  if (Array.isArray(val)) val = Buffer.from(val)
  return Buffer.isBuffer(val) ? val.toString(encoding ?? 'hex') : val
}
```

<details>

<summary>Function asString Details</summary>

Returns

input val if it is a string; or if number[], first converted to Buffer then as Buffer; if Buffer encoded using `encoding`

Argument Details

- **val**
  - Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
- **encoding**
  - defaults to 'hex'

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: completeSignedTransaction

```ts
export async function completeSignedTransaction(prior: PendingSignAction, spends: Record<number, sdk.SignActionSpend>, signer: WalletSigner): Promise<Transaction>
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

#### Function: createActionSdk

```ts
export async function createActionSdk(signer: WalletSigner, vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
```

See also: [CreateActionResult](#interface-createactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ValidCreateActionArgs](#interface-validcreateactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: createDefaultWalletServicesOptions

```ts
export function createDefaultWalletServicesOptions(chain: sdk.Chain): sdk.WalletServicesOptions
```

See also: [Chain](#type-chain), [WalletServicesOptions](#interface-walletservicesoptions)

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
  return doubleSha256HashLE(data).reverse()
}
```

See also: [doubleSha256HashLE](#function-doublesha256hashle)

<details>

<summary>Function doubleSha256BE Details</summary>

Returns

reversed (big-endian) double sha256 hash of data, byte 31 of hash first.

Argument Details

- **data**
  - is an array of bytes.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: doubleSha256HashLE

Calculate the SHA256 hash of the SHA256 hash of an array of bytes.

```ts
export function doubleSha256HashLE(data: number[]): number[] {
  const first = new Hash.SHA256().update(data).digest()
  const second = new Hash.SHA256().update(first).digest()
  return second
}
```

<details>

<summary>Function doubleSha256HashLE Details</summary>

Returns

double sha256 hash of data, byte 0 of hash first.

Argument Details

- **data**
  - an array of bytes

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

See also: [ArcServiceConfig](#interface-arcserviceconfig), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#class-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: getMerklePathFromWhatsOnChainTsc

WhatOnChain.com has their own "hash/pos/R/L" proof format and a more TSC compliant proof format.

The "/proof/tsc" endpoint is much closer to the TSC specification. It provides "index" directly and each node is just the provided hash value.
The "targetType" is unspecified and thus defaults to block header hash, requiring a Chaintracks lookup to get the merkleRoot...
Duplicate hash values are provided in full instead of being replaced by "\*".

```ts
export async function getMerklePathFromWhatsOnChainTsc(txid: string, chain: sdk.Chain, services: sdk.WalletServices): Promise<sdk.GetMerklePathResult>
```

See also: [Chain](#type-chain), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#class-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: getRawTxFromWhatsOnChain

```ts
export async function getRawTxFromWhatsOnChain(txid: string, chain: sdk.Chain): Promise<sdk.GetRawTxResult>
```

See also: [Chain](#type-chain), [GetRawTxResult](#interface-getrawtxresult)

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

#### Function: internalizeActionSdk

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
export async function internalizeActionSdk(signer: WalletSigner, vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
```

See also: [InternalizeActionResult](#interface-internalizeactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ValidInternalizeActionArgs](#interface-validinternalizeactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: isHexString

```ts
export function isHexString(s: string): boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: makeAtomicBeef

```ts
export function makeAtomicBeef(tx: Transaction, beef: number[] | Beef): number[]
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

#### Function: optionalArraysEqual

```ts
export function optionalArraysEqual(arr1?: Number[], arr2?: Number[])
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: parseWalletOutpoint

```ts
export function parseWalletOutpoint(outpoint: string): {
  txid: string
  vout: number
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

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostBeefResult](#interface-postbeefresult), [WalletServices](#class-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: postTxsToTaalArcMiner

```ts
export async function postTxsToTaalArcMiner(beef: bsv.Beef, txids: string[], config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.PostTxsResult>
```

See also: [ArcServiceConfig](#interface-arcserviceconfig), [PostTxsResult](#interface-posttxsresult), [WalletServices](#class-walletservices)

<details>

<summary>Function postTxsToTaalArcMiner Details</summary>

Argument Details

- **txs**
  - All transactions must have source transactions. Will just source locking scripts and satoshis do?? toHexEF() is used.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: processActionSdk

```ts
export async function processActionSdk(prior: PendingSignAction | undefined, signer: WalletSigner, args: sdk.ValidProcessActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SendWithResult[] | undefined>
```

See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PendingSignAction](#interface-pendingsignaction), [SendWithResult](#interface-sendwithresult), [ValidProcessActionArgs](#interface-validprocessactionargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: proveCertificateSdk

```ts
export async function proveCertificateSdk(signer: WalletSigner, vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
```

See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateResult](#interface-provecertificateresult), [ValidProveCertificateArgs](#interface-validprovecertificateargs), [WalletSigner](#class-walletsigner)

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

#### Function: relinquishCertificateSdk

```ts
export async function relinquishCertificateSdk(signer: WalletSigner, vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
```

See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RelinquishCertificateResult](#interface-relinquishcertificateresult), [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: relinquishOutputSdk

Relinquish Output removes an output from a specified basket without spending it, effectively stopping its tracking in the system. The function takes arguments specifying the basket name and the output to be removed, along with an optional originator parameter representing the fully-qualified domain name (FQDN) of the originating application. Upon successful execution, it returns a promise resolving to an object indicating successful removal. If the operation fails, an error object is returned. This function is essential for managing and updating the state of outputs within baskets efficiently.

```ts
export async function relinquishOutputSdk(signer: WalletSigner, vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishOutputResult>
```

See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RelinquishOutputResult](#interface-relinquishoutputresult), [ValidRelinquishOutputArgs](#interface-validrelinquishoutputargs), [WalletSigner](#class-walletsigner)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: sha256Hash

Calculate the SHA256 hash of an array of bytes

```ts
export function sha256Hash(data: number[]): number[] {
  const first = new Hash.SHA256().update(data).digest()
  return first
}
```

<details>

<summary>Function sha256Hash Details</summary>

Returns

sha256 hash of buffer contents.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: stampLog

If a log is being kept, add a time stamped line.

```ts
export function stampLog(
  log:
    | string
    | undefined
    | {
        log?: string
      },
  lineToAdd: string
): string | undefined
```

<details>

<summary>Function stampLog Details</summary>

Returns

undefined or log extended by time stamped `lineToAdd` and new line.

Argument Details

- **log**
  - Optional time stamped log to extend, or an object with a log property to update
- **lineToAdd**
  - Content to add to line.

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

- **log**
  - Each logged event starts with ISO time stamp, space, rest of line, terminated by `\n`.

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
  const writer = new bsv.Utils.Writer()
  writer.writeUInt32BE(header.version)
  writer.writeReverse(asArray(header.previousHash))
  writer.writeReverse(asArray(header.merkleRoot))
  writer.writeUInt32BE(header.time)
  writer.writeUInt32BE(header.bits)
  writer.writeUInt32BE(header.nonce)
  const r = writer.toArray()
  return r
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

- **subject**
  - Must be valid for "direct" `acquisitionProtocol`. public key of the certificate subject.

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
export function validateListActionsArgs(args: sdk.ListActionsArgs): ValidListActionsArgs
```

See also: [ListActionsArgs](#interface-listactionsargs), [ValidListActionsArgs](#interface-validlistactionsargs)

<details>

<summary>Function validateListActionsArgs Details</summary>

Argument Details

- **args.labels**
  - An array of labels used to filter actions.
- **args.labelQueryMode**
  - Optional. Specifies how to match labels (default is any which matches any of the labels).
- **args.includeLabels**
  - Optional. Whether to include transaction labels in the result set.
- **args.includeInputs**
  - Optional. Whether to include input details in the result set.
- **args.includeInputSourceLockingScripts**
  - Optional. Whether to include input source locking scripts in the result set.
- **args.includeInputUnlockingScripts**
  - Optional. Whether to include input unlocking scripts in the result set.
- **args.includeOutputs**
  - Optional. Whether to include output details in the result set.
- **args.includeOutputLockingScripts**
  - Optional. Whether to include output locking scripts in the result set.
- **args.limit**
  - Optional. The maximum number of transactions to retrieve.
- **args.offset**
  - Optional. Number of transactions to skip before starting to return the results.
- **args.seekPermission**
  - — Optional. Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: validateListCertificatesArgs

```ts
export function validateListCertificatesArgs(args: sdk.ListCertificatesArgs): ValidListCertificatesArgs
```

See also: [ListCertificatesArgs](#interface-listcertificatesargs), [ValidListCertificatesArgs](#interface-validlistcertificatesargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: validateListOutputsArgs

```ts
export function validateListOutputsArgs(args: sdk.ListOutputsArgs): ValidListOutputsArgs
```

See also: [ListOutputsArgs](#interface-listoutputsargs), [ValidListOutputsArgs](#interface-validlistoutputsargs)

<details>

<summary>Function validateListOutputsArgs Details</summary>

Argument Details

- **args.basket**
  - Required. The associated basket name whose outputs should be listed.
- **args.tags**
  - Optional. Filter outputs based on these tags.
- **args.tagQueryMode**
  - Optional. Filter mode, defining whether all or any of the tags must match. By default, any tag can match.
- **args.include**
  - Optional. Whether to include locking scripts (with each output) or entire transactions (as aggregated BEEF, at the top level) in the result. By default, unless specified, neither are returned.
- **args.includeEntireTransactions**
  - Optional. Whether to include the entire transaction(s) in the result.
- **args.includeCustomInstructions**
  - Optional. Whether custom instructions should be returned in the result.
- **args.includeTags**
  - Optional. Whether the tags associated with the output should be returned.
- **args.includeLabels**
  - Optional. Whether the labels associated with the transaction containing the output should be returned.
- **args.limit**
  - Optional limit on the number of outputs to return.
- **args.offset**
  - Optional. Number of outputs to skip before starting to return results.
- **args.seekPermission**
  - — Optional. Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.

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
export function validateRelinquishCertificateArgs(args: sdk.RelinquishCertificateArgs): ValidRelinquishCertificateArgs
```

See also: [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [ValidRelinquishCertificateArgs](#interface-validrelinquishcertificateargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Function: validateRelinquishOutputArgs

```ts
export function validateRelinquishOutputArgs(args: sdk.RelinquishOutputArgs): ValidRelinquishOutputArgs
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
export function verifyOneOrNone<T>(results: T[]): T | undefined
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
  return new Promise(resolve => setTimeout(resolve, msecs))
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Types

|                                                                                |                                                                                          |                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [AcquisitionProtocol](#type-acquisitionprotocol)                               | [GetRawTxService](#type-getrawtxservice)                                                 | [ProtocolString5To400Bytes](#type-protocolstring5to400bytes)         |
| [ActionStatus](#type-actionstatus)                                             | [GetUtxoStatusOutputFormat](#type-getutxostatusoutputformat)                             | [ProvenTxReqStatus](#type-proventxreqstatus)                         |
| [AtomicBEEF](#type-atomicbeef)                                                 | [GetUtxoStatusService](#type-getutxostatusservice)                                       | [PubKeyHex](#type-pubkeyhex)                                         |
| [BEEF](#type-beef)                                                             | [HexString](#type-hexstring)                                                             | [SatoshiValue](#type-satoshivalue)                                   |
| [Base64String](#type-base64string)                                             | [ISOTimestampString](#type-isotimestampstring)                                           | [SendWithResultStatus](#type-sendwithresultstatus)                   |
| [BasketStringUnder300Bytes](#type-basketstringunder300bytes)                   | [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes)                               | [StorageProvidedBy](#type-storageprovidedby)                         |
| [BooleanDefaultFalse](#type-booleandefaultfalse)                               | [KeyringRevealer](#type-keyringrevealer)                                                 | [SyncProtocolVersion](#type-syncprotocolversion)                     |
| [BooleanDefaultTrue](#type-booleandefaulttrue)                                 | [LabelStringUnder300Bytes](#type-labelstringunder300bytes)                               | [SyncStatus](#type-syncstatus)                                       |
| [Byte](#type-byte)                                                             | [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes) | [TXIDHexString](#type-txidhexstring)                                 |
| [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes)     | [OutpointString](#type-outpointstring)                                                   | [TransactionStatus](#type-transactionstatus)                         |
| [Chain](#type-chain)                                                           | [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)                       | [TrustSelf](#type-trustself)                                         |
| [Counterparty](#type-counterparty)                                             | [PositiveInteger](#type-positiveinteger)                                                 | [UpdateFiatExchangeRateService](#type-updatefiatexchangerateservice) |
| [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes)               | [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000)               | [VersionString7To30Bytes](#type-versionstring7to30bytes)             |
| [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes)         | [PositiveIntegerMax10](#type-positiveintegermax10)                                       | [WalletCounterparty](#type-walletcounterparty)                       |
| [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes)               | [PositiveIntegerOrZero](#type-positiveintegerorzero)                                     | [WalletNetwork](#type-walletnetwork)                                 |
| [ErrorCodeString10To40Bytes](#type-errorcodestring10to40bytes)                 | [PostBeefService](#type-postbeefservice)                                                 | [WalletProtocol](#type-walletprotocol)                               |
| [ErrorDescriptionString20To200Bytes](#type-errordescriptionstring20to200bytes) | [PostReqsToNetworkDetailsStatus](#type-postreqstonetworkdetailsstatus)                   |                                                                      |
| [GetMerklePathService](#type-getmerklepathservice)                             | [PostTxsService](#type-posttxsservice)                                                   |                                                                      |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: AcquisitionProtocol

```ts
export type AcquisitionProtocol = 'direct' | 'issuance'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: ActionStatus

```ts
export type ActionStatus = 'completed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend' | 'nonfinal'
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
export type Chain = 'main' | 'test'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: Counterparty

```ts
export type Counterparty = PublicKey | PubKeyHex | 'self' | 'anyone'
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

See also: [Chain](#type-chain), [GetMerklePathResult](#interface-getmerklepathresult), [WalletServices](#class-walletservices)

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
export type GetUtxoStatusOutputFormat = 'hashLE' | 'hashBE' | 'script'
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
export type KeyringRevealer = PubKeyHex | 'certifier'
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

See also: [PostBeefResult](#interface-postbeefresult), [WalletServices](#class-walletservices)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: PostReqsToNetworkDetailsStatus

```ts
export type PostReqsToNetworkDetailsStatus = 'success' | 'doubleSpend' | 'unknown'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: PostTxsService

```ts
export type PostTxsService = (beef: bsv.Beef, txids: string[], services: WalletServices) => Promise<PostTxsResult>
```

See also: [PostTxsResult](#interface-posttxsresult), [WalletServices](#class-walletservices)

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
export type ProvenTxReqStatus = 'sending' | 'unsent' | 'nosend' | 'unknown' | 'nonfinal' | 'unprocessed' | 'unmined' | 'callback' | 'unconfirmed' | 'completed' | 'invalid' | 'doubleSpend'
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
export type SendWithResultStatus = 'unproven' | 'sending' | 'failed'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: StorageProvidedBy

```ts
export type StorageProvidedBy = 'you' | 'storage' | 'you-and-storage'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: SyncProtocolVersion

```ts
export type SyncProtocolVersion = '0.1.0'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: SyncStatus

success: Last sync of this user from this dojo was successful.

error: Last sync protocol operation for this user to this dojo threw and error.

identified: Configured sync dojo has been identified but not sync'ed.

unknown: Sync protocol state is unknown.

```ts
export type SyncStatus = 'success' | 'error' | 'identified' | 'updated' | 'unknown'
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
export type TransactionStatus = 'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: TrustSelf

Controls behavior of input BEEF validation.

If `known`, input transactions may omit supporting validity proof data for all TXIDs known to this wallet.

If undefined, input BEEFs must be complete and valid.

```ts
export type TrustSelf = 'known'
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
export type WalletCounterparty = PubKeyHex | 'self' | 'anyone'
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: WalletNetwork

```ts
export type WalletNetwork = 'mainnet' | 'testnet'
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

#### Type: WalletProtocol

```ts
export type WalletProtocol = [0 | 1 | 2, ProtocolString5To400Bytes]
```

See also: [ProtocolString5To400Bytes](#type-protocolstring5to400bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Variables

|                                                                        |
| ---------------------------------------------------------------------- |
| [ProvenTxReqNonTerminalStatus](#variable-proventxreqnonterminalstatus) |
| [ProvenTxReqTerminalStatus](#variable-proventxreqterminalstatus)       |
| [brc29ProtocolID](#variable-brc29protocolid)                           |

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
brc29ProtocolID: sdk.WalletProtocol = [2, '3241645161d8']
```

See also: [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

<!--#endregion ts2md-api-merged-here-->

## License

The license for the code in this repository is the Open BSV License.
