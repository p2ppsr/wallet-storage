import { sdk } from "../../src";
import { _tu, TestWalletNoSetup, expectToThrowWERR } from "../utils/TestUtilsWalletStorage";
import { KnexMigrations } from "../../src/storage/schema/KnexMigrations";


describe("Wallet waitForAuthentication Tests", () => {
    jest.setTimeout(99999999);

    const env = _tu.getEnv("test");
    const ctxs: TestWalletNoSetup[] = [];

    beforeAll(async () => {
        if (!env.noMySQL) {
            const mysqlCtx = await _tu.createLegacyWalletMySQLCopy("waitForAuthenticationTests");
            await mysqlCtx.activeStorage.knex.migrate.rollback({
                migrationSource: new KnexMigrations("test", "waitForAuthenticationTests", 100),
            });
            await mysqlCtx.activeStorage.knex.migrate.latest({
                migrationSource: new KnexMigrations("test", "waitForAuthenticationTests", 100),
            });
            console.log("MySQL Tables:", await mysqlCtx.activeStorage.knex.raw("SHOW TABLES;"));
            await mysqlCtx.storage.makeAvailable();
            ctxs.push(mysqlCtx);
        }
    
        const sqliteCtx = await _tu.createLegacyWalletSQLiteCopy(`waitForAuthenticationTests_${Date.now()}`);
        await sqliteCtx.activeStorage.knex.migrate.rollback({
            migrationSource: new KnexMigrations("test", "waitForAuthenticationTests", 100),
        });
        await sqliteCtx.activeStorage.knex.migrate.latest({
            migrationSource: new KnexMigrations("test", "waitForAuthenticationTests", 100),
        });
        console.log("SQLite Tables:", await sqliteCtx.activeStorage.knex.raw("SELECT name FROM sqlite_master WHERE type='table';"));
        await sqliteCtx.storage.makeAvailable();
        ctxs.push(sqliteCtx);
    });
    
    
    
    

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy();
        }
    });    

    test("should authenticate a valid user", async () => {
        for (const { wallet, storage } of ctxs) {
            // Validate keyDeriver and ensure the identityKey is defined
            if (!wallet.signer.keyDeriver) {
                throw new Error("KeyDeriver is undefined. Ensure proper initialization.");
            }
    
            const now = new Date();
            const identityKey = wallet.signer.keyDeriver.identityKey;
    
            // Check if the user already exists
            const existingUsers = await storage.findUsers({ partial: { identityKey } });
            if (existingUsers.length === 0) {
                await storage.insertUser({
                    created_at: now,
                    updated_at: now,
                    userId: 0,
                    identityKey,
                });
            }
    
            const result = await wallet.waitForAuthentication({});
            expect(result).toEqual({ authenticated: true });
        }
    });
    
    

    test("should fail gracefully when user cannot be found and addIfNew = false", async () => {
        for (const { wallet, storage } of ctxs) {
            // Clear users to simulate no user found
            await storage.dropAllData();

            await expectToThrowWERR(
                sdk.WERR_INVALID_PARAMETER,
                async () => await wallet.waitForAuthentication({})
            );
        }
    });

    test("should create and authenticate a new user when addIfNew = true", async () => {
        for (const { wallet, storage } of ctxs) {
            // Validate that keyDeriver is defined
            if (!wallet.signer.keyDeriver) {
                throw new Error("KeyDeriver is undefined. Ensure proper initialization.");
            }

            // Clear users to simulate no user found
            await storage.dropAllData();

            // Simulate addIfNew = true behavior
            const result = await wallet.waitForAuthentication({});
            expect(result).toEqual({ authenticated: true });

            // Verify the user was added to storage
            const users = await storage.findUsers({
                partial: { identityKey: wallet.signer.keyDeriver.identityKey },
            });
            expect(users.length).toBe(1);
        }
    });

    test("should handle invalid parameter inputs gracefully", async () => {
        for (const { wallet } of ctxs) {
            const invalidInputs = [
                undefined, // No input
                null, // Null input
                123, // Invalid type
                { extra: "invalid" }, // Unexpected property
            ];

            for (const input of invalidInputs) {
                await expectToThrowWERR(
                    sdk.WERR_INVALID_PARAMETER,
                    () => wallet.waitForAuthentication(input as any)
                );
            }
        }
    });

    test("should handle storage errors during user lookup", async () => {
        for (const { wallet, storage } of ctxs) {
            // Intentionally destroy storage to simulate a storage failure
            await storage.destroy();

            await expect(wallet.waitForAuthentication({})).rejects.toThrow("Storage is unavailable");
        }
    });

    test("should handle storage errors during user insertion", async () => {
        for (const { wallet, storage } of ctxs) {
            // Ensure no user exists
            await storage.dropAllData();

            // Temporarily override the insertUser method to throw an error
            const originalInsertUser = storage.insertUser;
            storage.insertUser = async () => {
                throw new Error("Insert user failed");
            };

            await expect(wallet.waitForAuthentication({})).rejects.toThrow("Insert user failed");

            // Restore the original method
            storage.insertUser = originalInsertUser;
        }
    });
});
