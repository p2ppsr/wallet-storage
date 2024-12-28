import { sdk } from "../../.."

export interface Certificate extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   certificateId: number
   userId: number
   type: sdk.Base64String
   serialNumber: sdk.Base64String
   certifier: sdk.PubKeyHex
   subject: sdk.PubKeyHex
   verifier?: sdk.PubKeyHex
   revocationOutpoint: sdk.OutpointString
   signature: sdk.HexString
   isDeleted: boolean
}


