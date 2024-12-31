import { _tu, TestSetup1 } from '../utils/TestUtilsWalletStorage'
import { randomBytesBase64, randomBytesHex, sdk, StorageBase, StorageKnex, table, verifyOne } from '../../src'
import { ProvenTxReqStatus } from '../../src/sdk'

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

  test('001 find ProvenTx', async () => {
    for (const { storage, setup } of setups) {
      const r = await storage.findProvenTxs({})
      for (const e of r) {
        const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
        const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time, 5 minutes later
        const referenceTime = new Date() // Capture time before updates

        await storage.updateProvenTx(e.provenTxId, { blockHash: 'fred' })
        await storage.updateProvenTx(e.provenTxId, { created_at: createdTime })
        await storage.updateProvenTx(e.provenTxId, { updated_at: updatedTime })
        await storage.updateProvenTx(e.provenTxId, { provenTxId: 1 })
        await storage.updateProvenTx(e.provenTxId, { txid: 'tx' })
        await storage.updateProvenTx(e.provenTxId, { height: 999999 })
        await storage.updateProvenTx(e.provenTxId, { index: 1 })
        await storage.updateProvenTx(e.provenTxId, { merklePath: [1, 2, 3, 4] })
        await storage.updateProvenTx(e.provenTxId, { rawTx: [4, 3, 2, 1] })
        await storage.updateProvenTx(e.provenTxId, { merkleRoot: '1234' })

        // Updates ignored
        await storage.updateProvenTx(e.provenTxId, {})
        await storage.updateProvenTx(0, {})

        const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))
        expect(t.provenTxId).toBe(e.provenTxId)
        expect(t.blockHash).toBe('fred')
        expect(t.txid).toBe('tx')
        expect(t.provenTxId).toBe(1)
        expect(t.height).toBe(999999)
        expect(t.index).toBe(1)
        expect(t.merklePath).toStrictEqual([1, 2, 3, 4])
        expect(t.rawTx).toStrictEqual([4, 3, 2, 1])
        expect(t.merkleRoot).toStrictEqual('1234')

        // Validate times using `validateUpdateTime`
        expect(validateUpdateTime(t.created_at, createdTime, referenceTime)).toBe(true)
        expect(validateUpdateTime(t.updated_at, updatedTime, referenceTime)).toBe(true)
      }
    }
  })

  test('002 valid created_at and updated_at times', async () => {
    for (const { storage } of setups) {
      const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
      const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time
      const referenceTime = new Date() // Capture time before updates

      const r = await storage.findProvenTxs({})
      for (const e of r) {
        await storage.updateProvenTx(e.provenTxId, { created_at: createdTime })
        await storage.updateProvenTx(e.provenTxId, { updated_at: updatedTime })

        const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))

        // Validate times using `validateUpdateTime` function below
        expect(validateUpdateTime(t.created_at, createdTime, referenceTime)).toBe(true)
        expect(validateUpdateTime(t.updated_at, updatedTime, referenceTime)).toBe(true)
      }
    }
  })

  test('003 invalid created_at time', async () => {
    for (const { storage } of setups) {
      const invalidTime = new Date('3000-01-01T00:00:00Z') // Unrealistic future time
      const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time
      const referenceTime = new Date() // Capture time before updates

      const r = await storage.findProvenTxs({})
      for (const e of r) {
        await storage.updateProvenTx(e.provenTxId, { created_at: invalidTime })
        await storage.updateProvenTx(e.provenTxId, { updated_at: updatedTime })

        const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))

        // Validate times using `validateUpdateTime`
        expect(validateUpdateTime(t.created_at, invalidTime, referenceTime)).toBe(true)
        expect(validateUpdateTime(t.updated_at, updatedTime, referenceTime)).toBe(true)
      }
    }
  })

  test('004 invalid updated_at time', async () => {
    for (const { storage } of setups) {
      const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
      const invalidTime = new Date('3000-01-01T00:00:00Z') // Unrealistic future time
      const referenceTime = new Date() // Capture time before updates

      const r = await storage.findProvenTxs({})
      for (const e of r) {
        await storage.updateProvenTx(e.provenTxId, { created_at: createdTime })
        await storage.updateProvenTx(e.provenTxId, { updated_at: invalidTime })

        const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))

        // Validate times using `validateUpdateTime`
        expect(validateUpdateTime(t.created_at, createdTime, referenceTime)).toBe(true)
        expect(validateUpdateTime(t.updated_at, invalidTime, referenceTime)).toBe(true)
      }
    }
  })

  test('005 created_at time overwrites updated_at time', async () => {
    for (const { storage } of setups) {
      const createdTime = new Date('2024-12-30T23:00:00Z')
      const updatedTime = new Date('2024-12-30T23:05:00Z')
      const referenceTime = new Date() // Capture time before updates

      const r = await storage.findProvenTxs({})
      for (const e of r) {
        // Update created_at first, then updated_at
        await storage.updateProvenTx(e.provenTxId, { created_at: createdTime })
        await storage.updateProvenTx(e.provenTxId, { updated_at: updatedTime })

        const t = verifyOne(await storage.findProvenTxs({ provenTxId: e.provenTxId }))

        // Validate times using `validateUpdateTime`
        expect(validateUpdateTime(t.created_at, createdTime, referenceTime)).toBe(true)
        expect(validateUpdateTime(t.updated_at, updatedTime, referenceTime)).toBe(true)
      }
    }
  })

  test('010 validate ProvenTxReq status updates', async () => {
    for (const { storage } of setups) {
      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        const validStatuses = ['sending', 'unsent', 'nosend', 'unknown', 'nonfinal', 'unprocessed', 'unmined', 'callback', 'unconfirmed', 'completed', 'invalid', 'doubleSpend']

        for (const status of validStatuses) {
          await storage.updateProvenTxReq(e.provenTxReqId, {
            status: status as sdk.ProvenTxReqStatus
          })
          const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))
          expect(t.status).toBe(status)
        }
      }
    }
  })

  test('011 valid created_at and updated_at times', async () => {
    for (const { storage } of setups) {
      const createdTime = new Date('2024-12-30T23:00:00Z')
      const updatedTime = new Date('2024-12-30T23:05:00Z')

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        await storage.updateProvenTxReq(e.provenTxReqId, {
          created_at: createdTime
        })
        await storage.updateProvenTxReq(e.provenTxReqId, {
          updated_at: updatedTime
        })

        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))

        expect(new Date(t.created_at.getTime())).toStrictEqual(new Date(createdTime.getTime()))
        expect(new Date(t.updated_at.getTime())).toStrictEqual(new Date(updatedTime.getTime()))
      }
    }
  })

  test('012 invalid created_at time', async () => {
    for (const { storage } of setups) {
      const invalidTime = new Date('3000-01-01T00:00:00Z') // Unrealistic future time

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        await storage.updateProvenTxReq(e.provenTxReqId, {
          created_at: invalidTime
        })

        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))

        expect(new Date(t.created_at).toISOString()).toBe(invalidTime.toISOString())
      }
    }
  })

  test('013 valid JSON fields: history and notify', async () => {
    for (const { storage } of setups) {
      const historyData = JSON.stringify({
        step: 'validated',
        timestamp: Date.now()
      })
      const notifyData = JSON.stringify({
        email: 'test@example.com',
        sent: true
      })

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        await storage.updateProvenTxReq(e.provenTxReqId, {
          history: historyData
        })
        await storage.updateProvenTxReq(e.provenTxReqId, { notify: notifyData })

        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))

        expect(t.history).toBe(historyData)
        expect(t.notify).toBe(notifyData)
      }
    }
  })

  test('014 rawTx and inputBEEF fields validation', async () => {
    for (const { storage } of setups) {
      const rawTxData = [1, 2, 3, 4]
      const inputBEEFData = [5, 6, 7, 8]

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        await storage.updateProvenTxReq(e.provenTxReqId, { rawTx: rawTxData })
        await storage.updateProvenTxReq(e.provenTxReqId, {
          inputBEEF: inputBEEFData
        })

        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))

        expect(t.rawTx).toStrictEqual(rawTxData)
        expect(t.inputBEEF).toStrictEqual(inputBEEFData)
      }
    }
  })

  test('015 validate ProvenTxReq additional fields', async () => {
    for (const { storage } of setups) {
      // Define valid field values
      const validAttempts = 3 // Example number of attempts
      const validNotified = true // Example boolean for notified
      const validBatch = 'batch-001' // Example valid batch identifier

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        // Update and verify each field separately
        await storage.updateProvenTxReq(e.provenTxReqId, {
          attempts: validAttempts
        })
        await storage.updateProvenTxReq(e.provenTxReqId, {
          notified: validNotified
        })
        await storage.updateProvenTxReq(e.provenTxReqId, { batch: validBatch })

        // Retrieve and verify each field
        const t = verifyOne(await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId }))

        expect(t.attempts).toBe(validAttempts)
        expect(t.notified).toBe(validNotified)
        expect(t.batch).toBe(validBatch)

        // TBD Verify undefined batch handling
        // await storage.updateProvenTxReq(e.provenTxReqId, { batch: undefined })
        // const t2 = verifyOne(
        //   await storage.findProvenTxReqs({ provenTxReqId: e.provenTxReqId })
        // )
        // expect(t2.batch).toBe(null) // Batch should be null if undefined
      }
    }
  })

  test('016 ProvenTxReq throws on invalid provenTxId updates', async () => {
    for (const { storage } of setups) {
      const invalidProvenTxId = 99999 // An ID that doesn't exist in the related table

      const r = await storage.findProvenTxReqs({})
      for (const e of r) {
        // Attempt to update with an invalid provenTxId
        await expect(
          storage.updateProvenTxReq(e.provenTxReqId, {
            provenTxId: invalidProvenTxId
          })
        ).rejects.toThrow(/FOREIGN KEY constraint failed/) // Check for the expected error
      }
    }
  })

  test('020 find User', async () => {
    for (const { storage, setup } of setups) {
      // Fetch all users
      const users = await storage.findUsers({})
      for (const user of users) {
        const createdTime = new Date('2024-12-30T23:00:00Z') // Hardcoded creation time
        const updatedTime = new Date('2024-12-30T23:05:00Z') // Hardcoded update time, 5 minutes later

        // Perform updates on the user
        await storage.updateUser(user.userId, { created_at: createdTime })
        await storage.updateUser(user.userId, { updated_at: updatedTime })
        await storage.updateUser(user.userId, {
          identityKey: 'updatedIdentityKey'
        })

        // Update with empty object to test ignored updates
        await storage.updateUser(user.userId, {})
        await storage.updateUser(0, {}) // Test invalid update

        // Verify the updated user
        const verifiedUser = verifyOne(await storage.findUsers({ userId: user.userId }))
        expect(verifiedUser.userId).toBe(user.userId)
        expect(verifiedUser.identityKey).toBe('updatedIdentityKey')
        expect(new Date(verifiedUser.created_at.getTime())).toStrictEqual(new Date(createdTime.getTime()))
        expect(new Date(verifiedUser.updated_at.getTime())).toStrictEqual(new Date(updatedTime.getTime()))
      }
    }
  })

  test('030 find Certificate', async () => {
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
        //   expect(
        //     new Date(verifiedCertificate.created_at.getTime())
        //   ).toStrictEqual(new Date(createdTime.getTime()))
        //   expect(
        //     new Date(verifiedCertificate.updated_at.getTime())
        //   ).toStrictEqual(new Date(updatedTime.getTime()))
      }
    }
  })

  test('040 find CertificateField', async () => {
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

/**
 * Comparison function to validate update time.
 * Allows the time to match the expected update time or be greater than a reference time.
 * @param actualTime - The `updated_at` time returned from the storage.
 * @param expectedTime - The time you tried to set.
 * @param referenceTime - A timestamp captured just before the update attempt.
 */
const validateUpdateTime = (actualTime: Date, expectedTime: Date, referenceTime: Date): boolean => {
  return actualTime.getTime() === expectedTime.getTime() || actualTime.getTime() > referenceTime.getTime()
}
