import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IDataContainer, IDataItem } from "../core/data.service";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    containers: Array<IDataContainer>;

    constructor(private data: DataService, private router: RouterExtensions) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
    }
}
