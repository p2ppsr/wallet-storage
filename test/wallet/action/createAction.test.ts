/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

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

  test('2_signableTransaction', async () => {
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
            signAndProcess: false,
            noSend: true
          }
        }

        const cr = await wallet.createAction(createArgs)
        noSendChange = cr.noSendChange

        expect(cr.noSendChange).toBeTruthy()
        expect(cr.sendWithResults).toBeUndefined()
        expect(cr.tx).toBeUndefined()
        expect(cr.txid).toBeUndefined()

        expect(cr.signableTransaction).toBeTruthy()
        const st = cr.signableTransaction!
        expect(st.reference).toBeTruthy()
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
            noSend: true
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
            noSend: true
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

  test('3_Basic Transaction Creation', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const args: sdk.CreateActionArgs = {
        description: 'Basic Transaction',
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Basic Output'
          }
        ],
        options: {
          signAndProcess: false,
          noSend: true
        }
      }

      const r = await wallet.createAction(args)

      // Validate signableTransaction exists and has a reference
      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')

      // Validate txid exists if transaction is finalized
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }

      // Validate optional properties: noSendChange
      expect(r).toHaveProperty('noSendChange')
      expect(r.noSendChange).toEqual([])

      // Skip validation for sendWithResults if not returned
      expect(r.sendWithResults).toBeUndefined()
    }
  })

  test('4_Transaction with Multiple Outputs', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))
    for (const { wallet } of ctxs) {
      const args: sdk.CreateActionArgs = {
        description: 'Multiple Outputs',
        outputs: [
          {
            satoshis: 2000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 1'
          },
          {
            satoshis: 3000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 2'
          }
        ],
        options: {
          signAndProcess: false,
          noSend: true
        }
      }

      const r = await wallet.createAction(args)

      // Validate signableTransaction exists and has a reference
      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')

      // Validate txid exists if transaction is finalized
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }

      // Validate optional properties: noSendChange
      expect(r).toHaveProperty('noSendChange')
      expect(r.noSendChange).toEqual([])

      // Skip validation for sendWithResults if not returned
      expect(r.sendWithResults).toBeUndefined()
    }
  })

  test('5_Transaction with Locking Script Options', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const args: sdk.CreateActionArgs = {
        description: 'Locking Script Transaction',
        outputs: [
          {
            satoshis: 5000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Locking Script Output'
          }
        ],
        options: {
          signAndProcess: false,
          noSend: true,
          randomizeOutputs: false
        }
      }

      const r = await wallet.createAction(args)

      // Validate signableTransaction exists and has a reference
      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')

      // Validate txid exists if transaction is finalized
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }

      // Validate optional properties: noSendChange
      expect(r).toHaveProperty('noSendChange')
      expect(r.noSendChange).toEqual([])

      // Skip validation for sendWithResults if not returned
      expect(r.sendWithResults).toBeUndefined()
    }
  })

  test('6_Transaction with Large Number of Outputs', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const outputs = Array.from({ length: 50 }, (_, i) => ({
        satoshis: 1000 + i * 100, // Increment amounts
        lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
        outputDescription: `Output ${i + 1}`
      }))

      const args: sdk.CreateActionArgs = {
        description: 'Large Number of Outputs',
        outputs,
        options: {
          signAndProcess: false,
          noSend: true
        }
      }

      const r = await wallet.createAction(args)

      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }
      expect(r.noSendChange).toEqual([])
      expect(r.sendWithResults).toBeUndefined()
    }
  })

  test('7_Transaction with Randomized Outputs', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const outputs = [
        {
          satoshis: 2000,
          lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
          outputDescription: 'Output A'
        },
        {
          satoshis: 3000,
          lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
          outputDescription: 'Output B'
        }
      ]

      const args: sdk.CreateActionArgs = {
        description: 'Randomized Outputs',
        outputs,
        options: {
          signAndProcess: false,
          noSend: true,
          randomizeOutputs: true
        }
      }

      const r = await wallet.createAction(args)

      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }
      expect(r.noSendChange).toEqual([])
      expect(r.sendWithResults).toBeUndefined()
      // Validate randomization by ensuring outputs are not in the original order
      // Assuming we can decode and inspect the transaction to compare output order.
    }
  })

  test('8_Transaction with Lock Time', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const args: sdk.CreateActionArgs = {
        description: 'Lock Time Transaction',
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Lock Time Output'
          }
        ],
        lockTime: 500000, // Example lock time
        options: {
          signAndProcess: false,
          noSend: true
        }
      }

      const r = await wallet.createAction(args)

      expect(r).toHaveProperty('signableTransaction')
      expect(r.signableTransaction).toHaveProperty('reference')
      if (r.tx) {
        expect(r).toHaveProperty('txid')
      }
      expect(r.noSendChange).toEqual([])
      expect(r.sendWithResults).toBeUndefined()
    }
  })

  test.skip('9_Transaction with Large Input Set', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))
    const inputs = Array.from({ length: 50 }, (_, i) => ({
      outpoint: `${kp.address}.0.${i}`,
      inputDescription: `Input ${i + 1}`,
      unlockingScriptLength: 107 // Example length
    }))

    for (const { wallet } of ctxs) {
      const createArgs: sdk.CreateActionArgs = {
        description: 'Large Input Set Transaction',
        inputs,
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output from Large Input Set'
          }
        ],
        options: {
          noSend: true
        }
      }

      const cr = await wallet.createAction(createArgs)

      expect(cr.noSendChange).toBeTruthy()
      expect(cr.sendWithResults).toBeUndefined()
      expect(cr.tx).toBeUndefined()
      expect(cr.txid).toBeUndefined()
      expect(cr.signableTransaction).toBeTruthy()

      const st = cr.signableTransaction!
    }
  })

  test.skip('10_Mixed Inputs and Outputs Transaction', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet } of ctxs) {
      const createArgs: sdk.CreateActionArgs = {
        description: 'Mixed Inputs and Outputs',
        inputs: [
          {
            outpoint: `${kp.address}.0`,
            inputDescription: 'First Input',
            unlockingScriptLength: 107
          },
          {
            outpoint: `${kp.address}.1`,
            inputDescription: 'Second Input',
            unlockingScriptLength: 107
          }
        ],
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 1'
          },
          {
            satoshis: 2000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 2'
          }
        ],
        options: {
          noSend: true
        }
      }

      const cr = await wallet.createAction(createArgs)

      expect(cr.noSendChange).toBeTruthy()
      expect(cr.signableTransaction).toBeTruthy()
      expect(cr.tx).toBeUndefined()
      expect(cr.txid).toBeUndefined()

      const st = cr.signableTransaction!
    }
  })

  test.skip('11_Transaction with inputBEEF and Proof Data', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet, activeStorage: storage } of ctxs) {
      // Prepare BEEF options
      const options: sdk.StorageGetBeefOptions = {
        ignoreServices: true
      }

      // Fetch BEEF object for a specific transaction
      const beef = await storage.getBeefForTransaction('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7', options)
      expect(beef.atomicTxid).toBeUndefined()

      // Convert to AtomicBEEF transaction
      const inputBEEF = beef.toBinaryAtomic('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7')
      console.log('inputBEEF:', inputBEEF)
      expect(inputBEEF).toBeTruthy()

      const args: sdk.CreateActionArgs = {
        description: 'Transaction with InputBEEF',
        inputs: [
          {
            outpoint: `${kp.address}.0`,
            inputDescription: 'Spend with inputBEEF',
            unlockingScriptLength: 107
          }
        ],
        inputBEEF,
        outputs: [
          {
            satoshis: 2000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output with Proof'
          }
        ],
        options: {
          noSend: true
        }
      }

      const cr = await wallet.createAction(args)

      // Validate signableTransaction exists and has a reference
      expect(cr).toHaveProperty('signableTransaction')
      expect(cr.signableTransaction).toHaveProperty('reference')

      // Validate that txid and tx are not finalized
      expect(cr.tx).toBeUndefined()
      expect(cr.txid).toBeUndefined()

      // Validate inputBEEF resolution
      const st = cr.signableTransaction!
      const atomicBeef = bsv.Beef.fromBinary(st.tx)
      expect(inputBEEF).toBeDefined()
    }
  })

  test.skip('12_Mixed Inputs and Outputs with inputBEEF', async () => {
    const root = '02135476'
    const kp = _tu.getKeyPair(root.repeat(8))

    for (const { wallet, activeStorage: storage } of ctxs) {
      // Prepare BEEF options
      const options: sdk.StorageGetBeefOptions = {
        ignoreServices: true
      }

      // Fetch BEEF object for a specific transaction
      const beef = await storage.getBeefForTransaction('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7', options)
      expect(beef.atomicTxid).toBeUndefined()

      // Convert to AtomicBEEF transaction
      const inputBEEF = beef.toBinaryAtomic('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7')
      console.log('inputBEEF:', inputBEEF)
      expect(inputBEEF).toBeTruthy()

      const args: sdk.CreateActionArgs = {
        description: 'Mixed Inputs and Outputs',
        inputs: [
          {
            outpoint: `${kp.address}.0`,
            inputDescription: 'First Input',
            unlockingScriptLength: 107
          },
          {
            outpoint: `${kp.address}.1`,
            inputDescription: 'Second Input',
            unlockingScriptLength: 107
          }
        ],
        inputBEEF,
        outputs: [
          {
            satoshis: 1000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 1'
          },
          {
            satoshis: 2000,
            lockingScript: _tu.getLockP2PKH(kp.address).toHex(),
            outputDescription: 'Output 2'
          }
        ],
        options: {
          noSend: true
        }
      }

      const cr = await wallet.createAction(args)

      expect(cr).toHaveProperty('signableTransaction')
      expect(cr.signableTransaction).toHaveProperty('reference')
      expect(cr.tx).toBeUndefined()
      expect(cr.txid).toBeUndefined()

      // Validate inputs and outputs
      const st = cr.signableTransaction!
      const atomicBeef = bsv.Beef.fromBinary(st.tx)
      const tx = atomicBeef.txs[atomicBeef.txs.length - 1].tx
      expect(tx.inputs.length).toBe(2)
      expect(tx.outputs.length).toBe(2)

      // Validate inputBEEF
      expect(inputBEEF).toBeDefined()
    }
  })
})
