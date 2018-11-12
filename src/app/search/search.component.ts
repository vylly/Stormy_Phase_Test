import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IMember } from "../core/data.service";

// floating button imports
import { registerElement } from "nativescript-angular/element-registry";
registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);

// MEMBERS TAB

@Component({
    selector: "Search",
    moduleId: module.id,
    templateUrl: "./search.component.html"
})
export class SearchComponent implements OnInit {
    members: Array<IMember>;

    constructor(private memberService: DataService, private router: RouterExtensions) { }


    ngOnInit(): void {
        this.members = this.memberService.getMemberList();
    }

    fabTap(args): void {
        alert("Need to add a member in a pop-up here");
    }

}
