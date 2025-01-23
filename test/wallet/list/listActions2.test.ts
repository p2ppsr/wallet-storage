import * as bsv from '@bsv/sdk'
import { sdk, StorageProvider, table } from '../../../src/index.client'
import { _tu, expectToThrowWERR, TestSetup1, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { asBuffer, StorageKnex } from '../../../src'
import { Script, Transaction, TransactionInput } from '@bsv/sdk'

describe.skip('listActions tests', () => {
  jest.setTimeout(99999999)

  const storages: StorageProvider[] = []
  const chain: sdk.Chain = 'test'
  const setups: { setup: TestSetup1; storage: StorageProvider }[] = []

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) {
      ctxs.push(await _tu.createLegacyWalletMySQLCopy('listActionsTests'))
    }
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listActionsTests'))

    for (const ctx of ctxs) {
      const { activeStorage } = ctx
      await activeStorage.dropAllData()
      await activeStorage.migrate('insert tests', '1'.repeat(64))
      //setups.push({ storage: activeStorage, setup: await _tu.createTestSetup2(activeStorage) })
    }

    expect(setups).toBeTruthy() // Ensure setups were initialized correctly
    for (const { storage, setup } of setups) {
    }
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('12_no labels default any', async () => {
    for (const { wallet } of ctxs) {
      //setup.u1label1.label = 'label1'
      const args: bsv.ListActionsArgs = {
        labels: []
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('13_no labels any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: [],
        labelQueryMode: 'any'
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('14_no labels all', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: [],
        labelQueryMode: 'all'
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('15_empty label default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['']
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('16_label is space character default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: [' ']
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test('17_label does not exist default any', async () => {
    for (const { wallet } of ctxs) {
      for (const { storage, setup } of setups) {
        setup.u1label1.label = 'label1'
        const args: bsv.ListActionsArgs = {
          labels: ['nonexistantlabel']
        }

        const expectedResult = JSON.parse('{"totalActions":0,"actions":[]}')

        expect(await wallet.listActions(args)).toEqual(expectedResult)
      }
    }
  })

  test.skip('18_label min 1 character default any', async () => {
    for (const { wallet } of ctxs) {
      const minLengthLabel = 'a'
      const args: bsv.ListActionsArgs = {
        labels: [minLengthLabel]
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('19_label max 300 spaces default any', async () => {
    for (const { wallet } of ctxs) {
      const maxLengthLabel = ' '.repeat(300)
      const args: bsv.ListActionsArgs = {
        labels: [maxLengthLabel]
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('20_label max 300 normal characters default any', async () => {
    for (const { wallet } of ctxs) {
      const maxLengthLabel = 'a'.repeat(300)
      const args: bsv.ListActionsArgs = {
        labels: [maxLengthLabel]
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('21_label max 300 spaces trimmed default any', async () => {
    for (const { wallet } of ctxs) {
      const maxLengthLabel = ' '.repeat(300).trim()
      const args: bsv.ListActionsArgs = {
        labels: [maxLengthLabel]
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })
  test.skip('22_label exceeding max length default any', async () => {
    for (const { wallet } of ctxs) {
      const tooLongLabel = 'a'.repeat(301)
      const args: bsv.ListActionsArgs = {
        labels: [tooLongLabel]
      }

      await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, async () => await wallet.listActions(args))
    }
  })

  test.skip('23_label exceeding max length with leading spaces default any', async () => {
    for (const { wallet } of ctxs) {
      const validLabelWhenTrimmed = '  ' + 'a'.repeat(300)
      const args: bsv.ListActionsArgs = {
        labels: [validLabelWhenTrimmed]
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('24_normal label default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('25_normal label any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        labelQueryMode: 'any'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('26_normal label all', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        labelQueryMode: 'all'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('27_label mixed case default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['LAbEL']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('28_label special characters default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['@special#label!']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('29_label leading and trailing whitespace default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['  label  ']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('30_label numeric default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['12345']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('31_label alphanumeric default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['abcde12345']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })
  test.skip('32_label contains default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['labelOne']
      }

      const expectedResult = JSON.parse('{"totalActions":0,"actions":[]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('33_label different case lower any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        labelQueryMode: 'any'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('34_label different case upper any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['LABEL'],
        labelQueryMode: 'any'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('35_label with whitespace default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['lab  el']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('36_label different case lower all', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        labelQueryMode: 'all'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('37_label different case upper all', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['LABEL'],
        labelQueryMode: 'all'
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('38_label duplicated default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label', 'label']
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('39_label requested default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        includeLabels: true
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"status":"completed","isOutgoing":true,"labels":["label"],"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test.skip('40_label not requested default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label'],
        includeLabels: false
      }

      const expectedResult = JSON.parse('{"totalActions":1,"actions":[{"txid":"tx","satoshis":1,"isOutgoing":true,"description":"Transaction","version":1,"lockTime":0}]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })

  test('41_label partial match default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['label']
      }

      const expectedResult = JSON.parse('{"totalActions":0,"actions":[]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
    }
  })
})
