import { Component, OnInit } from "@angular/core";
import { isAndroid } from "tns-core-modules/platform";
import { BrowseService } from "./browse/browse.service";
import { SearchComponent } from "./search/search.component";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

    constructor(
        private browserService: BrowseService,
        private searchComponent: SearchComponent
    ) {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
        
    }

    getIconSource(icon: string): string {
        const iconPrefix = isAndroid ? "res://" : "res://tabIcons/";

        return iconPrefix + icon;
    }

    //Checks which tab is selected (in order to turn off scanner when not used)
    public tabViewIndexChange(result){
        //For now, both are the same
        if(result==1) {
            this.browserService.toggle();
        } else {
            this.browserService.toggle();
        }
    }
}
