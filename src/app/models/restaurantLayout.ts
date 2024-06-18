import { bar } from "./bar";
import { stool } from "./stool";
import { table } from "./table";

export class restaurantLayout {
  tables: Array<table>;
  bars: Array<bar>;
  stools: Array<stool>;
  dimensions: Array<number>;
  constructor(obj) {
    this.tables = obj.tables;
    this.bars = obj.bars;
    this.stools = obj.stools;
    this.dimensions = obj.dimensions;
  }
}
