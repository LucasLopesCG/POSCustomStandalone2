import { accessLevel } from "./accessLevel";
import { storeLocationEnum } from "./storeLocation";

export class User {
  id?: string;
  name?: string;
  photoUrl?: string;
  phoneNumber?: number;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
  accessLevel?: accessLevel;
  locationAccess?: Array<{
    location: storeLocationEnum;
    isRestaurant: boolean;
    configId: number;
    name: string;
    inUse: boolean;
    cashInRegister: number;
    cashier: string;
    sessionId: number;
    order_ids: Array<number>;
  }>;
}
