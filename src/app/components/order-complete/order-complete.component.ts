import { SafePipe } from "../../pipes/safe";
import { Component, OnInit } from "@angular/core";
import { CurrentOrderService } from "../../services/current-order.service";
import { jsPDF } from "jspdf";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxBarcode6Module } from "ngx-barcode6";
import helvetica from "./Helvetica 400-normal";
import code128 from "./code128-normal";
import { OdooService } from "../../services/odoo.service";

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

  constructor(
    private currentOrderService: CurrentOrderService,
    private sanitizer: DomSanitizer,
    private odooService: OdooService,
  ) {
    this.currentOrderService.currentOrder$.subscribe((order) => {
      if (order) {
        this.order = order;
      }
    });
    this.odooService.orderInOdoo$.subscribe((order) => {
      if (
        order &&
        order.orderNumber > 0 &&
        !order.pickingId &&
        this.generateReceipt
      ) {
        this.order.orderNumber = order.orderNumber;
        this.generateReceipt = false;
        this.generatePdf(true);
      }
      if (order && order.orderNumber && order.pickingId) {
        this.order.orderNumber = order.orderNumber;
        this.generateReceipt = false;
        this.generatePdf(false);
      }
    });
  }

  ngOnInit(): void {}

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
    doc.text(`${this.order.orderNumber}`, 50, 10);
    doc.setFont("Helvetica");
    doc.text(`Order Number: ${this.order.orderNumber}`, 50, 20);
    doc.text(`Cashier: ${this.order.cashier}`, 50, 30);
    doc.setFontSize(6);
    const barcode = new Image();
    let total = 0;
    let y = 60;
    const dots = Array(40).fill(".").join("");
    if (mainReceipt) {
      for (const product of this.order.products) {
        doc.text(`${product.product.name} x ${product.count}`, 10, y);
        doc.text(dots, 10, y);
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
