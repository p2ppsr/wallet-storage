import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table, verifyOne } from '../../src'
import { ProvenTxReqStatus } from '../../src/sdk'
import { updateTable, validateUpdateTime, verifyValues } from '../utils/testUtilsUpdate'
import { act } from 'react'
import { ProvenTxReq } from '../../src/storage/schema/tables'

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

      const testValues = {
        blockHash: 'mockBlockHash',
        created_at: new Date('2024-12-30T23:00:00Z'),
        updated_at: new Date('2024-12-30T23:05:00Z'),
        provenTxId: 1,
        txid: 'mockTxid',
        height: 12345,
        index: 1,
        merklePath: [1, 2, 3, 4],
        rawTx: [4, 3, 2, 1],
        merkleRoot: '1234'
      }

      // Fetch all proven transactions
      const provenTxs = await storage.findProvenTxs({})
      for (const tx of provenTxs) {
        // Update the entry with test values
        await updateTable(storage.updateProvenTx.bind(storage), tx[primaryKey], testValues)

        // Verify that the updated entry matches the test values
        const updatedTx = verifyOne(await storage.findProvenTxs({ [primaryKey]: tx[primaryKey] }))
        verifyValues(updatedTx, testValues, referenceTime)

        // Test each field for valid and invalid updates
        for (const [key, value] of Object.entries(testValues)) {
          if (key === primaryKey) {
            // Skip testing updates to the primary key as they are invalid operations
            continue
          }

          if (typeof value === 'string') {
            const validString = `valid${key}`
            const r1 = await storage.updateProvenTx(tx[primaryKey], { [key]: validString })
            expect(r1).toBe(1)

            const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: tx[primaryKey] }))
            expect(updatedRow[key]).toBe(validString)
          }

          if (typeof value === 'number') {
            const validNumber = value + 1
            const r1 = await storage.updateProvenTx(tx[primaryKey], { [key]: validNumber })
            expect(r1).toBe(1)

            const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: tx[primaryKey] }))
            expect(updatedRow[key]).toBe(validNumber)
          }

          if (value instanceof Date) {
            const validDate = new Date('2024-12-31T00:00:00Z')
            const r1 = await storage.updateProvenTx(tx[primaryKey], { [key]: validDate })
            expect(r1).toBe(1)

            const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: tx[primaryKey] }))
            expect(new Date(updatedRow[key]).toISOString()).toBe(validDate.toISOString())
          }

          if (Array.isArray(value)) {
            const validArray = value.map(v => v + 1)
            const r1 = await storage.updateProvenTx(tx[primaryKey], { [key]: validArray })
            expect(r1).toBe(1)

            const updatedRow = verifyOne(await storage.findProvenTxs({ [primaryKey]: tx[primaryKey] }))
            expect(updatedRow[key]).toEqual(validArray)
          }
        }
      }
    }
  })

  test('001 ProvenTx set created_at and updated_at time', async () => {
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
          console.log(`Testing scenario: ${description}`)

          // Validate times using `validateUpdateTime`
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  /**
   * Normalize a date or ISO string to a consistent ISO string format.
   * @param value - The value to normalize (Date object or ISO string).
   * @returns ISO string or null if not a date-like value.
   */
  function normalizeDate(value: any): string | null {
    if (value instanceof Date) {
      return value.toISOString()
    } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toISOString()
    }
    return null
  }

  test('1 find ProvenTxReq', async () => {
    const primaryKey = schemaMetadata.provenTxReqs.primaryKey // Dynamically identify the primary key

    for (const { storage, setup } of setups) {
      const records = await storage.findProvenTxReqs({})
      let i = 1

      for (const record of records) {
        const testValues = {
          status: 'completed' as ProvenTxReqStatus,
          history: JSON.stringify({ validated: true, timestamp: Date.now() }),
          notify: JSON.stringify({ email: 'test@example.com', sent: true }),
          rawTx: [1, 2, 3, 4],
          inputBEEF: [5, 6, 7, 8],
          attempts: 3,
          notified: true,
          txid: `mockTxid`, // Ensure unique txid
          batch: `batch-001`, // Ensure unique batch
          // txid: `mockTxid-${i}-${Date.now()}`, // Ensure unique txid
          // batch: `batch-001-${i}-${Date.now()}`, // Ensure unique batch
          created_at: new Date('2024-12-30T23:00:00Z'),
          updated_at: new Date('2024-12-30T23:05:00Z')
        }
        i++

        // Update all fields in one go
        const r1 = await storage.updateProvenTxReq(record[primaryKey], testValues)
        expect(r1).toBe(1) // Expect one row updated

        // Fetch the updated row for validation
        const updatedRow = verifyOne(await storage.findProvenTxReqs({ [primaryKey]: record[primaryKey] }))
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
          console.log('actualValue type is ', typeof actualValue, '=', actualValue)
          console.log('value type is ', typeof value, '=', value)
          expect(JSON.stringify({ type: 'Buffer', data: actualValue })).toStrictEqual(JSON.stringify(value))
        }
      }
    }
  })

  test('101 ProvenTxReqs set created_at and updated_at time', async () => {
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
        const records = await storage.findProvenTxReqs({})

        for (const record of records) {
          await storage.updateProvenTxReq(record.provenTxReqId, { created_at: updates.created_at })
          await storage.updateProvenTxReq(record.provenTxReqId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: record.provenTxReqId }))
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  test('102 ProvenTxReqs trigger DB unique constraint error for txid', async () => {
    const primaryKey = schemaMetadata.provenTxReqs.primaryKey // Dynamically identify the primary key

    for (const { storage, setup } of setups) {
      const records = await storage.findProvenTxReqs({})

      for (const record of records) {
        const testValues = {
          status: 'completed' as ProvenTxReqStatus,
          history: JSON.stringify({ validated: true, timestamp: Date.now() }),
          notify: JSON.stringify({ email: 'test@example.com', sent: true }),
          rawTx: [1, 2, 3, 4],
          inputBEEF: [5, 6, 7, 8],
          attempts: 3,
          notified: true,
          txid: `mockTxid`, // Ensure unique txid
          batch: `batch-001`, // Ensure unique batch
           created_at: new Date('2024-12-30T23:00:00Z'),
          updated_at: new Date('2024-12-30T23:05:00Z')
        }

        // Update all fields in one go
        try {
        await storage.updateProvenTxReq(record[primaryKey], testValues)


        throw new Error('Expected unique constraint error, but the update succeeded')
      } catch (error: any) {
        console.log('Caught error:', error.message)
        // Assert that the error is a unique constraint violation for txid
        expect(error.message).toContain('SQLITE_CONSTRAINT: UNIQUE constraint failed')
        expect(error.message).toContain('proven_tx_reqs.txid') // Ensure it's the txid constraint
      }
    }
  })

  test('103 ProvenTxReq set batch field undefined', async () => {
    for (const { storage } of setups) {
      // Define valid field value

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        await storage.updateProvenTxReq(e.provenTxReqId, { batch: undefined })

        // Retrieve and verify each field
        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))
        expect(t.batch).toBe(null) // Batch should be null if undefined
      }
    }
  })

  test('2 find User', async () => {
    for (const { storage, setup } of setups) {
      const referenceTime = new Date() // Capture time before updates

      const testValues = {
        identityKey: 'mockUpdatedIdentityKey',
        created_at: new Date('2024-12-30T23:00:00Z'),
        updated_at: new Date('2024-12-30T23:05:00Z')
      }

      const users = await storage.findUsers({})
      for (const user of users) {
        await updateTable(storage.updateUser.bind(storage), user.userId, testValues)

        const t = verifyOne(await storage.findUsers({ userId: user.userId }))

        // Verify test object
        verifyValues(t, testValues, referenceTime)

        // Test individual values
        const r1 = await storage.updateUser(0, { identityKey: 'mockValidIdentityKey' })
        await expect(Promise.resolve(r1)).resolves.toBe(0)

        const r2 = await storage.updateUser(1, { identityKey: undefined })
        await expect(Promise.resolve(r2)).resolves.toBe(1)

        await expect(storage.updateUser(1, { userId: 0 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

        const r3 = await storage.updateUser(1, { userId: 1 })
        await expect(Promise.resolve(r3)).resolves.toBe(1)

        await expect(storage.updateUser(1, { userId: 2 })).rejects.toThrow(/UNIQUE constraint failed/)

        await expect(storage.updateUser(1, { userId: 9999 })).rejects.toThrow(/FOREIGN KEY constraint failed/)

        const createdAt = new Date('2024-12-30T23:00:00Z')
        const updatedAt = new Date('2024-12-30T23:05:00Z')
        const r4 = await storage.updateUser(1, { created_at: createdAt, updated_at: updatedAt })
        await expect(Promise.resolve(r4)).resolves.toBe(1)

        const futureDate = new Date('3000-01-01T00:00:00Z')
        const r5 = await storage.updateUser(1, { created_at: futureDate })
        await expect(Promise.resolve(r5)).resolves.toBe(1)

        const earlierDate = new Date('2024-12-30T22:59:59Z')
        const r6 = await storage.updateUser(1, { created_at: earlierDate })
        await expect(Promise.resolve(r6)).resolves.toBe(1)

        const r7 = await storage.updateUser(9999, { identityKey: 'mockValidIdentityKey' })
        await expect(Promise.resolve(r7)).resolves.toBe(9999)
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

        const users = await storage.findUsers({})
        for (const user of users) {
          // Update fields based on the scenario
          await storage.updateUser(user.userId, { created_at: updates.created_at })
          await storage.updateUser(user.userId, { updated_at: updates.updated_at })

          const t = verifyOne(await storage.findUsers({ userId: user.userId }))

          // Log the scenario for better test output
          console.log(`Testing scenario: ${description}`)

          // Validate times using `validateUpdateTime`
          expect(validateUpdateTime(t.created_at, updates.created_at, referenceTime)).toBe(true)
          expect(validateUpdateTime(t.updated_at, updates.updated_at, referenceTime)).toBe(true)
        }
      }
    }
  })

  test('3 find Certificate', async () => {
    for (const { storage, setup } of setups) {
      // Fetch all certificates with a specified certifier
      const certificates = await storage.findCertificates({}, [setup.u1cert1.certifier])

      for (const certificate of certificates) {
        const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
        const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time, 5 minutes later

        // Perform updates on the certificate
        await storage.updateCertificate(certificate.certificateId, {
          created_at: createdTime
        })
        await storage.updateCertificate(certificate.certificateId, {
          updated_at: updatedTime
        })
        await storage.updateCertificate(certificate.certificateId, {
          certifier: 'updatedCertifier'
        })
        await storage.updateCertificate(certificate.certificateId, {
          subject: 'updatedSubject'
        })
        await storage.updateCertificate(certificate.certificateId, {
          userId: 1
        })
        await storage.updateCertificate(certificate.certificateId, {
          type: 'updatedType'
        })
        await storage.updateCertificate(certificate.certificateId, {
          serialNumber: 'updatedSerial'
        })
        await storage.updateCertificate(certificate.certificateId, {
          verifier: 'updatedVerifier'
        })
        await storage.updateCertificate(certificate.certificateId, {
          revocationOutpoint: 'updatedRevocation'
        })
        await storage.updateCertificate(certificate.certificateId, {
          signature: 'updatedSignature'
        })
        await storage.updateCertificate(certificate.certificateId, {
          isDeleted: true
        })

        // Update with empty object to test ignored updates
        await storage.updateCertificate(certificate.certificateId, {})
        await storage.updateCertificate(0, {}) // Test invalid update

        // Verify the updated certificate
        const verifiedCertificate = verifyOne(
          await storage.findCertificates({
            certificateId: certificate.certificateId
          })
        )
        expect(verifiedCertificate.certificateId).toBe(certificate.certificateId)
        expect(verifiedCertificate.userId).toBe(1)
        expect(verifiedCertificate.type).toBe('updatedType')
        expect(verifiedCertificate.serialNumber).toBe('updatedSerial')
        expect(verifiedCertificate.certifier).toBe('updatedCertifier')
        expect(verifiedCertificate.subject).toBe('updatedSubject')
        expect(verifiedCertificate.verifier).toBe('updatedVerifier')
        expect(verifiedCertificate.revocationOutpoint).toBe('updatedRevocation')
        expect(verifiedCertificate.signature).toBe('updatedSignature')
        expect(verifiedCertificate.isDeleted).toBe(true)
        expect(new Date(verifiedCertificate.created_at.getTime())).toStrictEqual(new Date(createdTime.getTime()))
        expect(new Date(verifiedCertificate.updated_at.getTime())).toStrictEqual(new Date(updatedTime.getTime()))
      }
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
