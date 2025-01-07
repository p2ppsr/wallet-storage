/**
 * StorageServer.ts
 *
 * A server-side class that "has a" local WalletStorage (like a StorageKnex instance),
 * and exposes it via a JSON-RPC POST endpoint using Express.
 */

import express, { Request, Response } from "express"

// You have your local or imported `WalletStorage` interface:
import { WalletStorage } from "./WalletStorage" // adjust import path
// Or your known local implementation:
import { StorageKnex } from "./StorageKnex" // adjust path as needed

export interface WalletStorageServerOptions {
    port: number
    // Possibly more config, e.g. "basePath"
}

export class StorageServer {
    private app = express()
    private port: number
    private walletStorage: WalletStorage

    constructor(walletStorage: WalletStorage, options: WalletStorageServerOptions) {
        this.walletStorage = walletStorage
        this.port = options.port

        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.app.use(express.json())

        // A single POST endpoint for JSON-RPC:
        this.app.post("/", async (req: Request, res: Response) => {
            const { jsonrpc, method, params, id } = req.body

            // Basic JSON-RPC protocol checks:
            if (jsonrpc !== "2.0" || !method || typeof method !== "string") {
                return res.status(400).json({ error: { code: -32600, message: "Invalid Request" } })
            }

            try {
                // Dispatch the method call:
                if (typeof (this as any)[method] === "function") {
                    // if you wanted to handle certain methods on the server class itself
                    // e.g. this['someServerMethod'](params)
                    throw new Error("Server method dispatch not used in this approach.")
                } else if (typeof (this.walletStorage as any)[method] === "function") {
                    // method is on the walletStorage:
                    const result = await (this.walletStorage as any)[method](...(params || []))
                    return res.json({ jsonrpc: "2.0", result, id })
                } else {
                    // Unknown method
                    return res.status(400).json({
                        jsonrpc: "2.0",
                        error: { code: -32601, message: `Method not found: ${method}` },
                        id
                    })
                }
            } catch (error) {
                // Catch any thrown errors from the local walletStorage method
                const err = error as Error
                return res.status(200).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32000,
                        message: err.message,
                        data: {
                            name: err.name,
                            stack: err.stack
                        }
                    },
                    id
                })
            }
        })
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`WalletStorageServer listening at http://localhost:${this.port}`)
        })
    }
}

/******************************************************************************
 * Example usage:
 * 
 * import Knex from 'knex'
 * 
 * async function main() {
 *   const knexInstance = Knex({
 *     client: 'sqlite3', // or 'mysql', etc.
 *     connection: { filename: './test.db' },
 *     useNullAsDefault: true
 *   })
 * 
 *   const storage = new StorageKnex({
 *     knex: knexInstance,
 *     chain: 'test',
 *     feeModel: { model: 'sat/kb', value: 1 },
 *     commissionSatoshis: 0
 *   })
 * 
 *   // Must init storage (migrate, or otherwise):
 *   await storage.makeAvailable() 
 *   await storage.migrate("MyRemoteStorage")
 * 
 *   const serverOptions: WalletStorageServerOptions = { port: 3000 }
 *   const server = new WalletStorageServer(storage, serverOptions)
 *   server.start()
 * }
 * 
 * main().catch(console.error)
 ******************************************************************************/
