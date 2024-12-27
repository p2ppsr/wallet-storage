import path from 'path'
import { promises as fsp } from 'fs'
import { randomBytesHex, sdk } from '../../src'

import { Knex, knex as makeKnex } from "knex";

import * as dotenv from 'dotenv'
dotenv.config();

const localMySqlConnection = process.env.LOCAL_MYSQL_CONNECTION || ''

export abstract class TestUtilsWalletStorage {

    /**
     * Returns path to temporary file in project's './test/data/tmp/' folder.
     * 
     * Creates any missing folders.
     * 
     * Optionally tries to delete any existing file. This may fail if the file file is locked
     * by another process.
     * 
     * Optionally copies filename (or if filename has no dir component, a file of the same filename from the project's './test/data' folder) to initialize file's contents.
     * 
     * CAUTION: returned file path will include four random hex digits unless tryToDelete is true. Files must be purged periodically.
     * 
     * @param filename target filename without path, optionally just extension in which case random name is used
     * @param tryToDelete true to attempt to delete an existing file at the returned file path.
     * @param copyToTmp true to copy file of same filename from './test/data' (or elsewhere if filename has path) to tmp folder
     * @returns path in './test/data/tmp' folder.
     */
    static async newTmpFile(filename = '', tryToDelete = false, copyToTmp = false): Promise<string> {
        const tmpFolder = './test/data/tmp/'
        const p = path.parse(filename)
        const dstDir = tmpFolder
        const dstName = `${p.name}${tryToDelete ? '' : randomBytesHex(6)}`
        const dstExt = p.ext || 'tmp'
        const dstPath = path.resolve(`${dstDir}${dstName}${dstExt}`)
        await fsp.mkdir(tmpFolder, { recursive: true })
        if (tryToDelete || copyToTmp)
            try {
                await fsp.unlink(dstPath)
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                if (e.name !== 'ENOENT') {
                    throw e
                }
            }
        if (copyToTmp) {
            const srcPath = p.dir ? path.resolve(filename) : path.resolve(`./test/data/${filename}`)
            await fsp.copyFile(srcPath, dstPath)
        }
        return dstPath
    }

    static createLocalSQLite (filename: string) : Knex {
        const config: Knex.Config = {
            client: 'sqlite3',
            connection: { filename },
            useNullAsDefault: true,
        }
        const knex = makeKnex(config)
        return knex
    }

    static createLocalMySQL (database: string) : Knex {
        const connection = JSON.parse(localMySqlConnection || '{}')
        connection['database'] = database
        const config: Knex.Config = {
            client: 'mysql2',
            connection,
            useNullAsDefault: true,
            pool: { min: 0, max: 7, idleTimeoutMillis: 15000 }
        }
        const knex = makeKnex(config)
        return knex
    }
}

export abstract class _tu extends TestUtilsWalletStorage {
}
