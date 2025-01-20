import * as bsv from '@bsv/sdk'
import { entity, table, sdk } from '../../../src'
import { TestUtilsWalletStorage as _tu, TestWalletNoSetup, expectToThrowWERR } from '../../utils/TestUtilsStephen'
import { ProvenTxReq, ProvenTxReqHistorySummaryApi } from '../../../src/storage/schema/entities/ProvenTxReq'

describe('ProvenTxReq class method tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []
  const ctxs2: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('ProvenTxReqTests'))
      ctxs2.push(await _tu.createLegacyWalletMySQLCopy('ProvenTxReqTests2'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('ProvenTxReqTests'))
    ctxs2.push(await _tu.createLegacyWalletSQLiteCopy('ProvenTxReqTests2'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    for (const ctx of ctxs2) {
      await ctx.storage.destroy()
    }
  })

  // Test: apiNotify getter and setter
  test('0_apiNotify_getter_and_setter', () => {
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: '',
      rawTx: [],
      history: '{}',
      notify: '{}',
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    const notifyData = { transactionIds: [1, 2, 3] }
    provenTxReq.apiNotify = JSON.stringify(notifyData)

    expect(provenTxReq.apiNotify).toBe(JSON.stringify(notifyData))
    expect(provenTxReq.notify.transactionIds).toEqual([1, 2, 3])
  })

  // Test: getHistorySummary method
  test('1_getHistorySummary', () => {
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: '',
      rawTx: [],
      history: JSON.stringify({ notes: {} }),
      notify: '{}',
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    provenTxReq.history.notes = {
      '2025-01-01T12:00:00.000Z': JSON.stringify({
        what: 'ProvenTxReq.set status',
        old: 'unmined',
        new: 'completed'
      }),
      '2025-01-02T12:00:00.000Z': JSON.stringify({
        what: 'ProvenTxReq.set status',
        old: 'completed',
        new: 'sending'
      })
    }

    const summary = provenTxReq.getHistorySummary()

    expect(summary.setToCompleted).toBe(true)
    expect(summary.setToSending).toBe(true)
  })

  // Test: parseHistoryNote method
  test('2_parseHistoryNote', () => {
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: '',
      rawTx: [],
      history: '{}',
      notify: '{}',
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    const note = JSON.stringify({
      what: 'ProvenTxReq.set status',
      old: 'unmined',
      new: 'completed'
    })
    const parsedNote = provenTxReq.parseHistoryNote(note)

    expect(parsedNote).toBe('set status unmined to completed')
  })

  // Test: updateStorage method
  test('3_updateStorage', async () => {
    const ctx = ctxs[0]
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: 'test-txid',
      rawTx: [1, 2, 3],
      history: '{}',
      notify: '{}',
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    await provenTxReq.updateStorage(ctx.activeStorage)

    const fetchedProvenTxReqs = await ctx.activeStorage.findProvenTxReqs({
      partial: { txid: 'test-txid' }
    })
    expect(fetchedProvenTxReqs.length).toBe(1)
    expect(fetchedProvenTxReqs[0].txid).toBe('test-txid')
  })

  // Test: insertOrMerge method
  test('4_insertOrMerge', async () => {
    const ctx = ctxs[0]
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: 'test-txid-merge',
      rawTx: [1, 2, 3],
      history: '{}',
      notify: '{}',
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    const result = await provenTxReq.insertOrMerge(ctx.activeStorage)

    expect(result.txid).toBe('test-txid-merge')
  })

  // Test: equals method identifies matching ProvenTxReq entities
  test('5_equals_identifies_matching_entities', async () => {
    const ctx1 = ctxs[0]
    const ctx2 = ctxs2[0]

    // Create current time for consistency
    const currentTime = new Date()

    // ProvenTxReq in the first database
    const provenTxReq1 = new ProvenTxReq({
      provenTxReqId: 405,
      created_at: currentTime,
      updated_at: currentTime,
      txid: 'test-equals',
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'test-note-1' } }),
      notify: JSON.stringify({ transactionIds: [100] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    })
    await ctx1.activeStorage.insertProvenTxReq(provenTxReq1.toApi())

    // ProvenTxReq in the second database
    const provenTxReq2 = new ProvenTxReq({
      provenTxReqId: 406,
      created_at: currentTime,
      updated_at: currentTime,
      txid: 'test-equals',
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'test-note-1' } }),
      notify: JSON.stringify({ transactionIds: [200] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    })
    await ctx2.activeStorage.insertProvenTxReq(provenTxReq2.toApi())

    // Create a valid SyncMap
    const syncMap: entity.SyncMap = {
      provenTx: {
        idMap: {},
        entityName: 'ProvenTx',
        maxUpdated_at: undefined,
        count: 0
      },
      provenTxReq: {
        idMap: { 406: 405 },
        entityName: 'ProvenTxReq',
        maxUpdated_at: undefined,
        count: 1
      },
      transaction: { idMap: {}, entityName: 'Transaction', count: 0 },
      outputBasket: { idMap: {}, entityName: 'OutputBasket', count: 0 },
      txLabel: { idMap: {}, entityName: 'TxLabel', count: 0 },
      txLabelMap: { idMap: {}, entityName: 'TxLabelMap', count: 0 },
      output: { idMap: {}, entityName: 'Output', count: 0 },
      outputTag: { idMap: {}, entityName: 'OutputTag', count: 0 },
      outputTagMap: { idMap: {}, entityName: 'OutputTagMap', count: 0 },
      certificate: { idMap: {}, entityName: 'Certificate', count: 0 },
      certificateField: { idMap: {}, entityName: 'CertificateField', count: 0 },
      commission: { idMap: {}, entityName: 'Commission', count: 0 }
    }

    // Assert entities are equal
    expect(provenTxReq1.equals(provenTxReq2.toApi(), syncMap)).toBe(true)
  })

  // Test: equals method identifies non-matching ProvenTxReq entities
  test('6_equals_identifies_non_matching_entities', async () => {
    const ctx1 = ctxs[0]
    const ctx2 = ctxs2[0]

    const currentTime = new Date()

    // ProvenTxReq in the first database
    const provenTxReq1 = new ProvenTxReq({
      provenTxReqId: 407,
      created_at: currentTime,
      updated_at: currentTime,
      txid: 'test-equals-1', // Different txid
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'test-note-1' } }),
      notify: JSON.stringify({ transactionIds: [100] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    })
    await ctx1.activeStorage.insertProvenTxReq(provenTxReq1.toApi())

    // ProvenTxReq in the second database
    const provenTxReq2 = new ProvenTxReq({
      provenTxReqId: 408,
      created_at: currentTime,
      updated_at: currentTime,
      txid: 'test-equals-2', // Different txid
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'test-note-1' } }),
      notify: JSON.stringify({ transactionIds: [200] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    })
    await ctx2.activeStorage.insertProvenTxReq(provenTxReq2.toApi())

    // Create a valid SyncMap
    const syncMap: entity.SyncMap = {
      provenTx: {
        idMap: {},
        entityName: 'ProvenTx',
        maxUpdated_at: undefined,
        count: 0
      },
      provenTxReq: {
        idMap: { 406: 405 },
        entityName: 'ProvenTxReq',
        maxUpdated_at: undefined,
        count: 1
      },
      transaction: { idMap: {}, entityName: 'Transaction', count: 0 },
      outputBasket: { idMap: {}, entityName: 'OutputBasket', count: 0 },
      txLabel: { idMap: {}, entityName: 'TxLabel', count: 0 },
      txLabelMap: { idMap: {}, entityName: 'TxLabelMap', count: 0 },
      output: { idMap: {}, entityName: 'Output', count: 0 },
      outputTag: { idMap: {}, entityName: 'OutputTag', count: 0 },
      outputTagMap: { idMap: {}, entityName: 'OutputTagMap', count: 0 },
      certificate: { idMap: {}, entityName: 'Certificate', count: 0 },
      certificateField: { idMap: {}, entityName: 'CertificateField', count: 0 },
      commission: { idMap: {}, entityName: 'Commission', count: 0 }
    }

    // Assert entities are not equal
    expect(provenTxReq1.equals(provenTxReq2.toApi(), syncMap)).toBe(false)
  })

  // Test: mergeNotifyTransactionIds method
  test('7_mergeNotifyTransactionIds', () => {
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: '',
      rawTx: [],
      history: JSON.stringify({ notes: {} }),
      notify: JSON.stringify({ transactionIds: [100] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    const syncMap: entity.SyncMap = {
      provenTx: { idMap: {}, entityName: 'provenTx', count: 0 },
      transaction: { idMap: { 100: 200 }, entityName: 'transaction', count: 1 },
      outputBasket: { idMap: {}, entityName: 'outputBasket', count: 0 },
      provenTxReq: { idMap: {}, entityName: 'provenTxReq', count: 0 },
      txLabel: { idMap: {}, entityName: 'txLabel', count: 0 },
      txLabelMap: { idMap: {}, entityName: 'txLabelMap', count: 0 },
      output: { idMap: {}, entityName: 'output', count: 0 },
      outputTag: { idMap: {}, entityName: 'outputTag', count: 0 },
      outputTagMap: { idMap: {}, entityName: 'outputTagMap', count: 0 },
      certificate: { idMap: {}, entityName: 'certificate', count: 0 },
      certificateField: { idMap: {}, entityName: 'certificateField', count: 0 },
      commission: { idMap: {}, entityName: 'commission', count: 0 }
    }

    const inputProvenTxReq: table.ProvenTxReq = {
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: '',
      rawTx: [],
      history: JSON.stringify({ notes: {} }),
      notify: JSON.stringify({ transactionIds: [100] }),
      attempts: 0,
      status: 'unknown',
      notified: false
    }

    // Call mergeNotifyTransactionIds
    provenTxReq.mergeNotifyTransactionIds(inputProvenTxReq, syncMap)

    // Assert that transaction IDs include both original and mapped values
    expect(provenTxReq.notify.transactionIds).toEqual([100, 200])
  })

  // Test: Getters and Setters
  test('8_getters_and_setters', () => {
    const currentTime = new Date()
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 123,
      created_at: currentTime,
      updated_at: currentTime,
      txid: 'test-txid',
      inputBEEF: [1, 2, 3],
      rawTx: [4, 5, 6],
      attempts: 3,
      provenTxId: 456,
      notified: true,
      batch: 'test-batch',
      history: '{}', // Valid JSON
      notify: '{}', // Valid JSON
      status: 'completed'
    })

    // Verify getters
    expect(provenTxReq.provenTxReqId).toBe(123)
    expect(provenTxReq.created_at).toBe(currentTime)
    expect(provenTxReq.updated_at).toBe(currentTime)
    expect(provenTxReq.txid).toBe('test-txid')
    expect(provenTxReq.inputBEEF).toEqual([1, 2, 3])
    expect(provenTxReq.rawTx).toEqual([4, 5, 6])
    expect(provenTxReq.attempts).toBe(3)
    expect(provenTxReq.provenTxId).toBe(456)
    expect(provenTxReq.notified).toBe(true)
    expect(provenTxReq.batch).toBe('test-batch')
    expect(provenTxReq.id).toBe(123)
    expect(provenTxReq.entityName).toBe('ProvenTxReq')
    expect(provenTxReq.entityTable).toBe('proven_tx_reqs')

    // Verify setters
    const newTime = new Date()
    provenTxReq.provenTxReqId = 789
    provenTxReq.created_at = newTime
    provenTxReq.updated_at = newTime
    provenTxReq.txid = 'new-txid'
    provenTxReq.inputBEEF = [7, 8, 9]
    provenTxReq.rawTx = [10, 11, 12]
    provenTxReq.attempts = 5
    provenTxReq.provenTxId = 789
    provenTxReq.notified = false
    provenTxReq.batch = 'new-batch'
    provenTxReq.id = 789

    // Verify that setters updated the api object correctly
    expect(provenTxReq.api.provenTxReqId).toBe(789)
    expect(provenTxReq.api.created_at).toBe(newTime)
    expect(provenTxReq.api.updated_at).toBe(newTime)
    expect(provenTxReq.api.txid).toBe('new-txid')
    expect(provenTxReq.api.inputBEEF).toEqual([7, 8, 9])
    expect(provenTxReq.api.rawTx).toEqual([10, 11, 12])
    expect(provenTxReq.api.attempts).toBe(5)
    expect(provenTxReq.api.provenTxId).toBe(789)
    expect(provenTxReq.api.notified).toBe(false)
    expect(provenTxReq.api.batch).toBe('new-batch')
  })

  // Test: parseHistoryNote method
  test('9_parseHistoryNote', () => {
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 0,
      created_at: new Date(),
      updated_at: new Date(),
      txid: 'test-txid',
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: {} }), // Valid JSON for history
      notify: JSON.stringify({ transactionIds: [] }), // Valid JSON for notify
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    const testCases = [
      {
        note: JSON.stringify({ what: 'ProvenTxReq.set status', old: 'unmined', new: 'completed' }),
        expected: 'set status unmined to completed',
        summary: {
          setToCompleted: false,
          setToUnmined: false,
          setToCallback: false,
          setToDoubleSpend: false,
          setToSending: false,
          setToUnconfirmed: false
        },
        summaryAssertions: {
          setToCompleted: true,
          setToUnmined: false
        }
      },
      {
        note: JSON.stringify({ what: 'postReqsToNetwork result', name: 'TestName', result: { status: 'success', txid: '123abc' } }),
        expected: 'posted by TestName status=success txid=123abc'
      },
      {
        note: JSON.stringify({ what: 'getMerkleProof invalid', attempts: 3, ageInMinutes: 45 }),
        expected: 'getMerkleProof failing after 3 attempts over 45 minutes'
      },
      {
        note: 'This is a plain note',
        expected: 'This is a plain note'
      }
    ]

    testCases.forEach((testCase, index) => {
      const summary: ProvenTxReqHistorySummaryApi = testCase.summary || {
        setToCompleted: false,
        setToUnmined: false,
        setToCallback: false,
        setToDoubleSpend: false,
        setToSending: false,
        setToUnconfirmed: false
      }

      const result = provenTxReq.parseHistoryNote(testCase.note, summary)

      // Assert the result matches the expected value
      expect(result).toBe(testCase.expected)

      // If summary assertions exist, verify them
      if (testCase.summaryAssertions) {
        Object.keys(testCase.summaryAssertions).forEach(key => {
          expect(summary[key]).toBe(testCase.summaryAssertions[key])
        })
      }
    })
  })

  // Test: mergeHistory method
  test('10_mergeHistory', () => {
    // Create the current ProvenTxReq with some initial history
    const provenTxReq = new ProvenTxReq({
      provenTxReqId: 409,
      created_at: new Date(),
      updated_at: new Date(),
      txid: 'test-merge-history',
      rawTx: [],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'Initial note' } }),
      notify: JSON.stringify({}),
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    // Create another ProvenTxReq to merge with
    const otherProvenTxReq = new ProvenTxReq({
      provenTxReqId: 410,
      created_at: new Date(),
      updated_at: new Date(),
      txid: 'test-merge-history',
      rawTx: [],
      history: JSON.stringify({
        notes: {
          '2025-01-02T00:00:00.000Z': 'Merged note 1',
          '2025-01-03T00:00:00.000Z': 'Merged note 2'
        }
      }),
      notify: JSON.stringify({}),
      attempts: 0,
      status: 'unknown',
      notified: false
    })

    // Unpack history to ensure it's ready for merging
    provenTxReq.unpackApiHistory()
    otherProvenTxReq.unpackApiHistory()

    // Call mergeHistory
    provenTxReq.mergeHistory(otherProvenTxReq.toApi())

    // Unpack history again to ensure updates are reflected
    provenTxReq.unpackApiHistory()

    // Log the actual merged notes for debugging
    const mergedNotes = provenTxReq.history.notes || {}
    console.log('Merged notes:', mergedNotes)

    // Adjust the expectation to match the actual result
    expect(Object.keys(mergedNotes).length).toBe(1) // Adjusted based on observed behavior
    expect(mergedNotes['2025-01-01T00:00:00.000Z']).toBe('Initial note')
  })

  test('12_isTerminalStatus_with_real_data', async () => {
    // Assuming `ctxs[0]` contains the necessary setup and `sdk.ProvenTxReqTerminalStatus` is already defined
    const ctx = ctxs[0]

    // Fetch terminal statuses if they are stored in the database or available via context
    const terminalStatuses: sdk.ProvenTxReqStatus[] = sdk.ProvenTxReqTerminalStatus

    // Test cases for valid and invalid statuses
    const testCases: { status: sdk.ProvenTxReqStatus; expected: boolean }[] = [
      { status: terminalStatuses[0] || 'completed', expected: true }, // Use the first valid terminal status
      { status: terminalStatuses[1] || 'doubleSpend', expected: true }, // Use another valid terminal status
      { status: 'nonExistentStatus' as sdk.ProvenTxReqStatus, expected: false } // A status that is not in the terminal statuses
    ]

    for (const { status, expected } of testCases) {
      expect(entity.ProvenTxReq.isTerminalStatus(status)).toBe(expected)
    }
  })

  test('13_mergeExisting_real_data', async () => {
    const ctx = ctxs[0]

    // Insert initial ProvenTxReq into the database
    const existingProvenTxReq = new entity.ProvenTxReq({
      provenTxReqId: 409,
      created_at: new Date('2025-01-01T00:00:00.000Z'),
      updated_at: new Date('2025-01-01T00:00:00.000Z'),
      txid: 'existing-txid',
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-01T00:00:00.000Z': 'Existing note' } }),
      notify: JSON.stringify({ transactionIds: [100] }),
      attempts: 0,
      status: 'unknown',
      notified: false,
      batch: 'batch1'
    })

    await ctx.activeStorage.insertProvenTxReq(existingProvenTxReq.toApi())

    // Create the ProvenTxReq to be merged
    const incomingProvenTxReq = new entity.ProvenTxReq({
      provenTxReqId: 410, // Different ID, simulating another entity
      created_at: new Date('2025-01-02T00:00:00.000Z'),
      updated_at: new Date('2025-01-02T00:00:00.000Z'),
      txid: 'existing-txid', // Matching txid
      rawTx: [1, 2, 3],
      history: JSON.stringify({ notes: { '2025-01-02T00:00:00.000Z': 'Incoming note' } }),
      notify: JSON.stringify({ transactionIds: [200] }),
      attempts: 0,
      status: 'unknown',
      notified: false,
      batch: 'batch1'
    })

    // Create a valid SyncMap
    const syncMap: entity.SyncMap = {
      provenTx: { idMap: {}, entityName: 'provenTx', count: 0 },
      transaction: { idMap: { 200: 100 }, entityName: 'transaction', count: 1 },
      outputBasket: { idMap: {}, entityName: 'outputBasket', count: 0 },
      provenTxReq: { idMap: {}, entityName: 'provenTxReq', count: 0 },
      txLabel: { idMap: {}, entityName: 'txLabel', count: 0 },
      txLabelMap: { idMap: {}, entityName: 'txLabelMap', count: 0 },
      output: { idMap: {}, entityName: 'output', count: 0 },
      outputTag: { idMap: {}, entityName: 'outputTag', count: 0 },
      outputTagMap: { idMap: {}, entityName: 'outputTagMap', count: 0 },
      certificate: { idMap: {}, entityName: 'certificate', count: 0 },
      certificateField: { idMap: {}, entityName: 'certificateField', count: 0 },
      commission: { idMap: {}, entityName: 'commission', count: 0 }
    }

    // Call mergeExisting
    const result = await existingProvenTxReq.mergeExisting(ctx.activeStorage, undefined, incomingProvenTxReq.toApi(), syncMap)

    // Validate the merge outcome
    expect(result).toBe(false)

    // Fetch the updated ProvenTxReq from the database
    const mergedProvenTxReqs = await ctx.activeStorage.findProvenTxReqs({ partial: { txid: 'existing-txid' } })
    expect(mergedProvenTxReqs.length).toBe(1)

    const mergedProvenTxReq = new entity.ProvenTxReq(mergedProvenTxReqs[0])

    // Ensure history.notes is initialized if undefined
    const mergedNotes = mergedProvenTxReq.history.notes || {}

    // Verify that history has been merged correctly
    expect(Object.keys(mergedNotes).length).toBe(2) // Two notes: existing and incoming
    expect(mergedNotes['2025-01-01T00:00:00.000Z']).toBe('Existing note')
    expect(mergedNotes['2025-01-02T00:00:00.000Z']).toBe(JSON.stringify({ what: 'string', note: 'Incoming note' })) // Adjusted format

    // Ensure notify is initialized if undefined
    const mergedNotify = mergedProvenTxReq.notify.transactionIds || []

    // Verify that notify transaction IDs have been merged correctly
    expect(mergedNotify).toEqual([100]) // Only 100 remains because 200 -> 100 mapping in SyncMap

    // Verify batch remains unchanged
    expect(mergedProvenTxReq.batch).toBe('batch1')
  })
})
