import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { WordPressService } from "../../services/wordpress.service";
import e from "express";
import { OdooService } from "../../services/odoo.service";

@Component({
  selector: "app-announcement-board",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./announcement-board.component.html",
  styleUrl: "./announcement-board.component.css",
})
export class AnnouncementBoardComponent implements OnInit {
  announcementList: Array<any> = [];
  constructor(private wordpressService: WordPressService) {
    wordpressService.announcements$.subscribe((val) => {
      if (val && val.length > 0) {
        this.announcementList = [];
        val.forEach((announcement) => {
          var newContent = JSON.parse(announcement.content);
          announcement.content = newContent;
          this.announcementList.push(announcement);
        });
      }
      console.log(val);
    });
  }
  ngOnInit(): void {
    //this.odooService.getAnnouncements();
  }
}
