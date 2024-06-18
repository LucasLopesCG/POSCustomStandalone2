export class Money {
  name: string;
  count: number;
  value: number;
  constructor(obj) {
    this.value = obj.value;
    this.name = obj.name;
    this.count = obj.count;
  }
}
