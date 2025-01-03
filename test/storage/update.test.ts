import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table, verifyOne } from '../../src'
import { ProvenTxReqStatus } from '../../src/sdk'
import { log, normalizeDate, setLogging, triggerForeignKeyConstraintError, triggerUniqueConstraintError, updateTable, validateUpdateTime, verifyValues } from '../utils/testUtilsUpdate'
import { act } from 'react'
import { ProvenTx, ProvenTxReq, User, Certificate } from '../../src/storage/schema/tables'

setLogging(true)

describe('update tests', () => {
  jest.setTimeout(99999999)

  const storages: StorageBase[] = []
  const chain: sdk.Chain = 'test'
  const setups: { setup: TestSetup1; storage: StorageBase }[] = []

  beforeAll(async () => {
    const localSQLiteFile = await _tu.newTmpFile('updatetest.sqlite', false, false, true)
    const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
    storages.push(new StorageKnex({ chain, knex: knexSQLite }))

    // const knexMySQL = _tu.createLocalMySQL('updatetest')
    // storages.push(new StorageKnex({ chain, knex: knexMySQL }))

    for (const storage of storages) {
      await storage.dropAllData()
      await storage.migrate('insert tests')
      setups.push({ storage, setup: await _tu.createTestSetup1(storage) })
    }
  })

  afterAll(async () => {
    for (const storage of storages) {
      await storage.destroy()
    }
  })

  const schemaMetadata = {
    provenTxs: { primaryKey: 'provenTxId' },
    provenTxReqs: { primaryKey: 'provenTxReqId' },
    users: { primaryKey: 'userId' },
    certificates: { primaryKey: 'certificateId' },
    transactions: { primaryKey: 'txid' },
    outputs: { primaryKey: 'outputId' },
    labels: { primaryKey: 'labelId' },
    watchmanEvents: { primaryKey: 'eventId' }
  }

  test('0 find ProvenTx', async () => {
    const primaryKey = schemaMetadata.provenTxs.primaryKey // Dynamically identify the primary key
    for (const { storage, setup } of setups) {
      const referenceTime = new Date() // Capture time before updates

      // Fetch all proven transactions
      const r = await storage.findProvenTxs({})
      for (const e of r) {
        try {
          // TBD optoinal params?
          const testValues: ProvenTx = {
            provenTxId: e.provenTxId,
            txid: 'mockTxid',
            blockHash: 'mockBlockHash',
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z'),
            height: 12345,
            index: 1,
            merklePath: [1, 2, 3, 4],
            rawTx: [4, 3, 2, 1],
            merkleRoot: '1234'
          }

          // Update the entry with test values
          await updateTable(storage.updateProvenTx.bind(storage), e[primaryKey], testValues)

          // Verify that the updated entry matches the test values
          const updatedTx = verifyOne(await storage.findProvenTxs({ [primaryKey]: e[primaryKey] }))
          verifyValues(updatedTx, testValues, referenceTime)

          // Test each field for valid and invalid updates
          for (const [key, value] of Object.entries(testValues)) {
            if (key === primaryKey) {
              // Skip testing updates to the primary key as they are invalid operations
              continue
            }

            if (typeof value === 'string') {
              const validString = `valid${key}`
              const r1 = await storage.updateProvenTx(e[primaryKey], { [key]: validString })
              expect(r1).toBe(1)

              const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: e[primaryKey] }))
              expect(updatedRow[key]).toBe(validString)
            }

            if (typeof value === 'number') {
              const validNumber = value + 1
              const r1 = await storage.updateProvenTx(e[primaryKey], { [key]: validNumber })
              expect(r1).toBe(1)

              const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: e[primaryKey] }))
              expect(updatedRow[key]).toBe(validNumber)
            }

            if (value instanceof Date) {
              const validDate = new Date('2024-12-31T00:00:00Z')
              const r1 = await storage.updateProvenTx(e[primaryKey], { [key]: validDate })
              expect(r1).toBe(1)

              const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: e[primaryKey] }))
              expect(new Date(updatedRow[key]).toISOString()).toBe(validDate.toISOString())
            }

            if (Array.isArray(value)) {
              const validArray = value.map(v => v + 1)
              const r1 = await storage.updateProvenTx(e[primaryKey], { [key]: validArray })
              expect(r1).toBe(1)

              const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: e[primaryKey] }))
              expect(updatedRow[key]).toEqual(validArray)
            }
          }
        } catch (error: any) {
          console.error(`Error updating or verifying ProvenTx record with ${primaryKey}=${e[primaryKey]}:`, error.message)
          throw error // Re-throw unexpected errors to fail the test
        }
      }
    }
  })

  test('001 ProvenTx set created_at and updated_at time', async () => {
    // TBD implement timer to emulate locking records tec.
    for (const { storage } of setups) {
      const scenarios = [
        {
          description: 'Invalid created_at time',
          updates: {
            created_at: new Date('3000-01-01T00:00:00Z'), // Unrealistic future time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        },
        {
          description: 'Invalid updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('3000-01-01T00:00:00Z') // Unrealistic future time
          }
        },
        {
          description: 'created_at time overwrites updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        }
      ]

      for (const { description, updates } of scenarios) {
        const referenceTime = new Date() // Capture time before updates

        const r = await storage.findProvenTxs({})
        for (const e of r) {
          // Update fields based on the scenario
          await storage.updateProvenTx(e.provenTxId, { created_at: updates.created_at })
          await storage.updateProvenTx(e.provenTxId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))

          // Log the scenario for better test output
          log(`Testing scenario: ${description}`)

          // Validate times using `validateUpdateTime`
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime, 10, false)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime, 10, false)).toBe(true)
        }
      }
    }
  })

  test('002 ProvenTx setting individual values', async () => {
    for (const { storage, setup } of setups) {
      // There is only 1 row in table so it is necessay to insert another row to perform unique constraint test
      const initialRecord: ProvenTx = {
        provenTxId: 2,
        txid: 'mockTxid',
        height: 1,
        index: 1,
        merklePath: [],
        blockHash: '',
        created_at: new Date(),
        updated_at: new Date(),
        rawTx: [],
        merkleRoot: ''
      }

      try {
        const r = await storage.insertProvenTx(initialRecord)
        expect(r).toBeGreaterThan(1)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Cant set id 1 to zero due to ref by provenTxReq
      await expect(storage.updateProvenTx(1, { provenTxId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Can set id to zero
      const r1 = await storage.updateProvenTx(2, { provenTxId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)
      const r2 = await storage.findProvenTxs({})
      expect(r2[0].provenTxId).toBe(0)
      expect(r2[1].provenTxId).toBe(1)

      // Reset id to back to original
      const r3 = await storage.updateProvenTx(0, { provenTxId: 2 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)
      const r4 = await storage.findProvenTxs({})
      expect(r4[0].provenTxId).toBe(1)
      expect(r4[1].provenTxId).toBe(2)

      // Set id random value
      const r5 = await storage.updateProvenTx(2, { provenTxId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)
      const r6 = await storage.findProvenTxs({})
      expect(r6[0].provenTxId).toBe(1)
      expect(r6[1].provenTxId).toBe(9999)

      // Try to set other record id to same random id
      await expect(storage.updateProvenTx(1, { provenTxId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)
      const r7 = await storage.findProvenTxs({})
      expect(r7[0].provenTxId).toBe(1)
      expect(r7[1].provenTxId).toBe(9999)

      // Update random id record with valid unique field
      const r8 = await storage.updateProvenTx(9999, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)
      const r9 = await storage.findProvenTxs({})
      expect(r9[0].txid).not.toBe('mockValidTxid')
      expect(r9[1].txid).toBe('mockValidTxid')

      // Check original id record cannot be updated with same unique field
      const r10 = await storage.updateProvenTx(2, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r10)).resolves.toBe(0)
      const r11 = await storage.findProvenTxs({})
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Try to update first record field with same unique field
      await expect(storage.updateProvenTx(1, { txid: 'mockValidTxid' })).rejects.toThrow(/UNIQUE constraint failed/)
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Update random id with undefined unique no null field
      const r12 = await storage.updateProvenTx(9999, { txid: undefined })
      await expect(Promise.resolve(r12)).resolves.toBe(1)
      const r13 = await storage.findProvenTxs({})
      expect(r13[0].txid).not.toBe('mockValidTxid')
      expect(r13[1].txid).toBe('mockValidTxid')

      // Reset id to back to 2
      const r14 = await storage.updateProvenTx(9999, { provenTxId: 2 })
      await expect(Promise.resolve(r14)).resolves.toBe(1)
      const r15 = await storage.findProvenTxs({})
      expect(r15[0].provenTxId).toBe(1)
      expect(r15[1].provenTxId).toBe(2)

      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r16 = await storage.updateProvenTx(2, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r17 = await storage.updateProvenTx(2, { created_at: futureDate })
      await expect(Promise.resolve(r17)).resolves.toBe(1)

      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r18 = await storage.updateProvenTx(2, { created_at: earlierDate })
      await expect(Promise.resolve(r18)).resolves.toBe(1)
    }
  })

  test('003 ProvenTx trigger DB unique constraint error for provenTxId', async () => {
    for (const { storage, setup } of setups) {
      // There is only 1 row in table so it is necessay to insert another row to perform unique constraint test
      const initialRecord: ProvenTx = {
        provenTxId: 2,
        txid: 'mockDupTxid',
        height: 1,
        index: 1,
        merklePath: [],
        blockHash: '',
        created_at: new Date(),
        updated_at: new Date(),
        rawTx: [],
        merkleRoot: ''
      }

      try {
        const r = await storage.insertProvenTx(initialRecord)
        expect(r).toBeGreaterThan(1)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      await triggerUniqueConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { provenTxId: 2 })
      await triggerUniqueConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { txid: 'mockDupTxid' })
    }
  })

  test('1 find ProvenTxReq', async () => {
    const primaryKey = schemaMetadata.provenTxReqs.primaryKey

    for (const { storage, setup } of setups) {
      const r = await storage.findProvenTxReqs({})

      for (const e of r) {
        try {
          const testValues: ProvenTxReq = {
            provenTxReqId: e.provenTxReqId || 0,
            status: 'completed' as ProvenTxReqStatus,
            history: JSON.stringify({ validated: true, timestamp: Date.now() }),
            notify: JSON.stringify({ email: 'test@example.com', sent: true }),
            rawTx: [1, 2, 3, 4],
            inputBEEF: [5, 6, 7, 8],
            attempts: 3,
            notified: true,
            txid: `mockTxid-${Date.now()}`,
            batch: `batch-001`,
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z')
          }

          // Update all fields in one go
          const r1 = await storage.updateProvenTxReq(e[primaryKey], testValues)
          expect(r1).toBe(1) // Expect one row updated

          // Fetch the updated row for validation
          const updatedRow = verifyOne(await storage.findProvenTxReqs({ [primaryKey]: e[primaryKey] }))
          for (const [key, value] of Object.entries(testValues)) {
            const actualValue = updatedRow[key]

            // Handle Date fields by normalizing both sides
            const normalizedActual = normalizeDate(actualValue)
            const normalizedExpected = normalizeDate(value)
            if (normalizedActual && normalizedExpected) {
              expect(normalizedActual).toBe(normalizedExpected)
              continue
            }

            // Handle JSON strings
            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
              expect(JSON.parse(actualValue)).toStrictEqual(JSON.parse(value))
              continue
            }

            // Handle primitive types directly
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              expect(actualValue).toBe(value)
              continue
            }

            // Handle Buffer-like objects
            if (typeof actualValue === 'object' && actualValue?.type === 'Buffer') {
              const actualArray = actualValue.data || actualValue
              const expectedArray = Buffer.isBuffer(value) || Array.isArray(value) ? Array.from(value as ArrayLike<number>) : value
              expect(actualArray).toStrictEqual(expectedArray)
              continue
            }

            // Handle unmatched cases (Buffer fallback handling)
            log('actualValue type is ', typeof actualValue, '=', actualValue)
            log('value type is ', typeof value, '=', value)
            expect(JSON.stringify({ type: 'Buffer', data: actualValue })).toStrictEqual(JSON.stringify(value))
          }
        } catch (error: any) {
          console.error(`Error updating or verifying ProvenTxReq record with ${primaryKey}=${e[primaryKey]}:`, error.message)
          throw error // Re-throw unexpected errors to fail the test
        }
      }
    }
  })

  test('101 ProvenTxReq set created_at and updated_at time', async () => {
    for (const { storage } of setups) {
      const scenarios = [
        {
          description: 'Invalid created_at time',
          updates: {
            created_at: new Date('3000-01-01T00:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z')
          }
        },
        {
          description: 'Invalid updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('3000-01-01T00:00:00Z')
          }
        },
        {
          description: 'created_at time overwrites updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z')
          }
        }
      ]

      for (const { description, updates } of scenarios) {
        const referenceTime = new Date() // Capture time before updates
        const r = await storage.findProvenTxReqs({})

        for (const e of r) {
          await storage.updateProvenTxReq(e.provenTxReqId, { created_at: updates.created_at })
          await storage.updateProvenTxReq(e.provenTxReqId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  test('102 ProvenTxReq trigger DB unique constraint errors', async () => {
    for (const { storage, setup } of setups) {
      try {
        const r = await storage.updateProvenTxReq(2, { txid: 'mockDupTxid' })
        await expect(Promise.resolve(r)).resolves.toBe(1)
      } catch (error: any) {
        console.error('Error updating second record:', error.message)
        return
      }
      await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { provenTxReqId: 2 })
      await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { txid: 'mockDupTxid' })
    }
  })

  test('103 ProvenTxReq trigger DB foreign constraint error for provenTxId', async () => {
    for (const { storage, setup } of setups) {
      await triggerForeignKeyConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { provenTxId: 0 })
    }
  })

  test('104 ProvenTxReq setting individual values', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date()

      // Test individual values

      // Can set id to zero
      const r1 = await storage.updateProvenTxReq(1, { provenTxReqId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)
      const r2 = await storage.findProvenTxReqs({})
      expect(r2[0].provenTxReqId).toBe(0)
      expect(r2[1].provenTxReqId).toBe(2)

      // Reset id to back to 1
      const r3 = await storage.updateProvenTxReq(0, { provenTxReqId: 1 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)
      const r4 = await storage.findProvenTxReqs({})
      expect(r4[0].provenTxReqId).toBe(1)
      expect(r4[1].provenTxReqId).toBe(2)

      // Set id random value
      const r5 = await storage.updateProvenTxReq(1, { provenTxReqId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)
      const r6 = await storage.findProvenTxReqs({})
      // Note: Now second record returned
      expect(r6[0].provenTxReqId).toBe(2)
      expect(r6[1].provenTxReqId).toBe(9999)

      // Try to set other record id to same random id
      await expect(storage.updateProvenTxReq(2, { provenTxReqId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)
      const r7 = await storage.findProvenTxReqs({})
      expect(r7[0].provenTxReqId).not.toBe(9999)
      expect(r7[1].provenTxReqId).toBe(9999)

      // Update random id record with valid unique field
      const r8 = await storage.updateProvenTxReq(9999, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)
      const r9 = await storage.findProvenTxReqs({})
      expect(r9[0].txid).not.toBe('mockValidTxid')
      expect(r9[1].txid).toBe('mockValidTxid')

      // Check original id 1 record cannot be updated with same field
      const r10 = await storage.updateProvenTxReq(1, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r10)).resolves.toBe(0)
      const r11 = await storage.findProvenTxReqs({})
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Try to update second record field with same value
      await expect(storage.updateProvenTxReq(2, { txid: 'mockValidTxid' })).rejects.toThrow(/UNIQUE constraint failed/)
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Update random id with undefined unique no null field
      const r12 = await storage.updateProvenTxReq(9999, { txid: undefined })
      await expect(Promise.resolve(r12)).resolves.toBe(1)
      const r13 = await storage.findProvenTxReqs({})
      expect(r13[0].txid).not.toBe('mockValidTxid')
      expect(r13[1].txid).toBe('mockValidTxid')

      // Reset id to back to 1
      const r14 = await storage.updateProvenTxReq(9999, { provenTxReqId: 1 })
      await expect(Promise.resolve(r14)).resolves.toBe(1)
      const r15 = await storage.findProvenTxReqs({})
      // Note: Now id 1 first record returned
      expect(r15[0].provenTxReqId).toBe(1)
      expect(r15[1].provenTxReqId).toBe(2)

      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r16 = await storage.updateProvenTxReq(1, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r17 = await storage.updateProvenTxReq(1, { created_at: futureDate })
      await expect(Promise.resolve(r17)).resolves.toBe(1)

      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r18 = await storage.updateProvenTxReq(1, { created_at: earlierDate })
      await expect(Promise.resolve(r18)).resolves.toBe(1)
    }
  })

  test('2 find User', async () => {
    const primaryKey = 'userId' // Define primary key for the User table

    for (const { storage, setup } of setups) {
      const r = await storage.findUsers({})
      log('Initial User records:', r)

      for (const e of r) {
        log(`Testing updates for User with ${primaryKey}=${e[primaryKey]}`)

        try {
          const testValues: User = {
            userId: e.userId,
            identityKey: `mockUpdatedIdentityKey-${e[primaryKey]}`,
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z')
          }

          log(`Attempting update with values for ${primaryKey}=${e[primaryKey]}:`, testValues)

          // Perform the update
          const updateResult = await storage.updateUser(e[primaryKey], testValues)
          log(`Update result for ${primaryKey}=${e[primaryKey]}:`, updateResult)
          expect(updateResult).toBe(1)

          // Fetch and validate the updated record
          const updatedRow = verifyOne(await storage.findUsers({ [primaryKey]: e[primaryKey] }))
          log(`Updated User record for ${primaryKey}=${e[primaryKey]}:`, updatedRow)

          // Validate each field
          for (const [key, value] of Object.entries(testValues)) {
            const actualValue = updatedRow[key]

            // Handle Date fields by normalizing both sides
            const normalizedActual = normalizeDate(actualValue)
            const normalizedExpected = normalizeDate(value)
            if (normalizedActual && normalizedExpected) {
              expect(normalizedActual).toBe(normalizedExpected)
              continue
            }

            // Handle primitive types directly
            expect(actualValue).toBe(value)
          }

          // Test UNIQUE constraint violation
          const duplicateValues: Partial<User> = {
            identityKey: `mockUpdatedIdentityKey-${e[primaryKey]}` // Use duplicate identityKey from the same update
          }
        } catch (error: any) {
          console.error(`Error updating or verifying User record with ${primaryKey}=${e[primaryKey]}:`, error.message)
          throw error // Re-throw unexpected errors to fail the test
        }
      }
    }
  })

  test('201 User set created_at and updated_at time', async () => {
    for (const { storage } of setups) {
      const scenarios = [
        {
          description: 'Invalid created_at time',
          updates: {
            created_at: new Date('3000-01-01T00:00:00Z'), // Unrealistic future time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        },
        {
          description: 'Invalid updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('3000-01-01T00:00:00Z') // Unrealistic future time
          }
        },
        {
          description: 'created_at time overwrites updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        }
      ]

      for (const { description, updates } of scenarios) {
        const referenceTime = new Date() // Capture time before updates

        const r = await storage.findUsers({})
        for (const e of r) {
          // Update fields based on the scenario
          await storage.updateUser(e.userId, { created_at: updates.created_at })
          await storage.updateUser(e.userId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findUsers({ userId: e.userId }))

          // Log the scenario for better test output
          log(`Testing scenario: ${description}`)

          // Validate times using `validateUpdateTime`
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  test('202 User trigger DB unique constraint errors', async () => {
    for (const { storage, setup } of setups) {
      try {
        const r = await storage.updateUser(2, { identityKey: 'mockDupIdentityKey' })
        await expect(Promise.resolve(r)).resolves.toBe(1)
      } catch (error: any) {
        console.error('Error updating second record:', error.message)
        return
      }
      await triggerUniqueConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { userId: 2 })
      await triggerUniqueConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { identityKey: 'mockDupIdentityKey' })
    }
  })

  test('203 User trigger DB foreign constraint error for', async () => {
    for (const { storage, setup } of setups) {
      await triggerForeignKeyConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { userId: 0 }, true)
    }
  })

  test('204 User setting individual values', async () => {
    for (const { storage, setup } of setups) {
      // Test individual values

      // The current records are used by other tables so it is necessay to insert another row to perform individual tests
      const initialRecord: User = {
        created_at: new Date(),
        updated_at: new Date(),
        userId: 3,
        identityKey: ''
      }

      try {
        const r = await storage.insertUser(initialRecord)
        expect(r).toBeGreaterThan(1)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Cant set first record id to zero due to ref by other tables
      await expect(storage.updateUser(1, { userId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Cant set second record id to zero due to ref by other tables
      await expect(storage.updateUser(2, { userId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Can set third record to zero
      const r1 = await storage.updateUser(3, { userId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)
      const r2 = await storage.findUsers({})
      expect(r2[0].userId).toBe(0)
      expect(r2[1].userId).toBe(1)
      expect(r2[2].userId).toBe(2)

      // Reset back to original
      const r3 = await storage.updateUser(0, { userId: 3 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)
      const r4 = await storage.findUsers({})
      expect(r4[0].userId).toBe(1)
      expect(r4[1].userId).toBe(2)
      expect(r4[2].userId).toBe(3)

      // Set record id to random value
      const r5 = await storage.updateUser(3, { userId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)
      const r6 = await storage.findUsers({})
      expect(r6[0].userId).toBe(1)
      expect(r6[1].userId).toBe(2)
      expect(r6[2].userId).toBe(9999)

      // Try to set other record id to same random id
      await expect(storage.updateUser(1, { userId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)
      const r7 = await storage.findUsers({})
      expect(r7[0].userId).toBe(1)
      expect(r7[1].userId).toBe(2)
      expect(r7[2].userId).toBe(9999)

      // Update random id record with valid unique field
      const r8 = await storage.updateUser(9999, { identityKey: 'mockValidIdentityKey' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)
      const r9 = await storage.findUsers({})
      expect(r9[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r9[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r9[2].identityKey).toBe('mockValidIdentityKey')

      // Check original id record cannot be updated with same field
      const r10 = await storage.updateUser(3, { identityKey: 'mockValidIdentityKey' })
      await expect(Promise.resolve(r10)).resolves.toBe(0)
      const r11 = await storage.findUsers({})
      expect(r11[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r11[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r11[2].identityKey).toBe('mockValidIdentityKey')

      // Try to update second record field with same value
      await expect(storage.updateUser(2, { identityKey: 'mockValidIdentityKey' })).rejects.toThrow(/UNIQUE constraint failed/)
      expect(r11[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r11[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r11[2].identityKey).toBe('mockValidIdentityKey')

      // Update random id with undefined unique no null field
      const r12 = await storage.updateUser(9999, { identityKey: undefined })
      await expect(Promise.resolve(r12)).resolves.toBe(1)
      const r13 = await storage.findUsers({})
      expect(r13[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r13[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r13[2].identityKey).toBe('mockValidIdentityKey')

      // Reset id to back to 1
      const r14 = await storage.updateUser(9999, { userId: 3 })
      await expect(Promise.resolve(r14)).resolves.toBe(1)
      const r15 = await storage.findUsers({})
      // Note: Now id 1 first record returned
      expect(r15[0].userId).toBe(1)
      expect(r15[1].userId).toBe(2)
      expect(r15[2].userId).toBe(3)

      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r16 = await storage.updateUser(1, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r17 = await storage.updateUser(1, { created_at: futureDate })
      await expect(Promise.resolve(r17)).resolves.toBe(1)

      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r18 = await storage.updateUser(1, { created_at: earlierDate })
      await expect(Promise.resolve(r18)).resolves.toBe(1)
    }
  })

  test('3 find Certificate', async () => {
    for (const { storage, setup } of setups) {
      const primaryKey = schemaMetadata.certificates.primaryKey

      const r = await storage.findCertificates({})
      log('Initial Certificate records:', r)

      for (const e of r) {
        log(`Testing updates for Certificate with ${primaryKey}=${e[primaryKey]}`)

        try {
          const testValues: Certificate = {
            certificateId: e.certificateId,
            userId: 1,
            type: `mockType${e.certificateId}`,
            serialNumber: `mockSerialNumber${e.certificateId}`,
            certifier: `mockCertifier${e.certificateId}`,
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z'),
            subject: 'mockSubject',
            revocationOutpoint: 'mockRevocationOutpoint',
            signature: 'mockSignature',
            isDeleted: false
          }

          // Update all fields in one go
          const r1 = await storage.updateCertificate(e[primaryKey], testValues)
          expect(r1).toBe(1) // Expect one row updated

          // Fetch the updated row for validation
          const updatedRow = verifyOne(await storage.findCertificates({ [primaryKey]: e[primaryKey] }))
          for (const [key, value] of Object.entries(testValues)) {
            const actualValue = updatedRow[key]

            // Handle Date fields by normalizing both sides
            const normalizedActual = normalizeDate(actualValue)
            const normalizedExpected = normalizeDate(value)
            if (normalizedActual && normalizedExpected) {
              expect(normalizedActual).toBe(normalizedExpected)
              continue
            }

            // Handle JSON strings
            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
              expect(JSON.parse(actualValue)).toStrictEqual(JSON.parse(value))
              continue
            }

            // Handle primitive types directly
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              expect(actualValue).toBe(value)
              continue
            }

            // Handle Buffer-like objects
            if (typeof actualValue === 'object' && actualValue?.type === 'Buffer') {
              const actualArray = actualValue.data || actualValue
              const expectedArray = Buffer.isBuffer(value) || Array.isArray(value) ? Array.from(value as ArrayLike<number>) : value
              expect(actualArray).toStrictEqual(expectedArray)
              continue
            }

            // Handle unmatched cases (Buffer fallback handling)
            log('actualValue type is ', typeof actualValue, '=', actualValue)
            log('value type is ', typeof value, '=', value)
            expect(JSON.stringify({ type: 'Buffer', data: actualValue })).toStrictEqual(JSON.stringify(value))
          }
        } catch (error: any) {
          console.error(`Error updating or verifying Certificate record with ${primaryKey}=${e[primaryKey]}:`, error.message)
          throw error // Re-throw unexpected errors to fail the test
        }
      }
    }
  })

  test('301 Certificate set created_at and updated_at time', async () => {
    for (const { storage } of setups) {
      const scenarios = [
        {
          description: 'Invalid created_at time',
          updates: {
            created_at: new Date('3000-01-01T00:00:00Z'), // Unrealistic future time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        },
        {
          description: 'Invalid updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('3000-01-01T00:00:00Z') // Unrealistic future time
          }
        },
        {
          description: 'created_at time overwrites updated_at time',
          updates: {
            created_at: new Date('2024-12-30T23:00:00Z'), // Hardcoded creation time
            updated_at: new Date('2024-12-30T23:05:00Z') // Hardcoded update time
          }
        }
      ]

      for (const { description, updates } of scenarios) {
        const referenceTime = new Date() // Capture time before updates

        const r = await storage.findCertificates({})
        for (const e of r) {
          // Update fields based on the scenario
          await storage.updateUser(e.certificateId, { created_at: updates.created_at })
          await storage.updateUser(e.certificateId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findCertificates({ certificateId: e.certificateId }))

          // Log the scenario for better test output
          log(`Testing scenario: ${description}`)

          // Validate times using `validateUpdateTime`
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  test('302 Certificate trigger DB unique constraint errors', async () => {
    for (const { storage, setup } of setups) {
      // Multi-field combined constrant
      const initInvalidValues = {
        userId: 2,
        type: `mockType2`,
        certifier: `mockCertifier2`,
        serialNumber: `mockSerialNumber2`
      }

      try {
        const r = await storage.updateCertificate(2, initInvalidValues)
        await expect(Promise.resolve(r)).resolves.toBe(1)
      } catch (error: any) {
        console.error('Error updating second record:', error.message)
      }

      // Have to create additional object as update method adds update_at to the object?
      const invalidValues = {
        userId: 2,
        type: `mockType2`,
        certifier: `mockCertifier2`,
        serialNumber: `mockSerialNumber2`
      }

      await triggerUniqueConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { certificateId: 2 })
      await triggerUniqueConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', invalidValues)
    }
  })

  test('4 find CertificateField', async () => {
    for (const { storage, setup } of setups) {
      // Fetch certificate fields with a specific field name
      const certificateFields = await storage.findCertificateFields({ fieldName: 'bob' })

      // Ensure there are results to test
      expect(certificateFields.length).toBeGreaterThan(0)

      for (const field of certificateFields) {
        const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
        const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time, 5 minutes later

        // Perform updates on the certificate field
        await storage.updateCertificateField(field.certificateId, field.fieldName, { created_at: createdTime })
        await storage.updateCertificateField(field.certificateId, field.fieldName, { updated_at: updatedTime })
        await storage.updateCertificateField(field.certificateId, field.fieldName, { fieldName: 'updatedFieldName' })
        await storage.updateCertificateField(field.certificateId, field.fieldName, { fieldValue: 'updatedFieldValue' })

        // Update with empty object to test ignored updates
        await storage.updateCertificateField(field.certificateId, field.fieldName, {})
        await storage.updateCertificateField(0, 'invalidFieldName', {}) // Test invalid update

        // Fetch and verify the updated certificate field
        const updatedFields = await storage.findCertificateFields({
          certificateId: field.certificateId,
          fieldName: 'updatedFieldName'
        })

        // Ensure the updatedFields array contains exactly one result
        expect(updatedFields.length).toBe(0)

        const verifiedField = updatedFields[0]
        expect(verifiedField.certificateId).toBe(field.certificateId)
        expect(verifiedField.fieldName).toBe('updatedFieldName')
        //expect(verifiedField.fieldValue).toBe('updatedFieldValue')
        expect(new Date(verifiedField.created_at.getTime())).toStrictEqual(new Date(createdTime.getTime()))
        expect(new Date(verifiedField.updated_at.getTime())).toStrictEqual(new Date(updatedTime.getTime()))
      }
    }
  })

  test('5 find OutputBasket', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputBaskets({}, setup.u1.created_at)
    }
  })

  test('6 find Transaction', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTransactions({})
    }
  })

  test('7 find Commission', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findCommissions({})
    }
  })

  test('8 find Output', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputs({})
    }
  })

  test('9 find OutputTag', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputTags({})
    }
  })

  test('10 find OutputTagMap', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findOutputTagMaps({})
    }
  })

  test('11 find TxLabel', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTxLabels({})
    }
  })

  test('12 find TxLabelMap', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findTxLabelMaps({})
    }
  })

  test('13 find WatchmanEvent', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findWatchmanEvents({})
    }
  })

  test('14 find SyncState', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findSyncStates({})
    }
  })
})
