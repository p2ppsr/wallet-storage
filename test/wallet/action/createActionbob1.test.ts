/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src/index.all'

import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { parseWalletOutpoint } from '../../../src/sdk'

const noLog = false

describe.skip('createActionbob1 test', () => {
  jest.setTimeout(99999999)

  const amount = 1319
  const env = _tu.getEnv('test')
  const testName = () => expect.getState().currentTestName || 'test'

  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('createActionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('createActionTests'))
    for (const { services } of ctxs) {
      // Mock the services postBeef to avoid actually broadcasting new transactions.
      services.postBeef = jest.fn().mockImplementation((beef: bsv.Beef, txids: string[]): Promise<sdk.PostBeefResult[]> => {
        const r: sdk.PostBeefResult = {
          name: 'mock',
          status: 'success',
          txidResults: txids.map(txid => ({ txid, status: 'success' }))
        }
        return Promise.resolve([r])
      })
      services.postTxs = jest.fn().mockImplementation((beef: bsv.Beef, txids: string[]): Promise<sdk.PostBeefResult[]> => {
        const r: sdk.PostBeefResult = {
          name: 'mock',
          status: 'success',
          txidResults: txids.map(txid => ({ txid, status: 'success' }))
        }
        return Promise.resolve([r])
      })
    }
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('1_invalid_params', async () => {
    for (const { wallet } of ctxs) {
      {
        const log = `\n${testName()}\n`
        const args: bsv.CreateActionArgs = {
          description: ''
        }
        // description is too short...
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.createAction(args))
        args.description = 'five.'
        // no outputs, inputs or sendWith
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.createAction(args))
        args.options = { signAndProcess: false }
        args.outputs = [{ satoshis: 42, lockingScript: 'fred', outputDescription: 'pay fred' }]
        // lockingScript must be hexadecimal
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.createAction(args))
        args.outputs[0].lockingScript = 'fre'
        // lockingScript must be even length
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.createAction(args))
        if (!noLog) console.log(log)
      }
    }
  })

  test.skip('2_signableTransaction', async () => {
    for (const { wallet } of ctxs) {
      const root = '02135476'
      const kp = _tu.getKeyPair(root.repeat(8))

      let txid1: string
      let txid2: string
      const outputSatoshis = 42
      let noSendChange: string[] | undefined

      {
        const createArgs: bsv.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          outputs: [{ satoshis: outputSatoshis, lockingScript: _tu.getLockP2PKH(kp.address).toHex(), outputDescription: 'pay fred' }],
          options: {
            randomizeOutputs: false,
            signAndProcess: true,
            noSend: false
          }
        }

        const cr = await wallet.createAction(createArgs)
        noSendChange = cr.noSendChange

        //expect(cr.noSendChange).toBeTruthy()
        expect(cr.sendWithResults).toBeUndefined()
        //expect(cr.tx).toBeUndefined()
        //expect(cr.txid).toBeUndefined()

        //expect(cr.signableTransaction).toBeTruthy()
        const st = cr.signableTransaction!
        //expect(st.reference).toBeTruthy()
        // const tx = Transaction.fromAtomicBEEF(st.tx) // Transaction doesn't support V2 Beef yet.
        const atomicBeef = bsv.Beef.fromBinary(st.tx)
        const tx = atomicBeef.txs[atomicBeef.txs.length - 1].tx
        for (const input of tx.inputs) {
          expect(atomicBeef.findTxid(input.sourceTXID!)).toBeTruthy()
        }

        // Spending authorization check happens here...
        //expect(st.amount > 242 && st.amount < 300).toBe(true)

        // sign and complete
        const signArgs: bsv.SignActionArgs = {
          reference: st.reference,
          spends: {},
          options: {
            returnTXIDOnly: true,
            noSend: false
          }
        }

        const sr = await wallet.signAction(signArgs)

        txid1 = sr.txid!
        // Update the noSendChange txid to final signed value.
        noSendChange = noSendChange!.map(op => `${txid1}.${op.split('.')[1]}`)
      }

      {
        const unlock = _tu.getUnlockP2PKH(kp.privateKey, outputSatoshis)
        const unlockingScriptLength = await unlock.estimateLength()

        const createArgs: bsv.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          inputs: [
            {
              outpoint: `${txid1}.0`,
              inputDescription: 'spend ${kp.address} of ${root}',
              unlockingScriptLength
            }
          ],
          options: {
            noSendChange,
            // signAndProcess: false, // Not required as an input lacks unlock script...
            noSend: false
          }
        }

        const cr = await wallet.createAction(createArgs)
        expect(cr.noSendChange).toBeTruthy()
        expect(cr.sendWithResults).toBeUndefined()
        expect(cr.tx).toBeUndefined()
        expect(cr.txid).toBeUndefined()
        expect(cr.signableTransaction).toBeTruthy()
        const st = cr.signableTransaction!
        expect(st.reference).toBeTruthy()
        const atomicBeef = bsv.Beef.fromBinary(st.tx)
        const tx = atomicBeef.txs[atomicBeef.txs.length - 1].tx

        tx.inputs[0].unlockingScriptTemplate = unlock
        await tx.sign()
        const unlockingScript = tx.inputs[0].unlockingScript!.toHex()

        const signArgs: bsv.SignActionArgs = {
          reference: st.reference,
          spends: { 0: { unlockingScript } },
          options: {
            returnTXIDOnly: true,
            noSend: true
          }
        }

        const sr = await wallet.signAction(signArgs)

        txid2 = sr.txid!
      }
      {
        const createArgs: bsv.CreateActionArgs = {
          description: `${kp.address} of ${root}`,
          options: {
            sendWith: [txid1, txid2]
          }
        }

        const cr = await wallet.createAction(createArgs)

        expect(cr.noSendChange).not.toBeTruthy()
        expect(cr.sendWithResults?.length).toBe(2)
        const [swr1, swr2] = cr.sendWithResults!
        expect(swr1.status !== 'failed').toBe(true)
        expect(swr2.status !== 'failed').toBe(true)
        expect(swr1.txid).toBe(txid1)
        expect(swr2.txid).toBe(txid2)
      }
    }
  })
})
