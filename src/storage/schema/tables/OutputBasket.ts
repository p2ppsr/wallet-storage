import { sdk } from "../../../index.client"

export interface OutputBasket extends sdk.EntityTimeStamp {
   created_at: Date
   updated_at: Date
   basketId: number
   userId: number
   name: string
   numberOfDesiredUTXOs: number
   minimumDesiredUTXOValue: number
   isDeleted: boolean
}


