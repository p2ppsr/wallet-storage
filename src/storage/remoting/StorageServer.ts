// @ts-nocheck
/**
 * StorageServer.ts
 *
 * A server-side class that "has a" local WalletStorage (like a StorageKnex instance),
 * and exposes it via a JSON-RPC POST endpoint using Express.
 */

import express, { Request, Response } from 'express'
import { AuthMiddlewareOptions, createAuthMiddleware } from '@bsv/auth-express-middleware'
import { createPaymentMiddleware } from '@bsv/payment-express-middleware'
import { ProtoWallet, Wallet } from '@bsv/sdk'
import { sdk } from '../..'

// You have your local or imported `WalletStorage` interface:
import { SignerStorage } from './SignerStorage' // adjust import path
// Or your known local implementation:
import { StorageKnex } from '../StorageKnex' // adjust path as needed

export interface WalletStorageServerOptions {
  port: number
  wallet: Wallet
  monetize: boolean
}

export class StorageServer {
  private app = express()
  private port: number
  private walletStorage: sdk.WalletStorage
  private wallet: Wallet
  private monetize: boolean

  constructor(walletStorage: sdk.WalletStorage, options: WalletStorageServerOptions) {
    this.walletStorage = walletStorage
    this.port = options.port
    this.wallet = options.wallet
    this.monetize = options.monetize

    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.app.use(express.json())

    // A single POST endpoint for JSON-RPC:
    this.app.post('/',
      // Conditionally run auth middleware
      (req: Request, res: Response, next: Function) => {
        const { method } = req.body
        if (method === 'getSettings') {
          // Skip auth
          return next()
        }
        return createAuthMiddleware({ wallet: this.wallet })(req, res, next)
      },

      // Conditionally run payment middleware
      (req: Request, res: Response, next: Function) => {
        const { method } = req.body
        if (!this.monetize || method === 'getSettings') {
          // Skip payment middleware for "getSettings" or if monetization is disabled
          return next()
        }
        return createPaymentMiddleware({
          wallet: this.wallet,
          calculateRequestPrice: () => 100
        })(req, res, next)
      },
      async (req: Request, res: Response) => {
        let { jsonrpc, method, params, id } = req.body
        if (method !== 'getSettings') {
          if (typeof params[0] !== 'object' || !params[0]) {
            params = [{}]
          }
        }

        // Basic JSON-RPC protocol checks:
        if (jsonrpc !== '2.0' || !method || typeof method !== 'string') {
          return res.status(400).json({ error: { code: -32600, message: 'Invalid Request' } })
        }

        try {
          // Dispatch the method call:
          if (typeof (this as any)[method] === 'function') {
            // if you wanted to handle certain methods on the server class itself
            // e.g. this['someServerMethod'](params)
            throw new Error('Server method dispatch not used in this approach.')
          } else if (typeof (this.walletStorage as any)[method] === 'function') {
            // method is on the walletStorage:
            // Find user
            if (method !== 'getSettings') {
              const user = await this.walletStorage.findUserByIdentityKey(req.auth.identityKey)
              if (!user) {
                const userId = await this.walletStorage.insertUser({
                  identityKey: req.auth.identityKey as string,
                  userId: 0,
                  created_at: new Date(),
                  updated_at: new Date()
                })
                params[0].userId = userId
              } else {
                params[0].userId = user.userId
              }
            }
            const result = await (this.walletStorage as any)[method](...(params || []))
            return res.json({ jsonrpc: '2.0', result, id })
          } else {
            // Unknown method
            return res.status(400).json({
              jsonrpc: '2.0',
              error: { code: -32601, message: `Method not found: ${method}` },
              id
            })
          }
        } catch (error) {
          // Catch any thrown errors from the local walletStorage method
          const err = error as Error
          return res.status(200).json({
            jsonrpc: '2.0',
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

import Knex from 'knex'

async function main() {
  const knexInstance = Knex({
    client: 'sqlite3', // or 'mysql', etc.
    connection: { filename: './test.db' },
    useNullAsDefault: true
  })

  const storage = new StorageKnex({
    knex: knexInstance,
    chain: 'main',
    feeModel: { model: 'sat/kb', value: 1 },
    commissionSatoshis: 0
  })

  // Must init storage (migrate, or otherwise):
  await storage.migrate('MyRemoteStorage')
  await storage.makeAvailable()

  const serverOptions: WalletStorageServerOptions = { port: 3000, wallet: new ProtoWallet('anyone'), monetize: false }
  const server = new StorageServer(storage, serverOptions)
  server.start()
}

//main().catch(console.error)
