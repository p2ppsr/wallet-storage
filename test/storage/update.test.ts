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
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z'),
            blockHash: 'mockBlockHash',
            height: 12345,
            index: 1,
            merklePath: [1, 2, 3, 4],
            merkleRoot: '1234',
            rawTx: [4, 3, 2, 1]
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
      // Step 1: Insert initial record with mock data.
      const initialRecord: ProvenTx = {
        provenTxId: 2,
        txid: 'mockTxid',
        created_at: new Date(),
        updated_at: new Date(),
        blockHash: '',
        height: 1,
        index: 1,
        merklePath: [],
        merkleRoot: '',
        rawTx: []
      }

      try {
        // Insert the initial record
        const r = await storage.insertProvenTx(initialRecord)
        expect(r).toBeGreaterThan(0) // Ensure the insertion was successful

        // Ensure the record exists in the database after insertion
        const insertedRecord = await storage.findProvenTxs({})
        expect(insertedRecord.length).toBeGreaterThan(0) // Ensure the record is inserted

        // Verify the inserted record has the correct data
        const foundRecord = insertedRecord.find(record => record.provenTxId === 2)
        expect(foundRecord).toBeDefined() // Ensure the specific record is found
        expect(foundRecord?.txid).toBe('mockTxid') // Ensure the data matches
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Test Foreign Key constraint failure (updating record with invalid foreign key)
      await expect(storage.updateProvenTx(1, { provenTxId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Step 3: Test setting valid ID to zero and check if update works as expected
      const r1 = await storage.updateProvenTx(2, { provenTxId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)

      // Step 4: Verify the updated record (Check provenTxId was updated to zero)
      const r2 = await storage.findProvenTxs({})
      expect(r2[0].provenTxId).toBe(0)
      expect(r2[1].provenTxId).toBe(1)

      // Step 5: Reset the id back to original value.
      const r3 = await storage.updateProvenTx(0, { provenTxId: 2 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)

      // Step 6: Verify after resetting id, the database should reflect the correct values.
      const r4 = await storage.findProvenTxs({})
      expect(r4[0].provenTxId).toBe(1)
      expect(r4[1].provenTxId).toBe(2)

      // Step 7: Set a random id to test the unique constraint.
      const r5 = await storage.updateProvenTx(2, { provenTxId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)

      // Step 8: Verify the update was successful.
      const r6 = await storage.findProvenTxs({})
      expect(r6[0].provenTxId).toBe(1)
      expect(r6[1].provenTxId).toBe(9999)

      // Step 9: Try to set the same provenTxId to another record, expect unique constraint violation.
      await expect(storage.updateProvenTx(1, { provenTxId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 10: Verify no change in the records after violation
      const r7 = await storage.findProvenTxs({})
      expect(r7[0].provenTxId).toBe(1)
      expect(r7[1].provenTxId).toBe(9999)

      // Step 11: Update record with a valid unique field (txid).
      const r8 = await storage.updateProvenTx(9999, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)

      // Step 12: Check if the txid was updated as expected
      const r9 = await storage.findProvenTxs({})
      expect(r9[0].txid).not.toBe('mockValidTxid')
      expect(r9[1].txid).toBe('mockValidTxid')

      // Step 13: Check original id cannot be updated with same unique field.
      const r10 = await storage.updateProvenTx(2, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r10)).resolves.toBe(0)

      // Step 14: Verify that the txid on the original record is not updated
      const r11 = await storage.findProvenTxs({})
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Step 15: Try to update the first record with the same unique field, expect a unique constraint violation.
      await expect(storage.updateProvenTx(1, { txid: 'mockValidTxid' })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 16: Verify that no change happens in the records after the violation.
      expect(r11[0].txid).not.toBe('mockValidTxid')
      expect(r11[1].txid).toBe('mockValidTxid')

      // Step 17: Update the random record with undefined (no value) for a unique field.
      const r12 = await storage.updateProvenTx(9999, { txid: undefined })
      await expect(Promise.resolve(r12)).resolves.toBe(1)

      // Step 18: Verify that the txid is set to undefined for the random record.
      const r13 = await storage.findProvenTxs({})
      expect(r13[0].txid).not.toBe('mockValidTxid')
      expect(r13[1].txid).toBe('mockValidTxid')

      // Step 19: Reset the id of random record back to 2.
      const r14 = await storage.updateProvenTx(9999, { provenTxId: 2 })
      await expect(Promise.resolve(r14)).resolves.toBe(1)

      // Step 20: Verify the id has been reset to 2.
      const r15 = await storage.findProvenTxs({})
      expect(r15[0].provenTxId).toBe(1)
      expect(r15[1].provenTxId).toBe(2)

      // Step 21: Update the created_at and updated_at fields to test date updates.
      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r16 = await storage.updateProvenTx(2, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      // Step 22: Test with future date for created_at field
      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r17 = await storage.updateProvenTx(2, { created_at: futureDate })
      await expect(Promise.resolve(r17)).resolves.toBe(1)

      // Step 23: Test with earlier date for created_at field
      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r18 = await storage.updateProvenTx(2, { created_at: earlierDate })
      await expect(Promise.resolve(r18)).resolves.toBe(1)
    }
  })

  test('003 ProvenTx trigger DB unique constraint errors', async () => {
    for (const { storage, setup } of setups) {
      // There is only 1 row in table so it is necessay to insert another row to perform constraint tests
      const initialRecord: ProvenTx = {
        provenTxId: 2,
        txid: 'mockDupTxid',
        created_at: new Date(),
        updated_at: new Date(),
        blockHash: '',
        height: 1,
        index: 1,
        merklePath: [],
        merkleRoot: '',
        rawTx: []
      }

      try {
        const r = await storage.insertProvenTx(initialRecord)
        expect(r).toBeGreaterThan(1)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      const r1 = await triggerUniqueConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { provenTxId: 2 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerUniqueConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { txid: 'mockDupTxid' })
      await expect(Promise.resolve(r2)).resolves.toBe(true)
      const r3 = await triggerUniqueConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { txid: 'mockUniqueTxid' })
      await expect(Promise.resolve(r3)).resolves.toBe(false)
    }
  })

  test('004 ProvenTx trigger DB foreign key constraint errors', async () => {
    for (const { storage, setup } of setups) {
      // There is only 1 row in table so it is necessay to insert another row to perform constraint test
      const initialRecord: ProvenTx = {
        provenTxId: 2,
        txid: 'mockTxid',
        created_at: new Date(),
        updated_at: new Date(),
        blockHash: '',
        height: 1,
        index: 1,
        merklePath: [],
        merkleRoot: '',
        rawTx: []
      }

      try {
        const r = await storage.insertProvenTx(initialRecord)
        expect(r).toBe(2)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      const r1 = await triggerForeignKeyConstraintError(storage, 'findProvenTxs', 'updateProvenTx', 'proven_txs', 'provenTxId', { provenTxId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
    }
  })

  test('1 find ProvenTxReq', async () => {
    const primaryKey = schemaMetadata.provenTxReqs.primaryKey

    for (const { storage, setup } of setups) {
      const r = await storage.findProvenTxReqs({})

      for (const e of r) {
        try {
          const testValues: ProvenTxReq = {
            provenTxReqId: e.provenTxReqId,
            provenTxId: 1,
            batch: `batch-001`,
            status: 'completed',
            txid: `mockTxid-${Date.now()}`,
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z'),
            attempts: 3,
            history: JSON.stringify({ validated: true, timestamp: Date.now() }),
            inputBEEF: [5, 6, 7, 8],
            notified: true,
            notify: JSON.stringify({ email: 'test@example.com', sent: true }),
            rawTx: [1, 2, 3, 4]
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
      const r1 = await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { provenTxReqId: 2 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { txid: 'mockDupTxid' })
      await expect(Promise.resolve(r2)).resolves.toBe(true)
      const r3 = await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { provenTxReqId: 3 })
      await expect(Promise.resolve(r3)).resolves.toBe(false)
      const r4 = await triggerUniqueConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { txid: 'mockUniqueTxid' })
      await expect(Promise.resolve(r4)).resolves.toBe(false)
    }
  })

  test('103 ProvenTxReq trigger DB foreign key constraint errors', async () => {
    for (const { storage, setup } of setups) {
      const r1 = await triggerForeignKeyConstraintError(storage, 'findProvenTxReqs', 'updateProvenTxReq', 'proven_tx_reqs', 'provenTxReqId', { provenTxId: 0 }, 2)
      await expect(Promise.resolve(r1)).resolves.toBe(true)
    }
  })

  test('104 ProvenTxReq setting individual values', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date()

      // Step 1: Insert initial mock data with valid status values.
      const initialRecord: ProvenTxReq = {
        provenTxReqId: 2,
        provenTxId: 1,
        batch: 'batch',
        status: 'nosend', // Using one of the valid status types
        txid: 'mockTxid',
        created_at: referenceTime,
        updated_at: referenceTime,
        attempts: 0,
        history: '{}',
        inputBEEF: [],
        notified: false,
        notify: '{}',
        rawTx: []
      }

      try {
        const r1 = await storage.insertProvenTxReq(initialRecord)
        expect(r1).toBeGreaterThan(0) // Ensure the insertion was successful
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Test Foreign Key constraint failure (updating record with invalid foreign key)
      await expect(storage.updateProvenTxReq(1, { provenTxReqId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Step 3: Test setting valid ID to zero and check if update works as expected
      const r2 = await storage.updateProvenTxReq(2, { provenTxReqId: 0 })
      await expect(Promise.resolve(r2)).resolves.toBe(1)

      // Step 4: Verify the updated record (Check provenTxReqId was updated to zero)
      const r3 = await storage.findProvenTxReqs({})
      expect(r3[0].provenTxReqId).toBe(0)
      expect(r3[1].provenTxReqId).toBe(2)

      // Step 5: Reset id back to original value
      const r4 = await storage.updateProvenTxReq(0, { provenTxReqId: 2 })
      await expect(Promise.resolve(r4)).resolves.toBe(1)

      // Step 6: Verify the database after resetting id
      const r5 = await storage.findProvenTxReqs({})
      expect(r5[0].provenTxReqId).toBe(1)
      expect(r5[1].provenTxReqId).toBe(2)

      // Step 7: Set a random `batch` value to test the unique constraint for `batch`
      const r6 = await storage.updateProvenTxReq(2, { batch: 'uniqueBatch' })
      await expect(Promise.resolve(r6)).resolves.toBe(1)

      // Step 8: Verify the `batch` field update was successful
      const r7 = await storage.findProvenTxReqs({})
      expect(r7[0].batch).not.toBe('uniqueBatch')
      expect(r7[1].batch).toBe('uniqueBatch')

      // Step 9: Try to set the same `batch` value to another record, expect unique constraint violation
      await expect(storage.updateProvenTxReq(1, { batch: 'uniqueBatch' })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 10: Verify no change in the records after violation
      const r8 = await storage.findProvenTxReqs({})
      expect(r8[0].batch).not.toBe('uniqueBatch')
      expect(r8[1].batch).toBe('uniqueBatch')

      // Step 11: Set a random `status` value to test the unique constraint for `status`
      const r9 = await storage.updateProvenTxReq(2, { status: 'sending' }) // Using another valid status value
      await expect(Promise.resolve(r9)).resolves.toBe(1)

      // Step 12: Verify the `status` field update was successful
      const r10 = await storage.findProvenTxReqs({})
      expect(r10[0].status).not.toBe('sending')
      expect(r10[1].status).toBe('sending')

      // Step 13: Try to set the same `status` value to another record, expect unique constraint violation
      await expect(storage.updateProvenTxReq(1, { status: 'sending' })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 14: Verify no change in the records after violation
      const r11 = await storage.findProvenTxReqs({})
      expect(r11[0].status).not.toBe('sending')
      expect(r11[1].status).toBe('sending')

      // Step 15: Update random id record with a valid unique field (txid).
      const r12 = await storage.updateProvenTxReq(9999, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r12)).resolves.toBe(1)

      // Step 16: Check if the txid was updated as expected
      const r13 = await storage.findProvenTxReqs({})
      expect(r13[0].txid).not.toBe('mockValidTxid')
      expect(r13[1].txid).toBe('mockValidTxid')

      // Step 17: Check if original id 1 record cannot be updated with same field
      const r14 = await storage.updateProvenTxReq(1, { txid: 'mockValidTxid' })
      await expect(Promise.resolve(r14)).resolves.toBe(0)

      // Step 18: Verify that no change happens in the records after violation
      const r15 = await storage.findProvenTxReqs({})
      expect(r15[0].txid).not.toBe('mockValidTxid')
      expect(r15[1].txid).toBe('mockValidTxid')

      // Step 19: Try to update second record field with same value
      await expect(storage.updateProvenTxReq(2, { txid: 'mockValidTxid' })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 20: Verify no change in the records after violation
      expect(r15[0].txid).not.toBe('mockValidTxid')
      expect(r15[1].txid).toBe('mockValidTxid')

      // Step 21: Update random id with undefined unique no null field
      const r16 = await storage.updateProvenTxReq(9999, { txid: undefined })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      // Step 22: Verify that the txid is set to undefined for the random record
      const r17 = await storage.findProvenTxReqs({})
      expect(r17[0].txid).not.toBe('mockValidTxid')
      expect(r17[1].txid).toBe('mockValidTxid')

      // Step 23: Reset the id of random record back to 2
      const r18 = await storage.updateProvenTxReq(9999, { provenTxReqId: 2 })
      await expect(Promise.resolve(r18)).resolves.toBe(1)

      // Step 24: Verify the id has been reset to 2
      const r19 = await storage.findProvenTxReqs({})
      expect(r19[0].provenTxReqId).toBe(1)
      expect(r19[1].provenTxReqId).toBe(2)

      // Step 25: Update the created_at and updated_at fields to test date updates
      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r20 = await storage.updateProvenTxReq(2, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r20)).resolves.toBe(1)

      // Step 26: Test with future date for created_at field
      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r21 = await storage.updateProvenTxReq(2, { created_at: futureDate })
      await expect(Promise.resolve(r21)).resolves.toBe(1)

      // Step 27: Test with earlier date for created_at field
      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r22 = await storage.updateProvenTxReq(2, { created_at: earlierDate })
      await expect(Promise.resolve(r22)).resolves.toBe(1)
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
      const r1 = await triggerUniqueConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { userId: 2 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerUniqueConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { identityKey: 'mockDupIdentityKey' })
      await expect(Promise.resolve(r2)).resolves.toBe(true)
      const r3 = await triggerUniqueConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { identityKey: 'mockUniqueIdentityKey' })
      await expect(Promise.resolve(r3)).resolves.toBe(false)
    }
  })

  test('203 User trigger DB foreign key constraint errors', async () => {
    for (const { storage, setup } of setups) {
      const r1 = await triggerForeignKeyConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { userId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerForeignKeyConstraintError(storage, 'findUsers', 'updateUser', 'users', 'userId', { userId: 3 }, 0)
      await expect(Promise.resolve(r2)).resolves.toBe(false)
    }
  })

  test('204 User table setting individual values', async () => {
    for (const { storage, setup } of setups) {
      // Step 1: Insert a new record for testing individual updates.
      // This is necessary because existing records are referenced by other tables.
      const initialRecord: table.User = {
        userId: 3,
        identityKey: '',
        created_at: new Date(),
        updated_at: new Date()
      }

      try {
        const r = await storage.insertUser(initialRecord)
        expect(r).toBeGreaterThan(1) // Ensure the new record was successfully inserted.
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Test attempting to update `userId` to 0 for first record.
      await expect(storage.updateUser(1, { userId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Step 3: Test attempting to update `userId` to 0 for second record.
      await expect(storage.updateUser(2, { userId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Step 4: Update the new record's `userId` to 0 (valid since it's not referenced elsewhere).
      const r1 = await storage.updateUser(3, { userId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)

      // Step 5: Verify the `userId` was updated to 0 for the third record.
      const r2 = await storage.findUsers({})
      expect(r2[0].userId).toBe(0)
      expect(r2[1].userId).toBe(1)
      expect(r2[2].userId).toBe(2)

      // Step 6: Reset the `userId` back to 3.
      const r3 = await storage.updateUser(0, { userId: 3 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)

      // Step 7: Verify that the reset was successful.
      const r4 = await storage.findUsers({})
      expect(r4[0].userId).toBe(1)
      expect(r4[1].userId).toBe(2)
      expect(r4[2].userId).toBe(3)

      // Step 8: Update the new record's `userId` to a random unique value (9999).
      const r5 = await storage.updateUser(3, { userId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)

      // Step 9: Verify the `userId` update was successful.
      const r6 = await storage.findUsers({})
      expect(r6[0].userId).toBe(1)
      expect(r6[1].userId).toBe(2)
      expect(r6[2].userId).toBe(9999)

      // Step 10: Attempt to update another record's `userId` to 9999 (should fail due to unique constraint).
      await expect(storage.updateUser(1, { userId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 11: Verify no changes occurred to the records after the violation.
      const r7 = await storage.findUsers({})
      expect(r7[0].userId).toBe(1)
      expect(r7[1].userId).toBe(2)
      expect(r7[2].userId).toBe(9999)

      // Step 12: Update the `identityKey` of the record with `userId` 9999.
      const r8 = await storage.updateUser(9999, { identityKey: 'mockValidIdentityKey' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)

      // Step 13: Verify the `identityKey` was updated correctly.
      const r9 = await storage.findUsers({})
      expect(r9[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r9[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r9[2].identityKey).toBe('mockValidIdentityKey')

      // Step 14: Attempt to update another record's `identityKey` to the same value (should fail).
      await expect(storage.updateUser(2, { identityKey: 'mockValidIdentityKey' })).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 15: Verify no changes occurred to the records after the violation.
      const r10 = await storage.findUsers({})
      expect(r10[0].identityKey).not.toBe('mockValidIdentityKey')
      expect(r10[1].identityKey).not.toBe('mockValidIdentityKey')
      expect(r10[2].identityKey).toBe('mockValidIdentityKey')

      // Step 16: Reset `userId` of the record with `userId` 9999 back to 3.
      const r11 = await storage.updateUser(9999, { userId: 3 })
      await expect(Promise.resolve(r11)).resolves.toBe(1)

      // Step 17: Verify the reset was successful.
      const r12 = await storage.findUsers({})
      expect(r12[0].userId).toBe(1)
      expect(r12[1].userId).toBe(2)
      expect(r12[2].userId).toBe(3)

      // Step 18: Update the `created_at` and `updated_at` fields.
      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r13 = await storage.updateUser(3, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r13)).resolves.toBe(1)

      // Step 19: Verify the date updates were successful.
      const r14 = await storage.findUsers({})
      const updatedRecord = r14.find(record => record.userId === 3)
      expect(updatedRecord?.created_at).toEqual(createdAt)
      expect(updatedRecord?.updated_at).toEqual(updatedAt)
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
            certifier: `mockCertifier${e.certificateId}`,
            serialNumber: `mockSerialNumber${e.certificateId}`,
            type: `mockType${e.certificateId}`,
            created_at: new Date('2024-12-30T23:00:00Z'),
            updated_at: new Date('2024-12-30T23:05:00Z'),
            isDeleted: false,
            revocationOutpoint: 'mockRevocationOutpoint',
            signature: 'mockSignature',
            subject: 'mockSubject'
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
      const initMockDupValues = {
        userId: 2,
        type: `mockType2`,
        certifier: `mockCertifier2`,
        serialNumber: `mockSerialNumber2`
      }

      try {
        const r = await storage.updateCertificate(2, initMockDupValues)
        await expect(Promise.resolve(r)).resolves.toBe(1)
      } catch (error: any) {
        console.error('Error updating second record:', error.message)
      }

      // Have to create additional object as update method adds update_at to the object?
      const mockDupValues = {
        userId: 2,
        type: `mockType2`,
        certifier: `mockCertifier2`,
        serialNumber: `mockSerialNumber2`
      }

      const mockUniqueValues = {
        userId: 2,
        type: `mockTypeUnique`,
        certifier: `mockCertifier2`,
        serialNumber: `mockSerialNumber2`
      }

      const r1 = await triggerUniqueConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { certificateId: 2 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerUniqueConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', mockDupValues)
      await expect(Promise.resolve(r2)).resolves.toBe(true)
      const r3 = await triggerUniqueConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', mockUniqueValues)
      await expect(Promise.resolve(r3)).resolves.toBe(false)
    }
  })

  test('303 Certificate trigger DB foreign key constraint errors', async () => {
    for (const { storage, setup } of setups) {
      const r1 = await triggerForeignKeyConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { certificateId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(true)
      const r2 = await triggerForeignKeyConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { certificateId: 1 }, 0)
      await expect(Promise.resolve(r2)).resolves.toBe(false)
      const r3 = await triggerForeignKeyConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { userId: 0 })
      await expect(Promise.resolve(r3)).resolves.toBe(true)
      const r4 = await triggerForeignKeyConstraintError(storage, 'findCertificates', 'updateCertificate', 'certificates', 'certificateId', { userId: 1 }, 2)
      await expect(Promise.resolve(r4)).resolves.toBe(false)
    }
  })

  /*
  test('304d Certificate table setting individual values and constraints', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date()

      // Step 1: Insert initial mock data for testing.
      const initialRecord: Certificate = {
        certificateId: 4,
        userId: 1,
        type: 'existingType',
        certifier: 'existingCertifier',
        serialNumber: 'existingSerialNumber',
        subject: 'testSubject',
        verifier: undefined,
        revocationOutpoint: 'testRevocationOutpoint',
        signature: 'testSignature',
        isDeleted: false,
        created_at: referenceTime,
        updated_at: referenceTime
      }

      // Insert the initial data independently for every test.
      try {
        await storage.insertCertificate(initialRecord)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Test setting `certificateId` to zero (should pass if `0` is allowed).
      await storage.insertCertificate({
        ...initialRecord,
        certificateId: 0,
        serialNumber: 'uniqueSerial',
        userId: 5
      }) // Ensure new independent insertion works.

      // Step 3: Verify `certificateId` update to `0`.
      const updatedCertificates = await storage.findCertificates({})
      expect(updatedCertificates.find(record => record.certificateId === 0)).toBeDefined()

      // Step 4: Insert mock data to test composite key uniqueness.
      const initMockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      await storage.insertCertificate({
        ...initialRecord,
        ...initMockDupValues,
        certificateId: 5
      }) // Insert independent data for this step.

      // Step 5: Attempt to create a composite key conflict.
      const mockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      await expect(storage.updateCertificate(4, mockDupValues)).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 6: Test a unique composite key.
      const mockUniqueValues = {
        userId: 2,
        type: 'mockTypeUnique',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      const r6 = await storage.updateCertificate(4, mockUniqueValues)
      expect(r6).toBe(1)

      // Step 7: Verify timestamps update correctly.
      const updatedTime = new Date('2025-01-05T12:00:00Z')
      await storage.updateCertificate(4, { updated_at: updatedTime })

      const r7 = await storage.findCertificates({})
      expect(r7.find(record => record.updated_at?.toISOString() === updatedTime.toISOString())).toBeDefined()

      // Step 8: Test `isDeleted` toggle independently.
      const r8 = await storage.updateCertificate(4, { isDeleted: true })
      expect(r8).toBe(1)

      const r9 = await storage.findCertificates({})
      expect(r9.find(record => record.isDeleted === true)).toBeDefined()

      // Reset for future tests.
      await storage.updateCertificate(4, { isDeleted: false })
      const r10 = await storage.findCertificates({})
      expect(r10.find(record => record.isDeleted === false)).toBeDefined()

      // Additional independent steps for composite keys.
      const compositeKeyValues = {
        userId: 1,
        type: 'existingType',
        certifier: 'existingCertifier',
        serialNumber: 'existingSerialNumber'
      }

      await expect(storage.updateCertificate(4, compositeKeyValues)).rejects.toThrow(/UNIQUE constraint failed/)

      // Further tests here...
    }
  })

  test('304c Certificate table setting individual values and constraints', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date()

      // Step 1: Insert initial mock data for testing.
      const initialRecord: Certificate = {
        certificateId: 4,
        userId: 1,
        type: 'existingType',
        certifier: 'existingCertifier',
        serialNumber: 'existingSerialNumber',
        subject: 'testSubject',
        verifier: undefined,
        revocationOutpoint: 'testRevocationOutpoint',
        signature: 'testSignature',
        isDeleted: false,
        created_at: referenceTime,
        updated_at: referenceTime
      }

      try {
        const r1 = await storage.insertCertificate(initialRecord)
        expect(r1).toBeGreaterThan(0)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Test setting `certificateId` to zero (should pass if `0` is allowed).
      const r2 = await storage.updateCertificate(4, { certificateId: 0 })
      await expect(Promise.resolve(r2)).resolves.toBe(1)

      // Step 3: Verify that the `certificateId` was updated to `0`.
      const updatedCertificates = await storage.findCertificates({})
      expect(updatedCertificates.find(record => record.certificateId === 0)).toBeDefined()

      // Step 3: Test updating `serialNumber` to create a composite key conflict.
      const initMockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      try {
        const r2 = await storage.updateCertificate(2, initMockDupValues)
        await expect(Promise.resolve(r2)).resolves.toBe(1)
      } catch (error: any) {
        console.error('Error updating second record:', error.message)
      }

      const mockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      // Step 4: Try creating a composite key conflict (should fail).
      await expect(storage.updateCertificate(3, mockDupValues)).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 5: Update to a new unique composite key and verify.
      const mockUniqueValues = {
        userId: 2,
        type: 'mockTypeUnique',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      const r3 = await storage.updateCertificate(3, mockUniqueValues)
      await expect(Promise.resolve(r3)).resolves.toBe(1)

      // // Step 6: Update `revocationOutpoint` with a valid value and verify.
      // const r4 = await storage.updateCertificate(4, { revocationOutpoint: 'updatedOutpoint' })
      // await expect(Promise.resolve(r4)).resolves.toBeGreaterThan(0)

      // const r5 = await storage.findCertificates({})
      // expect(r5.find(record => record.revocationOutpoint === 'updatedOutpoint')).toBeDefined()

      // // Step 7: Reset `revocationOutpoint` to `null` and verify.
      // const r6 = await storage.updateCertificate(4, { revocationOutpoint: undefined })
      // await expect(Promise.resolve(r6)).resolves.toBe(1)

      // const r7 = await storage.findCertificates({})
      // expect(r7.find(record => record.revocationOutpoint === null)).toBeDefined()

      // Step 8: Test `isDeleted` toggle.
      const r8 = await storage.updateCertificate(4, { isDeleted: true })
      await expect(Promise.resolve(r8)).resolves.toBe(1)

      const r9 = await storage.findCertificates({})
      expect(r9.find(record => record.isDeleted === true)).toBeDefined()

      const r10 = await storage.updateCertificate(4, { isDeleted: false })
      await expect(Promise.resolve(r10)).resolves.toBe(1)

      const r11 = await storage.findCertificates({})
      expect(r11.find(record => record.isDeleted === false)).toBeDefined()

      // Step 9: Verify timestamps are updated correctly.
      const updatedTime = new Date('2025-01-05T12:00:00Z')
      const r12 = await storage.updateCertificate(4, { updated_at: updatedTime })
      await expect(Promise.resolve(r12)).resolves.toBe(1)

      const r13 = await storage.findCertificates({})
      expect(r13.find(record => record.updated_at?.toISOString() === updatedTime.toISOString())).toBeDefined()

      // Additional combined field tests for composite key uniqueness.
      const compositeKeyValues = {
        userId: 1,
        type: 'existingType',
        certifier: 'existingCertifier',
        serialNumber: 'existingSerialNumber'
      }

      // Step 10: Try to create a composite key conflict on `certificateId: 4`.
      await expect(storage.updateCertificate(4, compositeKeyValues)).rejects.toThrow(/UNIQUE constraint failed/)

      // Other tests from here...

      // Ensure all composite keys and field-level constraints are verified at every step.
    }
  })

  test('304b Certificate table setting individual values and constraints', async () => {
    for (const { storage, setup } of setups) {
      // Test combined constraints on multiple fields.

      // Step 1: Initialize mock data for a duplicate composite key scenario.
      const initMockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2'
      }

      // Step 2: Update the second record to have the duplicate composite key.
      try {
        const r = await storage.updateCertificate(2, initMockDupValues)
        await expect(Promise.resolve(r)).resolves.toBe(1) // Ensure the update works for a valid unique key combination.
      } catch (error: any) {
        console.error('Error updating second record:', error.message) // Log if there are unexpected errors.
      }

      // Step 3: Define mock duplicate values to trigger the composite key constraint violation.
      const mockDupValues = {
        userId: 2,
        type: 'mockType2',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2' // Matches the composite key of the updated second record.
      }

      // Step 4: Try to update another record (e.g., record with `certificateId: 3`) to duplicate the composite key.
      await expect(
        storage.updateCertificate(3, mockDupValues) // Update that creates a duplicate composite key.
      ).rejects.toThrow(/UNIQUE constraint failed/) // Expect UNIQUE constraint error.

      // Step 5: Define a new unique combination for the composite key.
      const mockUniqueValues = {
        userId: 2,
        type: 'mockTypeUnique',
        certifier: 'mockCertifier2',
        serialNumber: 'mockSerialNumber2' // Only `type` changes here.
      }

      // Step 6: Update the record with the new unique composite key and verify success.
      const r2 = await storage.updateCertificate(3, mockUniqueValues)
      await expect(Promise.resolve(r2)).resolves.toBe(1) // Ensure the update works with a unique key.
    }
  })

  test('304a Certificate table setting individual values and constraints', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date()

      // Step 1: Insert a new record for testing updates.
      const initialRecord: Certificate = {
        certificateId: 4,
        userId: 1,
        serialNumber: 'testSerialNumber',
        type: 'testType',
        certifier: 'testCertifier',
        subject: 'testSubject',
        verifier: undefined,
        revocationOutpoint: 'testRevocationOutpoint',
        signature: 'testSignature',
        isDeleted: false,
        created_at: referenceTime,
        updated_at: referenceTime
      }

      try {
        const r1 = await storage.insertCertificate(initialRecord)
        expect(r1).toBeGreaterThan(0) // Ensure successful insertion
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Step 2: Update `serialNumber` to a value that doesn’t violate the composite key constraint.
      const r2 = await storage.updateCertificate(4, { serialNumber: 'newSerialNumber' })
      await expect(Promise.resolve(r2)).resolves.toBe(1)

      // Step 3: Verify the `serialNumber` update.
      const r3 = await storage.findCertificates({})
      expect(r3.find(record => record.certificateId === 4)?.serialNumber).toBe('newSerialNumber')

      // Step 4: Try updating `certificateId: 4` to match the composite key of the existing record.
      await expect(
        storage.updateCertificate(4, {
          userId: 0,
          type: 'existingType',
          certifier: 'existingCertifier',
          serialNumber: 'existingSerialNumber' // Matches the composite key of the existing record
        })
      ).rejects.toThrow(/UNIQUE constraint failed/)

      // Step 5: Update multiple fields (e.g., `type`, `certifier`) without violating the composite key constraint.
      const r4 = await storage.updateCertificate(4, {
        type: 'updatedType',
        certifier: 'updatedCertifier'
      })
      await expect(Promise.resolve(r4)).resolves.toBe(1)

      // Step 6: Verify the update.
      const r5 = await storage.findCertificates({})
      const updatedRecord = r5.find(record => record.certificateId === 4)
      expect(updatedRecord?.type).toBe('updatedType')
      expect(updatedRecord?.certifier).toBe('updatedCertifier')

      // Step 7: Reset fields to their original values.
      const r6 = await storage.updateCertificate(4, {
        type: 'testType',
        certifier: 'testCertifier'
      })
      await expect(Promise.resolve(r6)).resolves.toBe(1)

      const r7 = await storage.findCertificates({})
      const resetRecord = r7.find(record => record.certificateId === 4)
      expect(resetRecord?.type).toBe('testType')
      expect(resetRecord?.certifier).toBe('testCertifier')

      // Step 8: Test toggling the `isDeleted` field.
      const r8 = await storage.updateCertificate(4, { isDeleted: true })
      await expect(Promise.resolve(r8)).resolves.toBe(1)

      const r9 = await storage.findCertificates({})
      expect(r9.find(record => record.certificateId === 4)?.isDeleted).toBe(true)

      // Step 9: Reset `isDeleted` back to false.
      const r10 = await storage.updateCertificate(4, { isDeleted: false })
      await expect(Promise.resolve(r10)).resolves.toBe(1)

      const r11 = await storage.findCertificates({})
      expect(r11.find(record => record.certificateId === 4)?.isDeleted).toBe(false)

      // Step 10: Test timestamp updates (e.g., `updated_at` field).
      const newTimestamp = new Date('2025-01-04T10:00:00Z')
      const r12 = await storage.updateCertificate(4, { updated_at: newTimestamp })
      await expect(Promise.resolve(r12)).resolves.toBe(1)

      const r13 = await storage.findCertificates({})
      expect(r13.find(record => record.certificateId === 4)?.updated_at).toEqual(newTimestamp)

      // Add further steps for other fields as necessary.
    }
  })

  test('304 Certificate setting individual values', async () => {
    for (const { storage, setup } of setups) {
      // Test individual values

      // The current records are used by other tables so it is necessay to insert another row to perform individual tests
      const initialRecord: Certificate = {
        created_at: new Date(),
        updated_at: new Date(),
        certificateId: 0,
        userId: 0,
        type: '',
        serialNumber: '',
        certifier: '',
        subject: '',
        revocationOutpoint: '',
        signature: '',
        isDeleted: false
      }

      try {
        const r = await storage.insertCertificate(initialRecord)
        expect(r).toBeGreaterThan(1)
      } catch (error: any) {
        console.error('Error inserting initial record:', error.message)
        return
      }

      // Cant set first record id to zero due to ref by other tables
      await expect(storage.updateCertificate(1, { certificateId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Cant set second record id to zero due to ref by other tables
      await expect(storage.updateCertificate(2, { certificateId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

      // Can set third record to zero
      const r1 = await storage.updateCertificate(3, { certificateId: 0 })
      await expect(Promise.resolve(r1)).resolves.toBe(1)
      const r2 = await storage.findCertificates({})
      expect(r2[0].certificateId).toBe(0)
      expect(r2[1].certificateId).toBe(1)
      expect(r2[2].certificateId).toBe(2)

      // Reset back to original
      const r3 = await storage.updateCertificate(0, { certificateId: 3 })
      await expect(Promise.resolve(r3)).resolves.toBe(1)
      const r4 = await storage.findCertificates({})
      expect(r4[0].certificateId).toBe(1)
      expect(r4[1].certificateId).toBe(2)
      expect(r4[2].certificateId).toBe(3)

      // Set record id to random value
      const r5 = await storage.updateCertificate(3, { certificateId: 9999 })
      await expect(Promise.resolve(r5)).resolves.toBe(1)
      const r6 = await storage.findCertificates({})
      expect(r6[0].certificateId).toBe(1)
      expect(r6[1].certificateId).toBe(2)
      expect(r6[2].certificateId).toBe(9999)

      // Try to set other record id to same random id
      await expect(storage.updateCertificate(1, { certificateId: 9999 })).rejects.toThrow(/UNIQUE constraint failed/)
      const r7 = await storage.findCertificates({})
      expect(r7[0].certificateId).toBe(1)
      expect(r7[1].certificateId).toBe(2)
      expect(r7[2].certificateId).toBe(9999)

      // Update random id record with valid unique field
      const r8 = await storage.updateCertificate(9999, { type: 'mockValidIdentityKey' })
      await expect(Promise.resolve(r8)).resolves.toBe(1)
      const r9 = await storage.findCertificates({})
      expect(r9[0].type).not.toBe('mockValidIdentityKey')
      expect(r9[1].type).not.toBe('mockValidIdentityKey')
      expect(r9[2].type).toBe('mockValidIdentityKey')

      // Check original id record cannot be updated with same field
      const r10 = await storage.updateCertificate(3, { type: 'mockValidIdentityKey' })
      await expect(Promise.resolve(r10)).resolves.toBe(0)
      const r11 = await storage.findCertificates({})
      expect(r11[0].type).not.toBe('mockValidIdentityKey')
      expect(r11[1].type).not.toBe('mockValidIdentityKey')
      expect(r11[2].type).toBe('mockValidIdentityKey')

      // Try to update second record field with same value
      await expect(storage.updateCertificate(2, { type: 'mockValidIdentityKey' })).rejects.toThrow(/UNIQUE constraint failed/)
      expect(r11[0].type).not.toBe('mockValidIdentityKey')
      expect(r11[1].type).not.toBe('mockValidIdentityKey')
      expect(r11[2].type).toBe('mockValidIdentityKey')

      // Update random id with undefined unique no null field
      const r12 = await storage.updateCertificate(9999, { type: undefined })
      await expect(Promise.resolve(r12)).resolves.toBe(1)
      const r13 = await storage.findCertificates({})
      expect(r13[0].type).not.toBe('mockValidIdentityKey')
      expect(r13[1].type).not.toBe('mockValidIdentityKey')
      expect(r13[2].type).toBe('mockValidIdentityKey')

      // Reset id to back to 1
      const r14 = await storage.updateCertificate(9999, { certificateId: 3 })
      await expect(Promise.resolve(r14)).resolves.toBe(1)
      const r15 = await storage.findCertificates({})
      // Note: Now id 1 first record returned
      expect(r15[0].certificateId).toBe(1)
      expect(r15[1].certificateId).toBe(2)
      expect(r15[2].certificateId).toBe(3)

      const createdAt = new Date('2024-12-30T23:00:00Z')
      const updatedAt = new Date('2024-12-30T23:05:00Z')
      const r16 = await storage.updateCertificate(1, { created_at: createdAt, updated_at: updatedAt })
      await expect(Promise.resolve(r16)).resolves.toBe(1)

      const futureDate = new Date('3000-01-01T00:00:00Z')
      const r17 = await storage.updateCertificate(1, { created_at: futureDate })
      await expect(Promise.resolve(r17)).resolves.toBe(1)

      const earlierDate = new Date('2024-12-30T22:59:59Z')
      const r18 = await storage.updateCertificate(1, { created_at: earlierDate })
      await expect(Promise.resolve(r18)).resolves.toBe(1)
    }
  })
*/
  // test('4 find CertificateField', async () => {
  //   for (const { storage, setup } of setups) {
  //     // Fetch certificate fields with a specific field name
  //     const certificateFields = await storage.findCertificateFields({ fieldName: 'bob' })

  //     // Ensure there are results to test
  //     expect(certificateFields.length).toBeGreaterThan(0)

  //     for (const field of certificateFields) {
  //       const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
  //       const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time, 5 minutes later

  //       // Perform updates on the certificate field
  //       await storage.updateCertificateField(field.certificateId, field.fieldName, { created_at: createdTime })
  //       await storage.updateCertificateField(field.certificateId, field.fieldName, { updated_at: updatedTime })
  //       await storage.updateCertificateField(field.certificateId, field.fieldName, { fieldName: 'updatedFieldName' })
  //       await storage.updateCertificateField(field.certificateId, field.fieldName, { fieldValue: 'updatedFieldValue' })

  //       // Update with empty object to test ignored updates
  //       await storage.updateCertificateField(field.certificateId, field.fieldName, {})
  //       await storage.updateCertificateField(0, 'invalidFieldName', {}) // Test invalid update

  //       // Fetch and verify the updated certificate field
  //       const updatedFields = await storage.findCertificateFields({
  //         certificateId: field.certificateId,
  //         fieldName: 'updatedFieldName'
  //       })

  //       // Ensure the updatedFields array contains exactly one result
  //       expect(updatedFields.length).toBe(0)

  //       const verifiedField = updatedFields[0]
  //       expect(verifiedField.certificateId).toBe(field.certificateId)
  //       expect(verifiedField.fieldName).toBe('updatedFieldName')
  //       //expect(verifiedField.fieldValue).toBe('updatedFieldValue')
  //       expect(new Date(verifiedField.created_at.getTime())).toStrictEqual(new Date(createdTime.getTime()))
  //       expect(new Date(verifiedField.updated_at.getTime())).toStrictEqual(new Date(updatedTime.getTime()))
  //     }
  //   }
  // })

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
