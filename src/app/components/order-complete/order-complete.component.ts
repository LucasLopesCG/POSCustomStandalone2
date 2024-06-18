import { SafePipe } from "../../pipes/safe";
import { Component, OnInit } from "@angular/core";
import { CurrentOrderService } from "../../services/current-order.service";
import { jsPDF } from "jspdf";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxBarcode6Module } from "ngx-barcode6";
import helvetica from "./Helvetica 400-normal";
import code128 from "./code128-normal";

@Component({
  selector: "app-order-complete",
  templateUrl: "./order-complete.component.html",
  standalone: true,
  imports: [SafePipe, NgxBarcode6Module],
})
export class OrderCompleteComponent implements OnInit {
  order: any;
  pdfSrc: any;

  constructor(
    private currentOrderService: CurrentOrderService,
    private sanitizer: DomSanitizer,
  ) {
    this.currentOrderService.currentOrder$.subscribe((order) => {
      this.order = order;
      this.generatePdf();
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  newOrder() {
    this.currentOrderService.newOrder();
  }

  generatePdf(): void {
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
    doc.text(this.order.receiptNumber, 50, 10);
    doc.setFont("Helvetica");
    doc.text(`Order Number: ${this.order.orderNumber}`, 50, 20);
    doc.text(`Cashier: ${this.order.cashier}`, 50, 30);
    doc.setFontSize(6);
    const barcode = new Image();

    let y = 60;
    for (const product of this.order.products) {
      doc.text(`${product.product.name} x ${product.count}`, 10, y);
      const dots = Array(40).fill(".").join("");
      doc.text(dots, 10, y);
      doc.text(`${(product.product.price * product.count).toFixed(2)}`, 100, y);
      y += 10;
    }

    for (const bxgoProduct of this.order.bxgoProducts) {
      doc.text(bxgoProduct.name, 50, y);
      const dots = Array(40).fill(".").join("");
      doc.text(dots, 50, y);
      doc.text("BXGO Item", 100, y);
      y += 10;
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    //console.log(this.pdfSrc);
  }
}
