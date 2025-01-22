import * as bsv from '@bsv/sdk'
import { sdk } from "../../../index.client"

export interface CertificateField extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   userId: number
   certificateId: number
   fieldName: string
   fieldValue: string
   masterKey: bsv.Base64String
}


