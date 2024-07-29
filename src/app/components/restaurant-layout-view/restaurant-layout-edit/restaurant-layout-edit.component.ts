import { AfterViewInit, Component, ElementRef } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { storeService } from "../../../services/storeService";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { restaurantLayout } from "../../../models/restaurantLayout";
import { table } from "../../../models/table";
import { stool } from "../../../models/stool";
import { bar } from "../../../models/bar";
import { WordPressService } from "../../../services/wordpress.service";

@Component({
  selector: "app-restaurant-layout-edit",
  standalone: true,
  imports: [MatIcon, CdkDrag, CommonModule, FormsModule],
  templateUrl: "./restaurant-layout-edit.component.html",
  styleUrl: "./restaurant-layout-edit.component.css",
})
export class RestaurantLayoutEditComponent implements AfterViewInit {
  discountForCurrentStoreArray: any = [];
  storeId: number = -99;
  layout: restaurantLayout = {
    tables: [],
    bars: [],
    stools: [],
    dimensions: [0, 0],
  };
  pristingLayout: restaurantLayout = {
    tables: [],
    bars: [],
    stools: [],
    dimensions: [0, 0],
  };
  newObjHeight: number = 200;
  newObjWidth: number = 200;
  newObjRadius: number = 50;
  storeName: any = {};
  storeDimensions: any = {};
  constructor(
    private storeService: storeService,
    private elementRef: ElementRef,
    private wordpressService: WordPressService,
  ) {
    this.storeService.currentStoreLayout$.subscribe((val) => {
      this.layout = val;
      this.pristingLayout = structuredClone(val);
    });
    storeService.storeId$.subscribe((val) => {
      this.storeId = val;
    });
    this.storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.storeName = val;
    });
    this.storeService.discountsForCurrentStore$.subscribe((val) => {
      this.discountForCurrentStoreArray = val;
    });
    // this.storeService.layoutForCurrentRestaurant$.subscribe((val) => {
    //   this.layout = val;
    // });
  }

  ngAfterViewInit() {
    const boundaryElement = this.elementRef.nativeElement.querySelector(".p-3");
    this.storeDimensions = {
      width: boundaryElement.offsetWidth,
      height: boundaryElement.offsetHeight,
    };

    if (this.layout.tables) {
      this.layout.tables.forEach((table, index) => {
        const tableElement = this.elementRef.nativeElement.querySelector(
          `#table_${table.id}`,
        );
        tableElement.style.top = `${table.location[1]}px`;
        tableElement.style.left = `${table.location[0]}px`;
      });
    }

    if (this.layout.bars) {
      this.layout.bars.forEach((bar, index) => {
        const barElement = this.elementRef.nativeElement.querySelector(
          `#bar${bar.id}`,
        );
        barElement.style.top = `${bar.location[1]}px`;
        barElement.style.left = `${bar.location[0]}px`;
      });
    }

    if (this.layout.stools) {
      this.layout.stools.forEach((stool, index) => {
        const stoolElement = this.elementRef.nativeElement.querySelector(
          `#stool${stool.id}`,
        );
        stoolElement.style.top = `${stool.location[1]}px`;
        stoolElement.style.left = `${stool.location[0]}px`;
      });
    }
  }

  dragTableEnd(event, index) {
    const boundaryRect = document
      .querySelector(".p-3")
      ?.getBoundingClientRect();
    const parentRect =
      event.source.element.nativeElement.parentNode.getBoundingClientRect();
    if (
      this.layout &&
      this.layout.tables &&
      this.layout.tables[index] &&
      !this.layout.tables[index].location
    ) {
      this.layout.tables[index].location = [];
    }
    if (boundaryRect) {
      this.layout.tables[index].location[0] =
        event.dropPoint.x - boundaryRect.left;
      this.layout.tables[index].location[1] =
        event.dropPoint.y - boundaryRect.top;
      //console.log(this.layout);
    }
    // this.layout.tables[index].location[0] =
    //   event.dropPoint.x;
    // this.layout.tables[index].location[1] =
    //   event.dropPoint.y;
    // console.log(this.layout);
  }
  dragBarEnd(event, index) {
    const parentRect =
      event.source.element.nativeElement.parentNode.getBoundingClientRect();
    const boundaryRect = document
      .querySelector(".p-3")
      ?.getBoundingClientRect();
    if (
      this.layout &&
      this.layout.bars &&
      this.layout.bars[index] &&
      !this.layout.bars[index].location
    ) {
      this.layout.bars[index].location = [];
    }
    if (boundaryRect) {
      this.layout.bars[index].location[0] =
        event.dropPoint.x - boundaryRect.left;
      this.layout.bars[index].location[1] =
        event.dropPoint.y - boundaryRect.top;
    }
    // this.layout.bars[index].location[0] = event.dropPoint.x;
    // this.layout.bars[index].location[1] = event.dropPoint.y;
    //console.log(this.layout);
  }
  dragStoolEnd(event, index) {
    const parentRect =
      event.source.element.nativeElement.parentNode.getBoundingClientRect();
    const boundaryRect = document
      .querySelector(".p-3")
      ?.getBoundingClientRect();
    if (
      this.layout &&
      this.layout.stools &&
      this.layout.stools[index] &&
      !this.layout.stools[index].location
    ) {
      this.layout.stools[index].location = [];
    }
    if (boundaryRect) {
      this.layout.stools[index].location[0] =
        event.dropPoint.x - boundaryRect.left;
      this.layout.stools[index].location[1] =
        event.dropPoint.y - boundaryRect.top;
    }
    // this.layout.stools[index].location[0] = event.dropPoint.x;
    // this.layout.stools[index].location[1] = event.dropPoint.y;
    //console.log(this.layout);
  }

  addNewTableToLayout(x: number, y: number) {
    if (!this.layout.tables) this.layout.tables = [];
    var tableId = this.layout.tables.length + 1;
    var newTable: table = {
      id: tableId,
      location: [0, 0],
      height: y + "px",
      width: x + "px",
      dimensions: [200, 200],
      order: {},
    };
    this.layout.tables.push(newTable);
    const boundaryElement = this.elementRef.nativeElement.querySelector(".p-3");
    this.storeDimensions = {
      width: boundaryElement.offsetWidth,
      height: boundaryElement.offsetHeight,
    };
  }

  deleteTableFromLayout(i) {
    var count: number = 0;
    let newTableArray: Array<table> = [];
    this.layout.tables.forEach((table) => {
      if (i != count) {
        newTableArray.push(table);
      }
      count++;
    });
    this.layout.tables = newTableArray;
  }

  addNewBarToLayout(x: number, y: number) {
    if (!this.layout.bars) this.layout.bars = [];
    var tableId = this.layout.bars.length + 1;
    var newBar: bar = {
      id: tableId,
      location: [0, 0],
      height: y + "px",
      width: x + "px",
      dimensions: [200, 200],
    };
    this.layout.bars.push(newBar);
    const boundaryElement = this.elementRef.nativeElement.querySelector(".p-3");
    this.storeDimensions = {
      width: boundaryElement.offsetWidth,
      height: boundaryElement.offsetHeight,
    };
  }

  deleteBarFromLayout(i) {
    var count: number = 0;
    let newBarArray: Array<bar> = [];
    this.layout.bars.forEach((bar) => {
      if (i != count) {
        newBarArray.push(bar);
      }
      count++;
    });
    this.layout.bars = newBarArray;
  }

  addNewStoolToLayout(r: number) {
    if (!this.layout.stools) this.layout.stools = [];
    var tableId = this.layout.stools.length + 1;
    var newStool: stool = {
      id: tableId,
      location: [0, 0],
      radius: r,
      order: {},
    };
    this.layout.stools.push(newStool);
    const boundaryElement = this.elementRef.nativeElement.querySelector(".p-3");
    this.storeDimensions = {
      width: boundaryElement.offsetWidth,
      height: boundaryElement.offsetHeight,
    };
  }

  deleteStoolFromLayout(i) {
    var count: number = 0;
    let newStoolArray: Array<stool> = [];
    this.layout.stools.forEach((stool) => {
      if (i != count) {
        newStoolArray.push(stool);
      }
      count++;
    });
    this.layout.stools = newStoolArray;
  }

  cancelLayoutChanges() {
    this.storeService.saveCurrentStoreLayout(this.pristingLayout);
    this.close();
  }

  saveLayoutChanges() {
    this.storeService.saveCurrentStoreLayout(this.layout);
    var storeData = {
      id: this.storeId,
      name: this.storeName.location,
      layout: JSON.stringify(this.layout),
      discounts: JSON.stringify(this.discountForCurrentStoreArray),
    };
    this.wordpressService.updateStore(storeData);
    //console.log(this.layout);
    this.close();
  }

  close() {
    //this.dialogRef.close();
    //THIS Needs to change to instead be a call to a service that changes the mode back to view.
    this.storeService.setCurrentRestaurantMode("view");
    //this.storeService.saveCurrentStoreLayout(this.layout);
  }
}
