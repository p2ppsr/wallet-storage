import * as bsv from '@bsv/sdk'
import { sdk } from '../../../src/index.client'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'

describe('listActions tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('listActionsTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('listActionsTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('0 invalid params', async () => {
    for (const { wallet } of ctxs) {
      const invalidArgs: bsv.ListActionsArgs[] = [
        { labels: [] },
        { includeLabels: true, labels: [] }
        // Oh so many things to test...
      ]

      for (const args of invalidArgs) {
        await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.listActions(args))
      }
    }
  })

  test('3_label babbage_protocol_perm', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeLabels: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        expect(r.totalActions).toBeGreaterThanOrEqual(r.actions.length)
        expect(r.actions.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.actions) {
          expect(a.inputs).toBeUndefined()
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.labels)).toBe(true)
          expect(a.labels?.indexOf('babbage_protocol_perm')).toBeGreaterThan(-1)
        }
      }
    }
  })

  test('4_label babbage_protocol_perm', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeLabels: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        expect(r.totalActions).toBeGreaterThanOrEqual(r.actions.length)
        expect(r.actions.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.actions) {
          expect(a.inputs).toBeUndefined()
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.labels)).toBe(true)
          for (const label of args.labels) {
            expect(a.labels?.indexOf(label)).toBeGreaterThan(-1)
          }
        }
      }
    }
  })

  test('5_label babbage_protocol_perm or babbage_basket_access', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeLabels: true,
          labels: ['babbage_protocol_perm', 'babbage_basket_access']
        }
        const r = await wallet.listActions(args)
        expect(r.totalActions).toBeGreaterThanOrEqual(r.actions.length)
        expect(r.actions.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.actions) {
          expect(a.inputs).toBeUndefined()
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.labels)).toBe(true)
          let count = 0
          for (const label of args.labels) {
            if (a.labels!.indexOf(label) > -1) count++
          }
          expect(count).toBeGreaterThan(0)
        }
      }
    }
  })

  test('6_label babbage_protocol_perm and babbage_basket_access', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeLabels: true,
          labels: ['babbage_protocol_perm', 'babbage_basket_access'],
          labelQueryMode: 'all'
        }
        const r = await wallet.listActions(args)
        expect(r.totalActions).toBe(0)
      }
    }
  })

  test('7_includeOutputs', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeOutputs: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        expect(r.totalActions).toBeGreaterThanOrEqual(r.actions.length)
        expect(r.actions.length).toBe(args.limit || 10)
        let i = 0
        for (const a of r.actions) {
          expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
          expect(a.inputs).toBeUndefined()
          expect(Array.isArray(a.outputs)).toBe(true)
          expect(a.labels).toBeUndefined()
          for (const o of a.outputs!) {
            expect(o.outputIndex).toBeGreaterThanOrEqual(0)
            expect(o.lockingScript).toBeUndefined()
          }
        }
      }
    }
  })

  test('8_includeOutputs and script', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeOutputs: true,
          includeOutputLockingScripts: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        let i = 0
        for (const a of r.actions) {
          for (const o of a.outputs!) {
            expect(o.lockingScript?.length).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  test('9_includeInputs', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeInputs: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        let i = 0
        for (const a of r.actions) {
          expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.inputs)).toBe(true)
          expect(a.labels).toBeUndefined()
          for (const i of a.inputs!) {
            expect(i.sourceLockingScript).toBeUndefined()
            expect(i.unlockingScript).toBeUndefined()
          }
        }
      }
    }
  })

  test('10_includeInputs and unlock', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeInputs: true,
          includeInputUnlockingScripts: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        let i = 0
        for (const a of r.actions) {
          expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.inputs)).toBe(true)
          expect(a.labels).toBeUndefined()
          for (const i of a.inputs!) {
            expect(i.sourceLockingScript).toBeUndefined()
            expect(i.unlockingScript?.length).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  test('11_includeInputs and lock', async () => {
    for (const { wallet } of ctxs) {
      {
        const args: bsv.ListActionsArgs = {
          includeInputs: true,
          includeInputSourceLockingScripts: true,
          labels: ['babbage_protocol_perm']
        }
        const r = await wallet.listActions(args)
        let i = 0
        for (const a of r.actions) {
          expect(a.isOutgoing === true || a.isOutgoing === false).toBe(true)
          expect(a.outputs).toBeUndefined()
          expect(Array.isArray(a.inputs)).toBe(true)
          expect(a.labels).toBeUndefined()
          for (const i of a.inputs!) {
            expect(i.sourceLockingScript?.length).toBeGreaterThan(0)
            expect(i.unlockingScript).toBeUndefined()
          }
        }
      }
    }
  })
  test.skip('12_no labels default any', async () => {
    for (const { wallet } of ctxs) {
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

  test.skip('17_label does not exist default any', async () => {
    for (const { wallet } of ctxs) {
      const args: bsv.ListActionsArgs = {
        labels: ['nonexistantlabel']
      }

      const expectedResult = JSON.parse('{"totalActions":0,"actions":[]}')

      expect(await wallet.listActions(args)).toEqual(expectedResult)
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
