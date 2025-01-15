import { User } from '../../../src/storage/schema/entities/User'
import { table } from '../../../src'

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

  // Test: Handles invalid inputs for setters
  // Setters need validation checks to fix failures
  test('4_handles_invalid_or_null_inputs_for_setters', () => {
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

  // Test: Equality check always returns false (current behavior)
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
    expect(user.identityKey).toBeUndefined() // Default undefined
    expect(user.created_at).toBe(pastDate)
    expect(user.updated_at).toBeUndefined() // Default undefined
  })

  // Test: Handles large input values
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

  // Test: Handles invalid dates in API object
  // Currently fails because the User constructor does not validate `created_at` and `updated_at`.
  // Validation needs to be added to ensure these fields are valid Date objects, throwing a TypeError if not.
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

  // Test: Handles empty API object
  test('11_handles_empty_api_object', () => {
    const emptyApiObject: table.User = {} as table.User
    const user = new User(emptyApiObject)

    // Default values should be applied but constructor does not set default values for empty object
    expect(user.userId).toBeUndefined()
    expect(user.identityKey).toBeUndefined()
    expect(user.created_at).toBeUndefined()
    expect(user.updated_at).toBeUndefined()
  })

  // Test: `id` getter and setter
  test('12_id_getter_and_setter_work_correctly', () => {
    const user = new User()

    user.id = 123 // Test setter
    expect(user.id).toBe(123) // Test getter
  })

  // Test: `entityName` getter
  test('13_entityName_returns_User', () => {
    const user = new User()

    expect(user.entityName).toBe('User')
  })

  // Test: `entityTable` getter
  test('14_entityTable_returns_users', () => {
    const user = new User()

    expect(user.entityTable).toBe('users')
  })

  // Test: `mergeExisting` always returns false
  // Currently mocked just for coverage as the function does nothing
  test('15_mergeExisting_always_returns_false', async () => {
    const user = new User()

    const mockStorage = {} as any // Minimal mock to satisfy the function parameters
    const mockSince = new Date()
    const mockEi: table.User = {
      userId: 1,
      created_at: new Date(),
      updated_at: new Date(),
      identityKey: 'testKey'
    }
    const mockSyncMap = {} as any // Minimal mock for syncMap
    const mockTrx = {} as any // Minimal mock for trx

    const result = await user.mergeExisting(mockStorage, mockSince, mockEi, mockSyncMap, mockTrx)

    expect(result).toBe(false)
  })
})
