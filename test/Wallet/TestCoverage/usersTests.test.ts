import { User } from '../../../src/storage/schema/entities/User'
import { table, entity, sdk } from '../../../src'

// Tests 4 and 8 in usersTests.test.ts indicate that the user class does not currently validate inputs
// and does not throw an error. Validation is needed for the set methods and the api object.

describe('User Class Tests', () => {
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

    // Verify getters return the updated values
    expect(user.userId).toBe(1001)
    expect(user.identityKey).toBe('newIdentityKey')
    expect(user.created_at).toBe(now)
    expect(user.updated_at).toBe(now)
  })

  // Test: Handles invalid inputs
  test('4_handles_invalid_inputs_gracefully', () => {
    const user = new User()

    // Test invalid inputs for each setter
    expect(() => (user.userId = 'invalid' as unknown as number)).toThrow(TypeError) // Invalid userId
    expect(() => (user.identityKey = null as unknown as string)).toThrow(TypeError) // Invalid identityKey
    expect(() => (user.created_at = 'notADate' as unknown as Date)).toThrow(TypeError) // Invalid created_at
    expect(() => (user.updated_at = 12345 as unknown as Date)).toThrow(TypeError) // Invalid updated_at
  })

  // Test: Equality check always returns false
  test('5_equals_always_returns_false', () => {
    const user = new User()
    const apiObject: table.User = {
      userId: 1,
      created_at: new Date(),
      updated_at: new Date(),
      identityKey: 'testKey'
    }
    const result = user.equals(apiObject)

    expect(result).toBe(false)
  })

  // Test: Merge new user
  // Skipping tests for mergeNew as it is not implemented yet.
  // Add tests once the method has a meaningful implementation.
  //   test('6_mergeNew_does_not_throw', async () => {
  //     const user = new User()
  //     const storage = new entity.EntityStorage() // Use actual storage
  //     const syncMap = new entity.SyncMap() // Use actual sync map

  //     await expect(user.mergeNew(storage, 1, syncMap)).resolves.toBeUndefined()
  //   })

  // Test: Merge existing user
  // Skipping tests for mergeExisting as it is not implemented yet.
  // Add tests once the method has a meaningful implementation.
  //   test('7_mergeExisting_returns_false', async () => {
  //     const user = new User()
  //     const storage = new entity.EntityStorage() // Use actual storage
  //     const syncMap = new entity.SyncMap() // Use actual sync map
  //     const ei: table.User = {
  //       userId: 1,
  //       created_at: new Date(),
  //       updated_at: new Date(),
  //       identityKey: 'existingKey'
  //     }

  //     const result = await user.mergeExisting(storage, new Date(), ei, syncMap)
  //     expect(result).toBe(false)
  //   })

  // Test: Handles edge cases in the constructor
  test('8_handles_edge_cases_in_constructor', () => {
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
    expect(user.identityKey).toBeUndefined() // No default values so undefined
    expect(user.created_at).toBe(pastDate)
    expect(user.updated_at).toBeUndefined() // No default values so undefined
  })

  // Test: Large input values
  test('9_handles_large_input_values', () => {
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

  // Test: Invalid dates in API object
  test('10_handles_invalid_dates_in_api_object', () => {
    const invalidDate = 'not-a-date' as unknown as Date

    const apiObject: table.User = {
      userId: 1,
      created_at: invalidDate,
      updated_at: invalidDate,
      identityKey: 'testKey'
    }

    expect(() => new User(apiObject)).toThrow(TypeError)
  })
})
