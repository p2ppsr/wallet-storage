/**
 * StorageServer.ts
 *
 * A server-side class that "has a" local WalletStorage (like a StorageKnex instance),
 * and exposes it via a JSON-RPC POST endpoint using Express.
 */

import * as bsv from '@bsv/sdk'
import express, { Request, Response } from 'express'
import { AuthMiddlewareOptions, createAuthMiddleware } from '@bsv/auth-express-middleware'
import { createPaymentMiddleware } from '@bsv/payment-express-middleware'
import { sdk, Wallet, StorageProvider } from '../../index.all'

import { StorageKnex } from '../StorageKnex'

export interface WalletStorageServerOptions {
  port: number
  wallet: Wallet
  monetize: boolean
  calculateRequestPrice?: (req: Request) => number | Promise<number>
}

export class StorageServer {
  private app = express()
  private port: number
  private storage: StorageProvider
  private wallet: Wallet
  private monetize: boolean
  private calculateRequestPrice?: (req: Request) => number | Promise<number>

  constructor(storage: StorageProvider, options: WalletStorageServerOptions) {
    this.storage = storage
    this.port = options.port
    this.wallet = options.wallet
    this.monetize = options.monetize
    this.calculateRequestPrice = options.calculateRequestPrice

    this.setupRoutes()
  }

  private setupRoutes(): void {
    this.app.use(express.json({ limit: '30mb' }))

    // This allows the API to be used everywhere when CORS is enforced
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', '*')
      res.header('Access-Control-Allow-Methods', '*')
      res.header('Access-Control-Expose-Headers', '*')
      res.header('Access-Control-Allow-Private-Network', 'true')
      if (req.method === 'OPTIONS') {
        // Handle CORS preflight requests to allow cross-origin POST/PUT requests
        res.sendStatus(200)
      } else {
        next()
      }
    })

    const options: AuthMiddlewareOptions = {
      wallet: this.wallet as bsv.Wallet
    }
    this.app.use(createAuthMiddleware(options))
    if (this.monetize) {
      this.app.use(
        createPaymentMiddleware({
          wallet: this.wallet as bsv.Wallet,
          calculateRequestPrice: this.calculateRequestPrice || (() => 100)
        })
      )
    }

    // A single POST endpoint for JSON-RPC:
    this.app.post('/', async (req: Request, res: Response) => {
      let { jsonrpc, method, params, id } = req.body

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
        } else if (typeof (this.storage as any)[method] === 'function') {
          // method is on the walletStorage:
          // Find user
          switch (method) {
            case 'destroy': {
              console.log(`StorageServer: method=${method} IGNORED`)
              return res.json({ jsonrpc: '2.0', result: undefined, id })
            }
            case 'getSettings': {
              /** */
            } break;
            case 'findOrInsertUser': {
              if (params[0] !== req.auth.identityKey)
                throw new sdk.WERR_UNAUTHORIZED('function may only access authenticated user.');
            } break;
            default: {
              if (typeof params[0] !== 'object' || !params[0]) {
                params = [{}]
              }
              if (params[0]['identityKey'] && params[0]['identityKey'] !== req.auth.identityKey)
                throw new sdk.WERR_UNAUTHORIZED('identityKey does not match authentiation')
              console.log('looking up user with identityKey:', req.auth.identityKey)
              const { user, isNew } = await this.storage.findOrInsertUser(req.auth.identityKey)
              params[0].reqAuthUserId = user.userId
              if (params[0]['identityKey']) params[0].userId = user.userId;
            } break;
          }
          console.log(`StorageServer: method=${method} params=${JSON.stringify(params).slice(0, 100)}`)
          const result = await (this.storage as any)[method](...(params || []))
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
