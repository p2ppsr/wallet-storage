import { entity } from "../../index.client";
import { maxDate, sdk, verifyId } from "../../../index.client";
import { EntityBase } from "./EntityBase";

/**
 * @param API one of the storage table interfaces.
 * @param DE the corresponding entity class
 */
export class MergeEntity<API extends sdk.EntityTimeStamp, DE extends EntityBase<API>> {
    idMap: Record<number, number>;

    constructor(
        public stateArray: API[] | undefined,
        public find: (storage: entity.EntityStorage, userId: number, ei: API, syncMap: entity.SyncMap, trx?: sdk.TrxToken) => Promise<{ found: boolean; eo: DE; eiId: number; }>,
        /** id map for primary id of API and DE object. */
        public esm: entity.EntitySyncMap
    ) {
        this.idMap = esm.idMap;
    }

    updateSyncMap(map: Record<number, number>, inId: number, outId: number) {
        const i = verifyId(inId);
        const o = verifyId(outId);
        if (map[i] === undefined) {
            map[i] = o;
        } else if (map[i] !== o)
            throw new sdk.WERR_INTERNAL(`updateSyncMap map[${inId}] can't override ${map[i]} with ${o}`);
    }

    /**
     * @param since date of current sync chunk
     */
    async merge(since: Date | undefined, storage: entity.EntityStorage, userId: number, syncMap: entity.SyncMap, trx?: sdk.TrxToken): Promise<{ inserts: number; updates: number; }> {
        let inserts = 0, updates = 0;
        if (!this.stateArray) return { inserts, updates }
        for (const ei of this.stateArray) {
            this.esm.maxUpdated_at = maxDate(this.esm.maxUpdated_at, ei.updated_at)
            /**
             * TODO:
             * Switch to using syncMap. If the ei id is in the map its an existing merge, else its a new merge.
             */
            const { found, eo, eiId } = await this.find(storage, userId, ei, syncMap, trx);
            if (found) {
                if (await eo.mergeExisting(storage, since, ei, syncMap, trx)) {
                    updates++;
                }
            } else {
                await eo.mergeNew(storage, userId, syncMap, trx);
                inserts++;
            }
            if (eiId > -1)
                this.updateSyncMap(this.idMap, eiId, eo.id);
        }
        return { inserts, updates };
    }
}
