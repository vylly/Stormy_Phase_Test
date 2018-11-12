import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IMember } from "../core/data.service";


@Component({
    selector: "Search",
    moduleId: module.id,
    templateUrl: "./search.component.html"
})
export class SearchComponent implements OnInit {
    members: Array<IMember>;

    constructor(private memberService: DataService, private router: RouterExtensions) { }


    ngOnInit(): void {
        this.members = this.memberService.getMemberList();    }
}
