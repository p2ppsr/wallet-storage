import { sdk, table, verifyOne } from "../..";

export class SyncChunk {
    settings: table.Settings
    user: table.User
    outputs: table.Output[] = []
    commissions: table.Commission[] = []
    txs: table.Transaction[] = []
    tags: table.OutputTag[] = []
    txLabels: table.TxLabel[] = []
    baskets: table.OutputBasket[] = []
    certificates: table.Certificate[] = []
    certificateFields: table.CertificateField[] = []
    outputTagMaps: table.OutputTagMap[] = []
    txLabelMaps: table.TxLabelMap[] = []
    provenTxReqs: table.ProvenTxReq[] = []
    provenTxs: table.ProvenTx[] = []

    constructor (s: table.Settings, u: table.User) {
        this.settings = s
        this.user = u
    }

    static async fromSyncReader(reader: sdk.StorageSyncReader, identityKey: string) {

        const settings = await reader.getSettings()
        const user = verifyOne(await reader.findUsers({ identityKey }))

        const c = new SyncChunk(settings, user)

        let offset = 0
        const since = undefined
        const userId = user.userId

        c.outputs = await reader.findOutputs({ userId }, false, since, { limit: 10, offset })

        c.commissions = await reader.findCommissions({ userId }, since, { limit: 10, offset })
        c.txs = await reader.findTransactions({ userId }, undefined, false, since, { limit: 10, offset })
        c.tags = await reader.findOutputTags({ userId }, since, { limit: 10, offset })
        c.txLabels = await reader.findTxLabels({ userId }, since, { limit: 10, offset })
        c.baskets = await reader.findOutputBaskets({ userId }, since, { limit: 10, offset })
        c.certificates = await reader.findCertificates({ userId }, [], [], since, { limit: 10, offset })
        c.certificateFields = await reader.findCertificateFields({ userId }, since, { limit: 10, offset })
        c.outputTagMaps = await reader.getOutputTagMapsForUser(userId, since, { limit: 10, offset })
        c.txLabelMaps = await reader.getTxLabelMapsForUser(userId, since, { limit: 10, offset })
        c.provenTxReqs = await reader.getProvenTxReqsForUser(userId, since, { limit: 10, offset })
        c.provenTxs = await reader.getProvenTxsForUser(userId, since, { limit: 10, offset })
    }
}
