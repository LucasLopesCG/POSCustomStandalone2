import { SafePipe } from "../../pipes/safe";
import { Component, OnInit } from "@angular/core";
import { CurrentOrderService } from "../../services/current-order.service";
import { jsPDF } from "jspdf";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxBarcode6Module } from "ngx-barcode6";
import helvetica from "./Helvetica 400-normal";
import code128 from "./code128-normal";
import { OdooService } from "../../services/odoo.service";
import { storeService } from "../../services/storeService";

@Component({
  selector: "app-order-complete",
  templateUrl: "./order-complete.component.html",
  standalone: true,
  imports: [SafePipe, NgxBarcode6Module],
})
export class OrderCompleteComponent implements OnInit {
  order: any;
  pdfSrc: any;
  pdfRefundSrc: any;
  orderInOdoo: boolean = false;
  generateReceipt: boolean = true;
  previousOrders: Array<any> = [];
  stockFilter: string = "";
  selectedPriceList: number = 0;
  pastOrderConfigIds: Array<any> = [];
  receiptCount: number = 0;

  constructor(
    private currentOrderService: CurrentOrderService,
    private sanitizer: DomSanitizer,
    private odooService: OdooService,
    private storeService: storeService,
  ) {
    this.storeService.dataSelectedStoreLocation$.subscribe((val) => {
      switch (val.location) {
        case "Apopka":
          this.stockFilter = "APS/Stock";
          break;
        case "DeLand":
          this.stockFilter = "DL/Stock";
          break;
        case "Orlando":
          this.stockFilter = "ORL/Stock";
          break;
        case "Sanford":
          this.stockFilter = "SANFO/Stock";
          break;
      }
    });
    storeService.selectedPriceList$.subscribe((val) => {
      this.selectedPriceList = val;
    });
    storeService.pastOrdersFromStore$.subscribe((val) => {
      this.previousOrders = val;
    });
    this.currentOrderService.currentOrder$.subscribe((order) => {
      if (order) {
        this.order = order;
      }
    });
    this.odooService.pastOrderConfigIds$.subscribe((val) => {
      this.pastOrderConfigIds = val;
    });
    this.odooService.orderInOdoo$.subscribe((order) => {
      if (
        (order &&
          order.orderNumber > 0 &&
          !order.pickingId &&
          this.generateReceipt) ||
        this.receiptCount == 2
      ) {
        this.receiptCount = 1;
        //this.order.orderNumber = "POS_C_Order " + Date(); //order.orderNumber;
        this.order.orderName = "POS_C_Order " + Date(); //order.orderNumber;
        this.order.note = "POS_CUSTOM: Order By: " + this.order.cashier;
        this.order.refunded_order_ids = [];
        this.order.products.forEach((productGroup) => {
          productGroup.product.refund_orderline_ids = [];
        });
        this.generateReceipt = false;
        this.generatePdf(true);
        //Add this order to previous orders
        this.previousOrders.unshift(this.order);
        //this.previousOrders = [order].concat(this.previousOrders);
        //this.previousOrders.push(order);
        this.storeService.setPastOrdersForStore(this.previousOrders);
        if (this.stockFilter != "")
          this.odooService.getCombinedProductData(
            this.stockFilter,
            this.selectedPriceList,
          );
      }
      if (
        (order && order.orderNumber && order.pickingId) ||
        this.receiptCount == 1
      ) {
        this.order.orderNumber = order.orderNumber;
        this.generateReceipt = false;
        this.generatePdf(false);
        this.receiptCount = 2;
        //Now look through each of the products inside of the return order and increase count for the product
        //this may mean creating a new productGroup if the product was out of stock.
        //This also means changing the contents of the refund orders.
        //probably just better to re-query past orders and products at this point
        //grab the id's that I need, set the limit to 1, and offset to 0. Should just grab the lastest
        this.odooService.getPastOrdersForCustomers(this.pastOrderConfigIds);
        if (this.stockFilter != "")
          this.odooService.getCombinedProductData(
            this.stockFilter,
            this.selectedPriceList,
          );
      }
    });
  }

  ngOnInit(): void {
    this.receiptCount = 0;
  }

  ngOnDestroy(): void {}

  newOrder() {
    this.currentOrderService.newOrder();
    this.odooService.orderComplete({});
    this.generateReceipt = true;
  }

  generatePdf(mainReceipt: boolean = true): void {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [144, 600],
    });
    doc.addFileToVFS("Helvetica 400-normal.ttf", helvetica);
    doc.addFileToVFS("code128-normal.ttf", code128);
    doc.addFont("Helvetica 400-normal.ttf", "Helvetica", "normal");
    doc.addFont("code128-normal.ttf", "barcode", "normal");
    const logo = new Image();
    logo.src = "../../../assets/images/logo.png";
    doc.addImage(logo, "png", 10, 10, 30, 30);
    doc.setFont("barcode");
    doc.setFontSize(12);
    doc.text(`${this.order.orderNumber}`, 50, 10);
    doc.setFont("Helvetica");
    doc.setFontSize(8);
    doc.text(`Order Number: ${this.order.orderNumber}`, 50, 20);
    doc.text(`Order ID: ${this.order.orderName}`, 50, 30);
    doc.text(`Cashier: ${this.order.cashier}`, 50, 40);
    doc.setFontSize(6);
    const barcode = new Image();
    let total = 0;
    let y = 60;
    const dots = Array(40).fill(".").join("");
    if (mainReceipt) {
      for (const product of this.order.products) {
        doc.text(`${product.product.name} x ${product.count}`, 10, y);
        let lenToAdd =
          product.product.name.length + product.count.toString().length + 3;
        doc.text(dots, 10 + lenToAdd, y);
        doc.text(
          `${(product.product.price * product.count).toFixed(2)}`,
          100,
          y,
        );
        total = total + product.product.price * product.count;
        y += 10;
      }

      for (const bxgoProduct of this.order.bxgoProducts) {
        doc.text(bxgoProduct.name, 50, y);
        doc.text(dots, 50, y);
        doc.text("BXGO Item", 100, y);
        y += 10;
      }
    } else {
      for (const product of this.order.refundedProducts) {
        doc.text(`${product.name} x 1`, 10, y);
        doc.text(dots, 10, y);
        doc.text(`${product.price.toFixed(2)}`, 100, y);
        total = total + product.price;
        y += 10;
      }
    }
    const orderAmt = this.order.total / (1 + this.order.taxRate);
    const taxAmt = this.order.total - orderAmt;

    doc.text(`ORDER: `, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${orderAmt.toFixed(2)}`, 100, y);
    y += 10;
    doc.text(`TAX RATE:`, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${this.order.taxRate}`, 100, y);
    y += 10;
    doc.text(`TAX TOTAL:`, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${taxAmt.toFixed(2)}`, 100, y);
    y += 10;
    doc.text(`TOTAL:`, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${this.order.total}`, 50, y);
    y += 10;
    doc.text(`AMOUNT PAID:`, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${this.order.amountPaid}`, 50, y);
    y += 10;
    doc.text(`CHANGE:`, 10, y);
    doc.text(dots, 10, y);
    doc.text(`${(this.order.amountPaid - this.order.total).toFixed(2)}`, 50, y);
    y += 10;

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    if (mainReceipt)
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    if (!mainReceipt) {
      this.pdfRefundSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
