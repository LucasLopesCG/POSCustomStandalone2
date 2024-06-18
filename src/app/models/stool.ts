import { order } from "./order";

export class stool {
  id: number;
  location: Array<number>;
  radius: number;
  order:order;
  constructor(obj) {
    this.id = obj.id;
    this.location = obj.location;
    this.radius = obj.radius;
    this.order=obj.order;
  }
}
