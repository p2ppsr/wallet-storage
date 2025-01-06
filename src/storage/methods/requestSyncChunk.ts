import { sdk, StorageBase, table, verifyOne } from '../..'
export async function requestSyncChunk(storage: sdk.StorageSyncReader, args: sdk.RequestSyncChunkArgs): Promise<sdk.RequestSyncChunkResult> {
    const r: sdk.RequestSyncChunkResult = {}

    let itemCount = args.maxItems
    let roughSize = args.maxRoughSize
    let i = 0
    let done = false

    const user = verifyOne(await storage.findUsers({ partial: { identityKey: args.identityKey } }))

    const addItems = async (a: ChunkerArgs) => {
        if (i >= args.offsets.length) { done = true; return }
        let { offset, name: oname } = args.offsets[i++]
        if (a.name !== oname) throw new sdk.WERR_INVALID_PARAMETER('offsets', `in dependency order. '${a.name}' expected, found ${oname}.`);
        let preAddCalled = false
        for (; !done;) {
            const limit = Math.min(itemCount, Math.max(10, args.maxItems / a.maxDivider))
            if (limit <= 0) break;
            const items = await a.findItems(storage, user.userId, args.since, limit, offset)
            checkEntityValues(items)
            if (!preAddCalled) { a.preAdd(); preAddCalled = true }
            if (items.length === 0) break;
            for (const item of items) {
                offset++
                a.addItem(item)
                itemCount--
                roughSize -= JSON.stringify(item).length
                if (itemCount <= 0 || roughSize < 0) { done = true; break; }
            }
        }
    }

    const chunkers: ChunkerArgs[] = [
        {
            name: 'provenTx', maxDivider: 100, preAdd: () => { r.provenTxs = [] }, addItem: (i: table.ProvenTx) => { r.provenTxs!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.getProvenTxsForUser(userId, since, { limit, offset }) }
        },
        {
            name: 'outputBasket', maxDivider: 1, preAdd: () => { r.outputBaskets = [] }, addItem: (i: table.OutputBasket) => { r.outputBaskets!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findOutputBaskets({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'outputTag', maxDivider: 1, preAdd: () => { r.outputTags = [] }, addItem: (i: table.OutputTag) => { r.outputTags!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findOutputTags({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'txLabel', maxDivider: 1, preAdd: () => { r.txLabels = [] }, addItem: (i: table.TxLabel) => { r.txLabels!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findTxLabels({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'transaction', maxDivider: 25, preAdd: () => { r.transactions = [] }, addItem: (i: table.Transaction) => { r.transactions!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findTransactions({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'output', maxDivider: 25, preAdd: () => { r.outputs = [] }, addItem: (i: table.Output) => { r.outputs!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findOutputs({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'txLabelMap', maxDivider: 1, preAdd: () => { r.txLabelMaps = [] }, addItem: (i: table.TxLabelMap) => { r.txLabelMaps!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.getTxLabelMapsForUser(userId, since, { limit, offset }) }
        },
        {
            name: 'outputTagMap', maxDivider: 1, preAdd: () => { r.outputTagMaps = [] }, addItem: (i: table.OutputTagMap) => { r.outputTagMaps!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.getOutputTagMapsForUser(userId, since, { limit, offset }) }
        },
        {
            name: 'certificate', maxDivider: 25, preAdd: () => { r.certificates = [] }, addItem: (i: table.Certificate) => { r.certificates!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findCertificates({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'certificateField', maxDivider: 25, preAdd: () => { r.certificateFields = [] }, addItem: (i: table.CertificateField) => { r.certificateFields!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findCertificateFields({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'commission', maxDivider: 25, preAdd: () => { r.commissions = [] }, addItem: (i: table.Commission) => { r.commissions!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.findCommissions({ partial: { userId }, since, paged: { limit, offset } }) }
        },
        {
            name: 'provenTxReq', maxDivider: 100, preAdd: () => { r.provenTxReqs = [] }, addItem: (i: table.ProvenTxReq) => { r.provenTxReqs!.push(i) },
            findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) => { return await storage.getProvenTxReqsForUser(userId, since, { limit, offset }) }
        },
    ]

    for (; !done;) {
        for (const c of chunkers) {
            await addItems(c)
        }
    }

    return r
}

type ChunkerArgs = {
        name: string,
        maxDivider: number,
        preAdd: () => void,
        addItem: (i: any) => void,
        findItems: (
            storage: sdk.StorageSyncReader,
            userId: number,
            since: Date | undefined,
            limit: number,
            offset: number
        ) => Promise<any[]>,
}

function checkIsDate(v: any) {
    if (!(v instanceof Date))
        throw new sdk.WERR_INVALID_OPERATION('bad date')
}

function checkEntityValues(es: object[]) {
    for (const e of es) {
        checkIsDate(e['created_at'])
        checkIsDate(e['updated_at'])
        for (const key of Object.keys(e))
            if (e[key] === null)
                throw new sdk.WERR_INVALID_OPERATION()
    }
}