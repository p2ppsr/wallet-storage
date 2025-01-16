import { TxLabel } from '../../../src/storage/schema/entities/TxLabel'
import { table } from '../../../src'
import { _tu, TestWalletNoSetup } from '../../utils/TestUtilsStephen'

describe('TxLabel Class Tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('txLabelTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('txLabelTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  // Test: Default constructor behavior
  test('1_creates_txLabel_with_default_values', () => {
    const txLabel = new TxLabel()

    // Default values
    expect(txLabel.txLabelId).toBe(0)
    expect(txLabel.label).toBe('')
    expect(txLabel.userId).toBe(0)
    expect(txLabel.isDeleted).toBe(false)
    expect(txLabel.created_at).toBeInstanceOf(Date)
    expect(txLabel.updated_at).toBeInstanceOf(Date)
    expect(txLabel.created_at <= txLabel.updated_at).toBe(true)
  })

  // Test: Constructor with provided API object
  test('2_creates_txLabel_with_provided_api_object', () => {
    const now = new Date()
    const apiObject: table.TxLabel = {
      txLabelId: 42,
      label: 'Test Label',
      userId: 101,
      isDeleted: false,
      created_at: now,
      updated_at: now
    }
    const txLabel = new TxLabel(apiObject)

    // Verify all properties match the API object
    expect(txLabel.txLabelId).toBe(42)
    expect(txLabel.label).toBe('Test Label')
    expect(txLabel.userId).toBe(101)
    expect(txLabel.isDeleted).toBe(false)
    expect(txLabel.created_at).toBe(now)
    expect(txLabel.updated_at).toBe(now)
  })

  // Test: Getters and setters behavior
  test('3_getters_and_setters_work_correctly', () => {
    const txLabel = new TxLabel()

    const now = new Date()
    txLabel.txLabelId = 1
    txLabel.label = 'New Label'
    txLabel.userId = 200
    txLabel.isDeleted = true
    txLabel.created_at = now
    txLabel.updated_at = now

    expect(txLabel.txLabelId).toBe(1)
    expect(txLabel.label).toBe('New Label')
    expect(txLabel.userId).toBe(200)
    expect(txLabel.isDeleted).toBe(true)
    expect(txLabel.created_at).toBe(now)
    expect(txLabel.updated_at).toBe(now)
  })

  // Test: equals method
  test('4_equals_returns_correct_boolean', () => {
    const apiObject: table.TxLabel = {
      txLabelId: 1,
      label: 'Label A',
      userId: 100,
      isDeleted: false,
      created_at: new Date(),
      updated_at: new Date()
    }
    const txLabel = new TxLabel(apiObject)

    const sameApiObject = { ...apiObject }
    const differentApiObject = { ...apiObject, label: 'Label B' }

    expect(txLabel.equals(sameApiObject)).toBe(true)
    expect(txLabel.equals(differentApiObject)).toBe(false)
  })

  // Test: mergeExisting updates TxLabel when `ei.updated_at` is newer
  test('5_mergeExisting_updates_txLabel_when_ei_updated_at_is_newer', async () => {
    for (const { activeStorage } of ctxs) {
      const txLabel = new TxLabel({
        txLabelId: 1,
        label: 'Old Label',
        userId: 100,
        isDeleted: false,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      })

      await activeStorage.insertTxLabel(txLabel.toApi())

      const updatedEi: table.TxLabel = {
        txLabelId: 1,
        label: 'Updated Label',
        userId: 100,
        isDeleted: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-02-01')
      }

      const result = await txLabel.mergeExisting(activeStorage, undefined, updatedEi, {} as any)

      const updatedTxLabel = await activeStorage.findTxLabelById(txLabel.id)

      expect(result).toBe(true)
      expect(updatedTxLabel?.label).toBe('Updated Label')
      expect(updatedTxLabel?.isDeleted).toBe(true)
      expect(updatedTxLabel?.updated_at).toEqual(txLabel.updated_at)
    }
  })

  // Test: mergeExisting does not update TxLabel when `ei.updated_at` is older
  test('6_mergeExisting_does_not_update_txLabel_when_ei_updated_at_is_older', async () => {
    for (const { activeStorage } of ctxs) {
      const txLabel = new TxLabel({
        txLabelId: 1,
        label: 'Original Label',
        userId: 100,
        isDeleted: false,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-02-01')
      })

      await activeStorage.insertTxLabel(txLabel.toApi())

      const olderEi: table.TxLabel = {
        txLabelId: 1,
        label: 'Outdated Label',
        userId: 100,
        isDeleted: true,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }

      const result = await txLabel.mergeExisting(activeStorage, undefined, olderEi, {} as any)

      const reloadedTxLabel = await activeStorage.findTxLabelById(txLabel.id)

      expect(result).toBe(false)
      expect(reloadedTxLabel?.label).toBe('Original Label')
      expect(reloadedTxLabel?.isDeleted).toBe(false)
      expect(reloadedTxLabel?.updated_at).toEqual(new Date('2023-02-01'))
    }
  })
})
