import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { getBeefForTransaction } from '../../../src/storage/methods/getBeefForTransaction'

describe('internalizeAction tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('abortActionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('abortActionTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Check:  'unproven' or 'completed' status. Any other status is an error.
  // When the transaction already exists, the description is updated. The isOutgoing sense is not changed.

  test('1_default real wallet data', async () => {
    // 1. construct a normal transaction with user supplied output.
    // 2. dito but user input
    // 3..Repeat 1 & 2  but use sign action
    // Repeat 1-3 but use noSend and then a sendWith.
    // Figure the exact fee cost for transactions 1-3 and start with a noSend transaction that creates a change output with just the right fee amount. Then rebuild 1-3, as second tx, feed it the noSend change from the first tx, confirm no additional change is added or produced, use sendWith to send both as a batch.
    // "basket insertion" Merge Rules:
    // The "default" basket may not be specified as the insertion basket.
    // A change output in the "default" basket may not be target of an insertion into a different basket.
    // These baskets do not affect the wallet's balance and are typed "custom".
    // "wallet payment" Merge Rules:
    // Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
    // Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's amount, and the wallet balance.

    for (const { wallet, activeStorage: storage } of ctxs) {
      try {
        // Prepare StorageGetBeefOptions
        const options: sdk.StorageGetBeefOptions = {
          // Setting 'known' tells it not to include rawTxs it already knows about, just their txids.
          // trustSelf: 'known',
          // Setting knownTxids tells it not to include these rawTxs, just their txids.
          // knownTxids: ['2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122'],
          // False and undefined are equal here so no need for this.
          // ignoreStorage: false,
          // Yes, you expect storage to have the info, so don't use services.
          ignoreServices: true
          // Since you aren't using services and there won't be any newProven (rawTx's with merklePaths previously unknown to storage but required for this beef)
          // ignoreNewProven: false,
          // You don't expect infinitely deep nonsense
          // minProofLevel: 0
        }

        // Fetch Beef object
        const beef = await storage.getBeefForTransaction('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122', options)

        console.log('Beef Object:\n', beef.toLogString())

        // Ensure Beef object contains valid transactions
        if (beef.txs.length === 0) {
          throw new Error('Beef contains no transactions')
        }

        // Validate the first transaction in the Beef object
        const firstTx = beef.txs[0]
        if (!firstTx.isValid) {
          console.error('First transaction is invalid:', firstTx)
          throw new Error('Beef contains an invalid transaction')
        }

        expect(beef.atomicTxid).toBeUndefined()

        // Convert to AtomicBEEF transaction
        const atomicTx = beef.toBinaryAtomic('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122')
        console.log('Atomic Transaction:', atomicTx)

        // {
        //   const abeef = bsv.Beef.fromBinary(atomicTx)
        //   expect(abeef.atomicTxid).toBe('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122')
        // }

        // This needs to be a real output (the locking script and derivation bits / key need to work with each other)
        // But it is still a valid test to see what the reaction is to this nonsense :-)
        // Prepare output for internalization
        const output: bsv.InternalizeOutput = {
          outputIndex: 2,
          protocol: 'wallet payment',
          paymentRemittance: {
            derivationPrefix: 'y0tgyMJbVWKhds2/MWkDBA==',
            derivationSuffix: 'J1Q1E8re2RbvKONkEiEHDA==',
            senderIdentityKey: '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
          }
        }

        // Internalize Action
        const r = await wallet.internalizeAction({
          tx: atomicTx,
          outputs: [output],
          description: 'Default wallet payment'
        })

        // Validate result
        console.log('Internalize Action Result:', r)
        expect(r).toBeDefined()
      } catch (error) {
        console.error('Test failed with error:', error)
        throw error
      }
    }
  })

  test('2_default real basket insertion', async () => {
    // 1. construct a normal transaction with user supplied output.
    // 2. dito but user input
    // 3..Repeat 1 & 2  but use sign action
    // Repeat 1-3 but use noSend and then a sendWith.
    // Figure the exact fee cost for transactions 1-3 and start with a noSend transaction that creates a change output with just the right fee amount. Then rebuild 1-3, as second tx, feed it the noSend change from the first tx, confirm no additional change is added or produced, use sendWith to send both as a batch.
    // "basket insertion" Merge Rules:
    // The "default" basket may not be specified as the insertion basket.
    // A change output in the "default" basket may not be target of an insertion into a different basket.
    // These baskets do not affect the wallet's balance and are typed "custom".
    // "wallet payment" Merge Rules:
    // Targetting an existing change "default" basket output results in a no-op. No error. No alterations made.
    // Targetting a previously "custom" non-change output converts it into a change output. This alters the transaction's amount, and the wallet balance.

    for (const { wallet, activeStorage: storage } of ctxs) {
      try {
        // Prepare StorageGetBeefOptions
        const options: sdk.StorageGetBeefOptions = {
          // Setting 'known' tells it not to include rawTxs it already knows about, just their txids.
          // trustSelf: 'known',
          // Setting knownTxids tells it not to include these rawTxs, just their txids.
          // knownTxids: ['2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122'],
          // False and undefined are equal here so no need for this.
          // ignoreStorage: false,
          // Yes, you expect storage to have the info, so don't use services.
          ignoreServices: true
          // Since you aren't using services and there won't be any newProven (rawTx's with merklePaths previously unknown to storage but required for this beef)
          // ignoreNewProven: false,
          // You don't expect infinitely deep nonsense
          // minProofLevel: 0
        }

        // Fetch Beef object
        const beef = await storage.getBeefForTransaction('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7', options)

        console.log('Beef Object:\n', beef.toLogString())

        // Ensure Beef object contains valid transactions
        if (beef.txs.length === 0) {
          throw new Error('Beef contains no transactions')
        }

        // Validate the first transaction in the Beef object
        const firstTx = beef.txs[0]
        if (!firstTx.isValid) {
          console.error('First transaction is invalid:', firstTx)
          throw new Error('Beef contains an invalid transaction')
        }

        expect(beef.atomicTxid).toBeUndefined()

        // Convert to AtomicBEEF transaction
        const atomicTx = beef.toBinaryAtomic('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7')
        console.log('Atomic Transaction:', atomicTx)

        {
          const abeef = bsv.Beef.fromBinary(atomicTx)
          expect(abeef.atomicTxid).toBe('a3b2f0935c7b5bb7a841a09e535c13be86f4df0e7a91cebdc33812bfcc0eb9d7')
        }

        // This needs to be a real output (the locking script and derivation bits / key need to work with each other)
        // But it is still a valid test to see what the reaction is to this nonsense :-)
        // Prepare output for internalization
        const output: bsv.InternalizeOutput = {
          outputIndex: 0,
          protocol: 'basket insertion',
          // export interface BasketInsertion {
          //   basket: BasketStringUnder300Bytes
          //   customInstructions?: string
          //   tags?: OutputTagStringUnder300Bytes[]
          // }
          insertionRemittance: {
            basket: 'babbage-token-access',
            tags: ['babbage_originator todo.babbage.systems', 'babbage_action_originator projectbabbage.com', 'babbage_protocolname todo list', 'babbage_protocolsecuritylevel 2', 'babbage_counterparty self']
          }
        }

        // Internalize Action
        const r = await wallet.internalizeAction({
          tx: atomicTx,
          outputs: [output],
          description: 'Default basket insertion'
        })

        // Validate result
        console.log('Internalize Action Result:', r)
        expect(r).toBeDefined()
      } catch (error) {
        console.error('Test failed with error:', error)
        throw error
      }
    }
  })

  test('3_default', async () => {
    for (const { wallet, activeStorage: storage } of ctxs) {
      try {
        // Prepare StorageGetBeefOptions
        const options: sdk.StorageGetBeefOptions = {
          ignoreServices: true
        }

        // Fetch Beef object
        const beef = await storage.getBeefForTransaction('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122', options)

        console.log('Beef Object:', beef)

        // Ensure Beef object contains valid transactions
        if (beef.txs.length === 0) {
          throw new Error('Beef contains no transactions')
        }

        // Validate the first transaction in the Beef object
        const firstTx = beef.txs[0]
        if (!firstTx.isValid) {
          console.error('First transaction is invalid:', firstTx)
          throw new Error('Beef contains an invalid transaction')
        }

        expect(beef.atomicTxid).toBeDefined()

        // Convert to AtomicBEEF transaction
        const atomicTx = beef.toBinaryAtomic('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122')
        console.log('Atomic Transaction:', atomicTx)

        // Prepare output for internalization
        const output: bsv.InternalizeOutput = {
          outputIndex: 2,
          protocol: 'basket insertion',
          paymentRemittance: {
            derivationPrefix: 'y0tgyMJbVWKhds2/MWkDBA==',
            derivationSuffix: 'J1Q1E8re2RbvKONkEiEHDA==',
            senderIdentityKey: '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
          }
        }

        // Internalize Action
        const r = await wallet.internalizeAction({
          tx: atomicTx,
          outputs: [output],
          description: 'Default test description'
        })

        // Validate result
        console.log('Internalize Action Result:', r)
        expect(r).toBeDefined()
      } catch (error) {
        console.error('Test failed with error:', error)
        throw error
      }
    }
  })

  // test.skip('1_default', async () => {
  //   for (const { wallet } of ctxs) {
  //     const storage = ctxs[0].activeStorage as StorageKnex

  //     // const root = '02135476'
  //     // const kp = _tu.getKeyPair(root.repeat(8))

  //     // let txid1: string
  //     // let txid2: string
  //     // const outputSatoshis = 42
  //     // let noSendChange: string[] | undefined

  //     // const createArgs: sdk.CreateActionArgs = {
  //     //   description: `${kp.address} of ${root}`,
  //     //   outputs: [{ satoshis: outputSatoshis, lockingScript: _tu.getLockP2PKH(kp.address).toHex(), outputDescription: 'pay fred' }],
  //     //   options: {
  //     //     randomizeOutputs: false,
  //     //     signAndProcess: false,
  //     //     noSend: true
  //     //   }
  //     // }

  //     // const cr = await wallet.createAction(createArgs)
  //     // noSendChange = cr.noSendChange

  //     // expect(cr.noSendChange).toBeTruthy()
  //     // expect(cr.sendWithResults).toBeUndefined()
  //     // expect(cr.tx).toBeUndefined()
  //     // expect(cr.txid).toBeUndefined()

  //     // expect(cr.signableTransaction).toBeTruthy()
  //     // const st = cr.signableTransaction!
  //     // expect(st.reference).toBeTruthy()
  //     // // const tx = Transaction.fromAtomicBEEF(st.tx) // Transaction doesn't support V2 Beef yet.
  //     // const atomicBeef = bsv.Beef.fromBinary(st.tx)

  //     const output: bsv.InternalizeOutput = {
  //       outputIndex: 0,
  //       protocol: 'wallet payment',
  //       paymentRemittance: {
  //         derivationPrefix: bsv.Utils.toBase64([1, 2, 3]),
  //         derivationSuffix: bsv.Utils.toBase64([4, 5, 6]),
  //         senderIdentityKey: '02ce39558560fe2219636460b1ce1d8bb5760097656bf2bf21f7d1db422223c4ee'
  //       }
  //     }

  //     //   export interface StorageGetBeefOptions {
  //     //     /** if 'known', txids known to local storage as valid are included as txidOnly */
  //     //     trustSelf?: 'known'
  //     //     /** list of txids to be included as txidOnly if referenced. Validity is known to caller. */
  //     //     knownTxids?: string[]
  //     //     /** optional. If defined, raw transactions and merkle paths required by txid are merged to this instance and returned. Otherwise a new Beef is constructed and returned. */
  //     //     mergeToBeef?: bsv.Beef | number[]
  //     //     /** optional. Default is false. `dojo.storage` is used for raw transaction and merkle proof lookup */
  //     //     ignoreStorage?: boolean
  //     //     /** optional. Default is false. `dojo.getServices` is used for raw transaction and merkle proof lookup */
  //     //     ignoreServices?: boolean
  //     //     /** optional. Default is false. If true, raw transactions with proofs missing from `dojo.storage` and obtained from `dojo.getServices` are not inserted to `dojo.storage`. */
  //     //     ignoreNewProven?: boolean
  //     //     /** optional. Default is zero. Ignores available merkle paths until recursion detpth equals or exceeds value  */
  //     //     minProofLevel?: number
  //     //  }
  //     const options: sdk.StorageGetBeefOptions = {
  //       trustSelf: undefined,
  //       knownTxids: ['2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122'],
  //       mergeToBeef: undefined,
  //       ignoreStorage: true,
  //       ignoreNewProven: true,
  //       ignoreServices: true,
  //       minProofLevel: undefined
  //     }
  //     const beef = storage.getBeefForTransaction('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122', options)
  //     const atomicTx = (await beef).toBinaryAtomic('2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122')
  //     const r = await wallet.internalizeAction({
  //       tx: atomicTx,
  //       outputs: [output],
  //       description: 'Default test description'
  //     })

  //     expect(r).toBeDefined()
  //     expect(r).toBe(true)
  //   }
  // })

  // test.skip('should internalize an action with valid inputs', async () => {
  //   const args = {
  //     tx: [0x00], // Sample transaction byte array
  //     outputs: [
  //       {
  //         outputIndex: 0,
  //         protocol: 'wallet payment' as 'wallet payment',
  //         paymentRemittance: {
  //           derivationPrefix: bsv.Utils.toBase64([1, 2, 3]),
  //           derivationSuffix: bsv.Utils.toBase64([4, 5, 6]),
  //           senderIdentityKey: '02' + '1'.repeat(64)
  //         }
  //       }
  //     ],
  //     description: 'Test internalize action',
  //     labels: ['test-label']
  //   }
  //   // const result = await wallet.internalizeAction(args)
  //   // expect(result).toEqual({ accepted: true })
  // })

  // test('should throw an error with invalid inputs', async () => {
  //   // Mock the internalizeAction method to throw an error
  //   const args = {
  //     tx: [], // Empty transaction array
  //     outputs: [],
  //     description: 'Test internalize action'
  //   }
  //   await expect(wallet.internalizeAction(args)).rejects.toThrow('Invalid inputs')
  // })
  // test('should internalize an action with "basket insertion" protocol', async () => {
  //   // Mock the internalizeAction method
  //   const internalizeActionMock = jest.fn().mockResolvedValue({ accepted: true })
  //   const wallet = createTestWalletWire(
  //     mockUnsupportedMethods({
  //       internalizeAction: internalizeActionMock
  //     })
  //   )

  //   const args = {
  //     tx: [0x00], // Sample transaction byte array
  //     outputs: [
  //       {
  //         outputIndex: 0,
  //         protocol: 'basket insertion' as 'basket insertion',
  //         insertionRemittance: {
  //           basket: 'test-basket',
  //           customInstructions: 'Test instructions',
  //           tags: ['test-tag1', 'test-tag2']
  //         }
  //       }
  //     ],
  //     description: 'Test internalize action with basket insertion',
  //     labels: ['test-label']
  //   }
  //   const result = await wallet.internalizeAction(args)
  //   expect(result).toEqual({ accepted: true })
  //   expect(internalizeActionMock).toHaveBeenCalledWith(args, '')
  // })
})
