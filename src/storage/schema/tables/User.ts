import { sdk } from "../../.."

export interface User extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   userId: number
   /**
    * PubKeyHex uniquely identifying user.
    * Typically 66 hex digits. 
    */
   identityKey: string
}


