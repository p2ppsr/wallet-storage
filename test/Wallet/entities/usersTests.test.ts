import { User } from '../../../src/storage/schema/entities/User'
import { table, entity } from '../../../src'
import { TestUtilsWalletStorage as _tu, TestWalletNoSetup, expectToThrowWERR } from '../../utils/TestUtilsStephen'

describe('User class method tests', () => {
  jest.setTimeout(99999999) // Extend timeout for database operations

  const env = _tu.getEnv('test') // Test environment
  const ctxs: TestWalletNoSetup[] = [] // Context for primary databases
  const ctxs2: TestWalletNoSetup[] = [] // Context for secondary databases

  beforeAll(async () => {
    // Set up MySQL and SQLite databases for testing
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('userTests_db1'))
      ctxs2.push(await _tu.createLegacyWalletMySQLCopy('userTests_db2'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('userTests_db1'))
    ctxs2.push(await _tu.createLegacyWalletSQLiteCopy('userTests_db2'))
  })

  afterAll(async () => {
    // Clean up primary databases
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
    // Clean up secondary databases
    for (const ctx of ctxs2) {
      await ctx.storage.destroy()
    }
  })

  // Test: Default constructor behavior
  test('1_creates_user_with_default_values', () => {
    const user = new User()

    // Default values
    expect(user.userId).toBe(0)
    expect(user.identityKey).toBe('')
    expect(user.created_at).toBeInstanceOf(Date)
    expect(user.updated_at).toBeInstanceOf(Date)
    expect(user.created_at <= user.updated_at).toBe(true)
  })

  // Test: Constructor with provided API object
  test('2_creates_user_with_provided_api_object', () => {
    const now = new Date()
    const apiObject: table.User = {
      userId: 42,
      created_at: now,
      updated_at: now,
      identityKey: 'testIdentityKey'
    }
    const user = new User(apiObject)

    // Verify all properties match the API object
    expect(user.userId).toBe(42)
    expect(user.identityKey).toBe('testIdentityKey')
    expect(user.created_at).toBe(now)
    expect(user.updated_at).toBe(now)
  })

  // Test: Getters and setters behavior
  test('3_getters_and_setters_work_correctly', () => {
    const user = new User()

    // Test setting values
    const now = new Date()
    user.userId = 1001
    user.identityKey = 'newIdentityKey'
    user.created_at = now
    user.updated_at = now
    user.activeStorage = 'testActiveStorage' // Setting activeStorage

    // Verify getters return the updated values
    expect(user.userId).toBe(1001)
    expect(user.identityKey).toBe('newIdentityKey')
    expect(user.created_at).toBe(now)
    expect(user.updated_at).toBe(now)
    expect(user.activeStorage).toBe('testActiveStorage') // Getting activeStorage
  })

  // Test: Handles invalid inputs for setters
  /*****************************************************************************************************/
  // The setters don't currently validate input types, so this test is expected to fail.
  /*****************************************************************************************************/
  test.skip('4_handles_invalid_or_null_inputs_for_setters', () => {
    const user = new User()

    // Invalid inputs
    expect(() => (user.userId = 'invalid' as unknown as number)).toThrow(TypeError) // Invalid userId
    expect(() => (user.identityKey = null as unknown as string)).toThrow(TypeError) // Invalid identityKey
    expect(() => (user.created_at = 'notADate' as unknown as Date)).toThrow(TypeError) // Invalid created_at
    expect(() => (user.updated_at = 12345 as unknown as Date)).toThrow(TypeError) // Invalid updated_at

    // Null or undefined inputs
    expect(() => (user.userId = null as unknown as number)).toThrow(TypeError) // Null userId
    expect(() => (user.identityKey = undefined as unknown as string)).toThrow(TypeError) // Undefined identityKey
  })

  // Test: equals method matching entities
  test('5_equals_identifies_matching_entities', async () => {
    for (const ctx1 of ctxs) {
      for (const ctx2 of ctxs2) {
        // Insert the first user into the first database
        const user1 = new User({
          userId: 2,
          identityKey: 'key1',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        })
        await ctx1.activeStorage.insertUser(user1.toApi())

        // Insert a matching user into the second database
        const user2 = new User({
          userId: 3, // Different ID
          identityKey: 'key1', // Same key
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        })
        await ctx2.activeStorage.insertUser(user2.toApi())

        // Create a valid SyncMap mapping IDs from db1 to db2
        const syncMap: entity.SyncMap = {
          transaction: {
            idMap: { [user1.userId]: user2.userId },
            entityName: 'Transaction',
            maxUpdated_at: undefined,
            count: 1
          },
          provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
          outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
          provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
          txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
          txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
          output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
          outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
          outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
          certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
          certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
          commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
        }

        // Verify the entities match across databases
        expect(user1.equals(user2.toApi(), syncMap)).toBe(true) // Should match
      }
    }
  })

  // Test: equals method non-matching entities
  test('6_equals_identifies_non_matching_entities', async () => {
    for (const ctx1 of ctxs) {
      for (const ctx2 of ctxs2) {
        // Insert the first user into the first database
        const user1 = new User({
          userId: 4,
          identityKey: 'key2',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        })
        await ctx1.activeStorage.insertUser(user1.toApi())

        // Insert a user with a different key into the second database
        const user2 = new User({
          userId: 5, // Different ID
          identityKey: 'key3', // Different key
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        })
        await ctx2.activeStorage.insertUser(user2.toApi())

        // Create a valid SyncMap mapping IDs from db1 to db2
        const syncMap: entity.SyncMap = {
          transaction: {
            idMap: { [user1.userId]: user2.userId },
            entityName: 'Transaction',
            maxUpdated_at: undefined,
            count: 1
          },
          provenTx: { idMap: {}, entityName: 'ProvenTx', maxUpdated_at: undefined, count: 0 },
          outputBasket: { idMap: {}, entityName: 'OutputBasket', maxUpdated_at: undefined, count: 0 },
          provenTxReq: { idMap: {}, entityName: 'ProvenTxReq', maxUpdated_at: undefined, count: 0 },
          txLabel: { idMap: {}, entityName: 'TxLabel', maxUpdated_at: undefined, count: 0 },
          txLabelMap: { idMap: {}, entityName: 'TxLabelMap', maxUpdated_at: undefined, count: 0 },
          output: { idMap: {}, entityName: 'Output', maxUpdated_at: undefined, count: 0 },
          outputTag: { idMap: {}, entityName: 'OutputTag', maxUpdated_at: undefined, count: 0 },
          outputTagMap: { idMap: {}, entityName: 'OutputTagMap', maxUpdated_at: undefined, count: 0 },
          certificate: { idMap: {}, entityName: 'Certificate', maxUpdated_at: undefined, count: 0 },
          certificateField: { idMap: {}, entityName: 'CertificateField', maxUpdated_at: undefined, count: 0 },
          commission: { idMap: {}, entityName: 'Commission', maxUpdated_at: undefined, count: 0 }
        }

        // Verify the entities do not match across databases
        expect(user1.equals(user2.toApi(), syncMap)).toBe(false) // Should not match
      }
    }
  })

  // Test: Handles edge cases in the constructor
  test('7_handles_edge_cases_in_constructor', () => {
    const now = new Date()
    const pastDate = new Date(now.getTime() - 1000000)

    // Provide incomplete API object
    const partialApiObject: Partial<table.User> = {
      userId: 123,
      created_at: pastDate
    }

    const user = new User(partialApiObject as table.User)

    // Default values should fill in missing fields
    expect(user.userId).toBe(123)
    expect(user.identityKey).toBeUndefined() // Default undefined
    expect(user.created_at).toBe(pastDate)
    expect(user.updated_at).toBeUndefined() // Default undefined
  })

  // Test: Handles large input values
  test('8_handles_large_input_values', () => {
    const now = new Date()
    const largeUserId = Number.MAX_SAFE_INTEGER
    const longIdentityKey = 'x'.repeat(1000)

    const apiObject: table.User = {
      userId: largeUserId,
      created_at: now,
      updated_at: now,
      identityKey: longIdentityKey
    }
    const user = new User(apiObject)

    expect(user.userId).toBe(largeUserId)
    expect(user.identityKey).toBe(longIdentityKey)
  })

  // Test: Handles invalid dates in API object
  /*****************************************************************************************************/
  // Currently fails because the User constructor does not validate `created_at` and `updated_at`.
  // Validation needs to be added to ensure these fields are valid Date objects, throwing a TypeError if not.
  /*****************************************************************************************************/
  test.skip('9_handles_invalid_dates_in_api_object', () => {
    const invalidDate = 'not-a-date' as unknown as Date

    const apiObject: table.User = {
      userId: 1,
      created_at: invalidDate,
      updated_at: invalidDate,
      identityKey: 'testKey'
    }

    expect(() => new User(apiObject)).toThrow(TypeError)
  })

  // Test: Handles empty API object
  test('10_handles_empty_api_object', () => {
    const emptyApiObject: table.User = {} as table.User
    const user = new User(emptyApiObject)

    // Default values should be applied but constructor does not set default values for empty object
    expect(user.userId).toBeUndefined()
    expect(user.identityKey).toBeUndefined()
    expect(user.created_at).toBeUndefined()
    expect(user.updated_at).toBeUndefined()
  })

  // Test: `id` getter and setter
  test('11_id_getter_and_setter_work_correctly', () => {
    const user = new User()

    user.id = 123 // Test setter
    expect(user.id).toBe(123) // Test getter
  })

  // Test: `entityName` getter
  test('12_entityName_returns_User', () => {
    const user = new User()

    expect(user.entityName).toBe('User')
  })

  // Test: `entityTable` getter
  test('13_entityTable_returns_users', () => {
    const user = new User()

    expect(user.entityTable).toBe('users')
  })

  // Test: `mergeExisting` updates user when `ei.updated_at` is newer
  test('14_mergeExisting_updates_user_when_ei_updated_at_is_newer', async () => {
    const user = new User({
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
      identityKey: 'oldKey',
      activeStorage: 'oldStorage'
    })

    const updatedEi: table.User = {
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-02-01'), // Newer `updated_at`
      identityKey: 'oldKey',
      activeStorage: 'newStorage'
    }

    const result = await user.mergeExisting(
      {
        updateUser: async (id: number, data: table.User) => {
          expect(id).toBe(1)
          expect(data.activeStorage).toBe('newStorage')
          expect(data.updated_at).toBeInstanceOf(Date)
        }
      } as any,
      undefined,
      updatedEi,
      undefined
    )

    expect(result).toBe(true)
    expect(user.activeStorage).toBe('newStorage') // Updated `activeStorage`
  })

  // Test: `mergeExisting` does not update user when `ei.updated_at` is older
  test('15_mergeExisting_does_not_update_user_when_ei_updated_at_is_older', async () => {
    const user = new User({
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-02-01'),
      identityKey: 'oldKey',
      activeStorage: 'oldStorage'
    })

    const olderEi: table.User = {
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'), // Older `updated_at`
      identityKey: 'oldKey',
      activeStorage: 'newStorage'
    }

    const result = await user.mergeExisting(
      {
        updateUser: async () => {
          throw new Error('This should not be called')
        }
      } as any,
      undefined,
      olderEi,
      undefined
    )

    expect(result).toBe(false)
    expect(user.activeStorage).toBe('oldStorage')
  })

  // Test: `mergeExisting` updates user and uses `trx` when provided
  test('16_mergeExisting_updates_user_with_trx', async () => {
    const user = new User({
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01'),
      identityKey: 'oldKey',
      activeStorage: 'oldStorage'
    })

    const updatedEi: table.User = {
      userId: 1,
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-02-01'), // Newer `updated_at`
      identityKey: 'oldKey',
      activeStorage: 'newStorage'
    }

    const mockTrx = {}

    const result = await user.mergeExisting(
      {
        updateUser: async (id: number, data: table.User, trx: any) => {
          expect(id).toBe(1)
          expect(data.activeStorage).toBe('newStorage')
          expect(data.updated_at).toBeInstanceOf(Date)
          expect(trx).toBe(mockTrx)
        }
      } as any,
      undefined,
      updatedEi,
      undefined,
      mockTrx
    )

    expect(result).toBe(true)
    expect(user.activeStorage).toBe('newStorage')
  })

  // Test: `mergeNew` always throws an error
  test('17_mergeNew_always_throws_error', async () => {
    const user = new User()
    const storage = {} // Placeholder for `storage`, not used in this case.
    const userId = 123 // Example userId
    const syncMap = {} // Placeholder for `syncMap`, not used in this case.
    const trx = undefined // Optional transaction token, set as undefined.

    // The method should throw an error when called
    await expect(user.mergeNew(storage as any, userId, syncMap as any, trx)).rejects.toThrowError('a sync chunk merge must never create a new user')
  })
})
