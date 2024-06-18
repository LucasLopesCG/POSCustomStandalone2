import { product } from "./product";

export class hhBXGO {
  products: Array<product>;
  triggerCount: number;
  constructor(obj) {
    this.products = obj.products;
    this.triggerCount = obj.triggerCount;
  }
}
