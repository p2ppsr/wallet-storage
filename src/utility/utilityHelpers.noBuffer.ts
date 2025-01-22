import * as bsv from '@bsv/sdk'

/**
 * Coerce a value to a hex encoded string if currently a hex encoded string or number[]
 * @param val string or number[]. If string, encoding must be hex. If number[], each value must be 0..255.
 * @returns input val if it is a string; or if number[], converts byte values to hex
 * @publicbody
 */
export function asString(val: string | number[]): string {
  if (typeof val === 'string') return val
  return bsv.Utils.toHex(val)
}

export function asArray(val: string | number[]): number[] {
  if (Array.isArray(val)) return val
  let a: number[] = bsv.Utils.toArray(val, 'hex')
  return a
}
