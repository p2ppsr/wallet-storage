import { DBType, sdk, StorageBaseOptions, StorageBaseReader, table, validateSecondsSinceEpoch, verifyId, verifyOne, verifyOneOrNone, verifyTruthy } from "..";
import { requestSyncChunk } from "./methods/requestSyncChunk";

export abstract class StorageBaseReaderWriter extends StorageBaseReader {

    constructor(options: sdk.StorageSyncReaderOptions) {
        super(options)
    }

    abstract dropAllData(): Promise<void>
    abstract migrate(storageName: string): Promise<string>

    abstract findOutputTagMaps(args: sdk.FindOutputTagMapsArgs ): Promise<table.OutputTagMap[]>
    abstract findProvenTxReqs(args: sdk.FindProvenTxReqsArgs ): Promise<table.ProvenTxReq[]>
    abstract findProvenTxs(args: sdk.FindProvenTxsArgs ): Promise<table.ProvenTx[]>
    abstract findTxLabelMaps(args: sdk.FindTxLabelMapsArgs ): Promise<table.TxLabelMap[]>

    abstract countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number>
    abstract countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number>
    abstract countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number>
    abstract countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number>

    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>
    abstract insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>
    abstract insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>

    abstract updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>
    abstract updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>
    abstract updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>
    abstract updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>
    abstract updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>
    abstract updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>
    abstract updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>
    abstract updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>
    abstract updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>

