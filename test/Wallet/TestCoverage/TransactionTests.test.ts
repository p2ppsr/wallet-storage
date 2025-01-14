import { Transaction } from '../../../src/storage/schema/entities/Transaction'
import { table, sdk } from '../../../src'
import * as bsv from '@bsv/sdk'

describe('Transaction Class Tests', () => {
  // Test: Constructor with default values
  test('1_creates_instance_with_default_values', () => {
    const tx = new Transaction()

    const now = new Date()
    expect(tx.transactionId).toBe(0)
    expect(tx.userId).toBe(0)
    expect(tx.txid).toBe('')
    expect(tx.status).toBe('unprocessed')
    expect(tx.reference).toBe('')
    expect(tx.satoshis).toBe(0)
    expect(tx.description).toBe('')
    expect(tx.isOutgoing).toBe(false)
    expect(tx.rawTx).toBeUndefined()
    expect(tx.inputBEEF).toBeUndefined()
    expect(tx.created_at).toBeInstanceOf(Date)
    expect(tx.updated_at).toBeInstanceOf(Date)
    expect(tx.created_at.getTime()).toBeLessThanOrEqual(now.getTime())
    expect(tx.updated_at.getTime()).toBeLessThanOrEqual(now.getTime())
  })

  // Test: Constructor with provided API object
  test('2_creates_instance_with_provided_api_object', () => {
    const now = new Date()
    const apiObject: table.Transaction = {
      transactionId: 123,
      userId: 456,
      txid: 'testTxid',
      status: 'completed',
      reference: 'testReference',
      satoshis: 789,
      description: 'testDescription',
      isOutgoing: true,
      rawTx: [1, 2, 3],
      inputBEEF: [4, 5, 6],
      created_at: now,
      updated_at: now
    }

    const tx = new Transaction(apiObject)

    expect(tx.transactionId).toBe(123)
    expect(tx.userId).toBe(456)
    expect(tx.txid).toBe('testTxid')
    expect(tx.status).toBe('completed')
    expect(tx.reference).toBe('testReference')
    expect(tx.satoshis).toBe(789)
    expect(tx.description).toBe('testDescription')
    expect(tx.isOutgoing).toBe(true)
    expect(tx.rawTx).toEqual([1, 2, 3])
    expect(tx.inputBEEF).toEqual([4, 5, 6])
    expect(tx.created_at).toBe(now)
    expect(tx.updated_at).toBe(now)
  })

  // Test: Getters and setters
  test('3_getters_and_setters_work_correctly', () => {
    const tx = new Transaction()

    const now = new Date()
    tx.transactionId = 123
    tx.userId = 456
    tx.txid = 'testTxid'
    tx.status = 'processed' as sdk.TransactionStatus
    tx.reference = 'testReference'
    tx.satoshis = 789
    tx.description = 'testDescription'
    tx.isOutgoing = true
    tx.rawTx = [1, 2, 3]
    tx.inputBEEF = [4, 5, 6]
    tx.created_at = now
    tx.updated_at = now

    expect(tx.transactionId).toBe(123)
    expect(tx.userId).toBe(456)
    expect(tx.txid).toBe('testTxid')
    expect(tx.status).toBe('processed')
    expect(tx.reference).toBe('testReference')
    expect(tx.satoshis).toBe(789)
    expect(tx.description).toBe('testDescription')
    expect(tx.isOutgoing).toBe(true)
    expect(tx.rawTx).toEqual([1, 2, 3])
    expect(tx.inputBEEF).toEqual([4, 5, 6])
    expect(tx.created_at).toBe(now)
    expect(tx.updated_at).toBe(now)
  })

  // Test: `getBsvTx` returns parsed transaction
  test('4_getBsvTx_returns_parsed_transaction', () => {
    const rawTx = Uint8Array.from([1, 2, 3])
    const tx = new Transaction({ rawTx: Array.from(rawTx) } as table.Transaction)

    const bsvTx = tx.getBsvTx()
    expect(bsvTx).toBeInstanceOf(bsv.Transaction)
  })

  // Test: `getBsvTx` returns undefined if rawTx is not set
  test('5_getBsvTx_returns_undefined_if_no_rawTx', () => {
    const tx = new Transaction()
    const bsvTx = tx.getBsvTx()
    expect(bsvTx).toBeUndefined()
  })

  // Test: `getBsvTxIns` returns parsed inputs
  test('6_getBsvTxIns_returns_inputs', () => {
    const rawTx = Uint8Array.from([1, 2, 3])
    const tx = new Transaction({ rawTx: Array.from(rawTx) } as table.Transaction)

    const inputs = tx.getBsvTxIns()
    expect(inputs).toBeInstanceOf(Array)
  })

  // Test: `getInputs` combines spentBy and rawTx inputs
  test('7_getInputs_combines_spentBy_and_rawTx_inputs', async () => {
    const storage: any = {
      findOutputs: jest.fn(async () => [
        { outputId: 1, txid: 'test1', vout: 0 },
        { outputId: 2, txid: 'test2', vout: 1 }
      ])
    }

    const tx = new Transaction({ userId: 123 } as table.Transaction)
    const inputs = await tx.getInputs(storage)
    expect(inputs).toHaveLength(2)
  })

  // Test: Equality check
  test('8_equals_checks_equality', () => {
    const now = new Date()
    const syncMap: any = {
      transaction: { idMap: { 123: 123 } }
    }

    const tx = new Transaction({
      transactionId: 123,
      txid: 'testTxid',
      reference: 'testRef',
      created_at: now,
      updated_at: now
    } as table.Transaction)

    const other = {
      transactionId: 123,
      txid: 'testTxid',
      reference: 'testRef'
    }

    expect(tx.equals(other as table.Transaction, syncMap)).toBe(true)
  })
})
