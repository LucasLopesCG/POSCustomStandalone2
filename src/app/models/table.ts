import { order } from "./order";

export class table {
  id: number;
  location: Array<number>;
  width: string;
  height: string;
  dimensions: Array<number>;
  order: order;
  constructor(obj) {
    this.id = obj.id;
    this.location = obj.location;
    this.width = obj.width + "px";
    this.height = obj.height + "px";
    this.dimensions = obj.dimensions;
    this.order = obj.order;
  }
}
