import { sdk } from "../../.."

export interface CertificateField extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   userId: number
   certificateId: number
   fieldName: string
   fieldValue: string
   masterKey: sdk.Base64String
}


