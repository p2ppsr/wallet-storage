import { asArray, asString, convertProofToMerklePath, doubleSha256BE, sdk, sha256Hash, validateScriptHash } from '../..'

import axios from 'axios'
import Whatsonchain from 'whatsonchain'

/**
 * WhatOnChain.com has their own "hash/pos/R/L" proof format and a more TSC compliant proof format.
 * 
 * The "/proof/tsc" endpoint is much closer to the TSC specification. It provides "index" directly and each node is just the provided hash value.
 * The "targetType" is unspecified and thus defaults to block header hash, requiring a Chaintracks lookup to get the merkleRoot...
 * Duplicate hash values are provided in full instead of being replaced by "*".
 * 
 * @param txid
 * @param chain 
 * @returns 
 */
export async function getMerklePathFromWhatsOnChainTsc(txid: string, chain: sdk.Chain, services: sdk.WalletServices): Promise<sdk.GetMerklePathResult> {

    const r: sdk.GetMerklePathResult = { name: 'WoCTsc' }

    try {
        let { data } = await axios.get(`https://api.whatsonchain.com/v1/bsv/${chain}/tx/${txid}/proof/tsc`)
        if (!data || data.length < 1)
           return r 

        if (!data['target'])
            data = data[0]
        const p = data
        const header = await services.hashToHeader(p.target)
        if (!header) throw new sdk.WERR_INVALID_PARAMETER('blockhash', 'a valid on-chain block hash')
        const proof = { index: p.index, nodes: p.nodes, height: header.height }
        r.merklePath = convertProofToMerklePath(txid, proof)
        r.header = header

    } catch (err: unknown) {
        r.error = sdk.WalletError.fromUnknown(err)
    }

    return r
}

interface WhatsOnChainProofTsc {
    index: number,
    txOrId: string,
    target: string,
    nodes: string[]
}

export async function getRawTxFromWhatsOnChain(txid: string, chain: sdk.Chain): Promise<sdk.GetRawTxResult> {

    const r: sdk.GetRawTxResult = { name: 'WoC', txid: asString(txid) }

    try {
        const url = `https://api.whatsonchain.com/v1/bsv/${chain}/tx/${txid}/hex`
        const { data } = await axios.get(url)
        if (!data)
            return r

        r.rawTx = asArray(data)

    } catch (err: unknown) {
        r.error = sdk.WalletError.fromUnknown(err)
    }

    return r
}

interface WhatsOnChainUtxoStatus {
    value: number
    height: number
    tx_pos: number
    tx_hash: string
}

export async function getUtxoStatusFromWhatsOnChain(output: string, chain: sdk.Chain, outputFormat?: sdk.GetUtxoStatusOutputFormat)
: Promise<sdk.GetUtxoStatusResult>
{
    const r: sdk.GetUtxoStatusResult = { name: 'WoC', status: 'error', error: new sdk.WERR_INTERNAL(), details: [] }

    for (let retry = 0; ; retry++) {

        let url: string = ''

        try {

            const scriptHash = validateScriptHash(output, outputFormat)

            url = `https://api.whatsonchain.com/v1/bsv/${chain}/script/${scriptHash}/unspent`

            const { data } = await axios.get(url)

            if (Array.isArray(data)) {
                if (data.length === 0) {
                    r.status = 'success'
                    r.error = undefined
                    r.isUtxo = false
                } else {
                    r.status = 'success'
                    r.error = undefined
                    r.isUtxo = true
                    for (const s of <WhatsOnChainUtxoStatus[]>data) {
                        r.details.push({
                            txid: s.tx_hash,
                            satoshis: s.value,
                            height: s.height,
                            index: s.tx_pos
                        })
                    }
                }
            } else {
                throw new sdk.WERR_INTERNAL("data is not an array")
            }

            return r

        } catch (eu: unknown) {
            const e = sdk.WalletError.fromUnknown(eu)
            if (e.code !== 'ECONNRESET' || retry > 2) {
                r.error = new sdk.WERR_INTERNAL(`service failure: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(eu))}`)
                return r
            }
        }
    }
    return r
}

interface WhatsOnChainScriptHistory {
    fee?: number
    height?: number
    tx_hash: string
}

export async function updateBsvExchangeRate(rate?: sdk.BsvExchangeRate, updateMsecs?: number): Promise<sdk.BsvExchangeRate> {

    if (rate) {
        // Check if the rate we know is stale enough to update.
        updateMsecs ||= 1000 * 60 * 15
        if (new Date(Date.now() - updateMsecs) < rate.timestamp)
            return rate
    }

    // TODO: Expand to redundant services with caching...
    const woc = new Whatsonchain()
    const r = await woc.exchangeRate()
    const wocrate = <{ rate: number, time: number, currency: string }>r
    if (wocrate.currency !== 'USD')
        wocrate.rate = NaN

    const newRate: sdk.BsvExchangeRate = {
        timestamp: new Date(),
        base: 'USD',
        rate: wocrate.rate
    }

    //console.log(`new bsv rate=${JSON.stringify(newRate)}`)

    return newRate
}
