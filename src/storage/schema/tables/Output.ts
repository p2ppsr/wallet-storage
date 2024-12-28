import { sdk } from "../../.."

export interface Output extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   outputId: number
   userId: number
   transactionId: number
   basketId?: number
   spendable: boolean
   change: boolean
   vout: number
   satoshis: number
   providedBy: string
   purpose: string
   type: string
   txid?: string
   senderIdentityKey?: sdk.PubKeyHex
   derivationPrefix?: sdk.Base64String
   derivationSuffix?: sdk.Base64String
   customInstructions?: string
   spentBy?: number
   sequenceNumber?: number
   spendingDescription?: string
   scriptLength?: number
   scriptOffset?: number
   lockingScript?: number[]
}

export const outputColumnsWithoutLockingScript = [
   'created_at',
   'updated_at',
   'outputId',
   'userId',
   'transactionId',
   'basketId',
   'spendable',
   'change',
   'vout',
   'satoshis',
   'providedBy',
   'purpose',
   'type',
   'outputDescription',
   'txid',
   'senderIdentityKey',
   'derivationPrefix',
   'derivationSuffix',
   'customInstructions',
   'spentBy',
   'sequenceNumber',
   'spendingDescription',
   'scriptLength',
   'scriptOffset',
   //'lockingScript',
]