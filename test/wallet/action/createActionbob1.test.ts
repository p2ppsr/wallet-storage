/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src'

import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { parseWalletOutpoint } from '../../../src/sdk'

const noLog = false

describe('createAction test', () => {
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
        const args: sdk.CreateActionArgs = {
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
        const createArgs: sdk.CreateActionArgs = {
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
        const signArgs: sdk.SignActionArgs = {
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

        const createArgs: sdk.CreateActionArgs = {
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

        const signArgs: sdk.SignActionArgs = {
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
        const createArgs: sdk.CreateActionArgs = {
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

  test.skip('8a_Transaction with first Broadcasting', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet, activeStorage: storage } of ctxs) {
      // Fetch inputs from the database with lockingScript
      const db = storage.toDb()
      const inputs = await db
        .select(db.raw("txid || '.' || vout AS outpoint"), db.raw('LENGTH(lockingScript) AS unlockingScriptLength'), 'lockingScript', db.raw("'Input ' || ROW_NUMBER() OVER () AS inputDescription"))
        .from('outputs')
        .where('spendable', 1)
        .orderBy('created_at')
        .limit(1)

      const formattedInputs = inputs.map(row => ({
        outpoint: row.outpoint,
        inputDescription: row.inputDescription,
        unlockingScript: bsv.Utils.toHex(row.lockingScript)
        //unlockingScriptLength: row.unlockingScriptLength
      }))

      const { txid, vout } = parseWalletOutpoint(formattedInputs[0].outpoint)
      const beef = await storage.getBeefForTransaction(txid, { ignoreServices: true })

      const createArgs: sdk.CreateActionArgs = {
        description: 'Large Input Set Transaction',
        inputs: formattedInputs,
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output from Large Input Set'
          }
        ],
        inputBEEF: beef.toBinary(),
        options: {
          //signAndProcess: true, // Sign and process the transaction
          acceptDelayedBroadcast: false, // Enforce immediate broadcast
          noSend: false // Allow the transaction to be broadcast
        }
      }

      const cr = await wallet.createAction(createArgs)

      expect(cr.txid).toBeTruthy() // Validate the transaction was broadcast successfully
      expect(cr.noSendChange).toBeFalsy() // Validate that no change outputs remain unbroadcast
    }
  })
})

/**
 * Fetch a large set of inputs from the database for testing.
 *
 * @param {StorageKnex} storage - The storage object providing database access.
 * @returns {Promise<Array<{ outpoint: string, inputDescription: string, unlockingScriptLength: number }>>} Fetched input data.
 */
async function fetchInputsFromDatabase(storage: StorageKnex) {
  const db = storage.toDb()

  // Fetch inputs with txid, vout, and unlocking script length
  const results = await db
    .select(db.raw("txid || '.' || vout AS outpoint"), db.raw('LENGTH(lockingScript) AS unlockingScriptLength'), db.raw('lockingScript'), db.raw("'Input ' || ROW_NUMBER() OVER () AS inputDescription"))
    .from('outputs')
    .where('spendable', 1)
    .orderBy('created_at')
    .limit(5)

  if (!results.length) {
    throw new Error('No spendable inputs found in the database.')
  }

  if (!noLog) console.log('Fetched inputs from the database:', results)

  return results
}