    async findCertificateById(id: number, trx?: sdk.TrxToken) : Promise<table.Certificate| undefined> {
        return verifyOneOrNone(await this.findCertificates({ partial: { certificateId: id }, trx }))
    }
    async findCommissionById(id: number, trx?: sdk.TrxToken) : Promise<table.Commission| undefined> {
        return verifyOneOrNone(await this.findCommissions({ partial: { commissionId: id }, trx }))
    }
    async findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean) : Promise<table.Output| undefined> {
        return verifyOneOrNone(await this.findOutputs({ partial: { outputId: id }, noScript, trx }))
    }
    async findOutputBasketById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputBasket| undefined> {
        return verifyOneOrNone(await this.findOutputBaskets({ partial: { basketId: id }, trx }))
    }
    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx| undefined> {
        return verifyOneOrNone(await this.findProvenTxs({ partial: { provenTxId: id }, trx }))
    }
    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq| undefined> {
        return verifyOneOrNone(await this.findProvenTxReqs({ partial: { provenTxReqId: id }, trx }))
    }
    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState| undefined> {
        return verifyOneOrNone(await this.findSyncStates({ partial: { syncStateId: id }, trx }))
    }
    async findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean) : Promise<table.Transaction| undefined> {
        return verifyOneOrNone(await this.findTransactions({ partial: { transactionId: id }, noRawTx, trx }))
    }
    async findTxLabelById(id: number, trx?: sdk.TrxToken) : Promise<table.TxLabel| undefined> {
        return verifyOneOrNone(await this.findTxLabels({ partial: { txLabelId: id }, trx }))
    }
    async findOutputTagById(id: number, trx?: sdk.TrxToken) : Promise<table.OutputTag| undefined> {
        return verifyOneOrNone(await this.findOutputTags({ partial: { outputTagId: id }, trx }))
    }
    async findUserById(id: number, trx?: sdk.TrxToken) : Promise<table.User| undefined> {
        return verifyOneOrNone(await this.findUsers({ partial: { userId: id }, trx }))
    }

    async findOrInsertUser(identityKey: string, trx?: sdk.TrxToken) : Promise<{ user: table.User, isNew: boolean }> {
        let user: table.User | undefined
        let isNew = false

        for (let retry = 0; ; retry++) {
            try {
                user = verifyOneOrNone(await this.findUsers({ partial: {} , trx }))
                if (user) break;
                user = {
                    created_at: new Date(),
                    updated_at: new Date(),
                    userId: 0,
                    identityKey
                }
                user.userId = await this.insertUser(user, trx)
                isNew = true
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return { user, isNew }
    }

    async findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken)
        : Promise<{ tx: table.Transaction, isNew: boolean }> {
        let tx: table.Transaction | undefined
        let isNew = false

        for (let retry = 0; ; retry++) {
            try {
                tx = verifyOneOrNone(await this.findTransactions({ partial: { userId: newTx.userId, txid: newTx.txid }, trx }))
                if (tx) break;
                newTx.transactionId = await this.insertTransaction(newTx, trx)
                isNew = true
                tx = newTx
                break;
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }

        return { tx, isNew }
    }


    async findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket> {
        const partial = { name, userId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let basket = verifyOneOrNone(await this.findOutputBaskets({ partial, trx }))
                if (!basket) {
                    basket = { ...partial, minimumDesiredUTXOValue: 0, numberOfDesiredUTXOs: 0, basketId: 0, created_at: now, updated_at: now, isDeleted: false }
                    basket.basketId = await this.insertOutputBasket(basket, trx)
                }
                if (basket.isDeleted) {
                    await this.updateOutputBasket(verifyId(basket.basketId), { isDeleted: false })
                }
                return basket
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel> {
        const partial = { label, userId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let txLabel = verifyOneOrNone(await this.findTxLabels({ partial, trx }))
                if (!txLabel) {
                    txLabel = { ...partial, txLabelId: 0, created_at: now, updated_at: now, isDeleted: false }
                    txLabel.txLabelId = await this.insertTxLabel(txLabel, trx)
                }
                if (txLabel.isDeleted) {
                    await this.updateTxLabel(verifyId(txLabel.txLabelId), { isDeleted: false })
                }
                return txLabel
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap> {
        const partial = { transactionId, txLabelId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let txLabelMap = verifyOneOrNone(await this.findTxLabelMaps({ partial, trx }))
                if (!txLabelMap) {
                    txLabelMap = { ...partial, created_at: now, updated_at: now, isDeleted: false }
                    await this.insertTxLabelMap(txLabelMap, trx)
                }
                if (txLabelMap.isDeleted) {
                    await this.updateTxLabelMap(transactionId, txLabelId, { isDeleted: false })
                }
                return txLabelMap
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> {
        const partial = { tag, userId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let outputTag = verifyOneOrNone(await this.findOutputTags({ partial, trx }))
                if (!outputTag) {
                    outputTag = { ...partial, outputTagId: 0, created_at: now, updated_at: now, isDeleted: false }
                    outputTag.outputTagId = await this.insertOutputTag(outputTag, trx)
                }
                if (outputTag.isDeleted) {
                    await this.updateOutputTag(verifyId(outputTag.outputTagId), { isDeleted: false })
                }
                return outputTag
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> {
        const partial = { outputId, outputTagId }
        for (let retry = 0; ; retry++) {
            try {
                const now = new Date()
                let outputTagMap = verifyOneOrNone(await this.findOutputTagMaps({ partial, trx }))
                if (!outputTagMap) {
                    outputTagMap = { ...partial, created_at: now, updated_at: now, isDeleted: false }
                    await this.insertOutputTagMap(outputTagMap, trx)
                }
                if (outputTagMap.isDeleted) {
                    await this.updateOutputTagMap(outputId, outputTagId, { isDeleted: false })
                }
                return outputTagMap
            } catch (eu: unknown) {
                if (retry > 0) throw eu;
            }
        }
    }

    async tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void> {
        await this.transaction(async trx => {
            const o = verifyOne(await this.findOutputs({ partial, noScript: true, trx }))
            const outputTag = await this.findOrInsertOutputTag(o.userId, tag, trx)
            await this.findOrInsertOutputTagMap(verifyId(o.outputId), verifyId(outputTag.outputTagId), trx)
        }, trx)
    }

}