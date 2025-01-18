import * as bsv from '@bsv/sdk'
import { sdk, table } from "../../.."

export interface Certificate extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   certificateId: number
   userId: number
   type: bsv.Base64String
   serialNumber: bsv.Base64String
   certifier: bsv.PubKeyHex
   subject: bsv.PubKeyHex
   verifier?: bsv.PubKeyHex
   revocationOutpoint: bsv.OutpointString
   signature: bsv.HexString
   isDeleted: boolean
}

export interface CertificateX extends table.Certificate {
   fields?: table.CertificateField[]
}

