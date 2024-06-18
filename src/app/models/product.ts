import { categoryEnum } from "./categoryEnum";

export class product {
  id?: number;
  name?: string;
  price?: number;
  category?: Array<categoryEnum>;
  stock?: number;
  variantName?: string;
  image?: string;
  happyHourDiscount?: boolean = false;
  bxgo?: number = 0;
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.price = obj.price;
    this.stock = obj.stock;
    this.variantName = obj.variantName;
    this.image = obj.image;
    this.happyHourDiscount = false;
  }
}
