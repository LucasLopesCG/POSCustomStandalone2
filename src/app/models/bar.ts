export class bar {
  id: number;
  height: string;
  width: string;
  location: Array<number>;
  dimensions: Array<number>;
  constructor(obj) {
    this.id = obj.id;
    this.width = obj.width;
    this.height = obj.height;
    this.location = obj.location;
    this.dimensions = obj.dimensions;
  }
}
