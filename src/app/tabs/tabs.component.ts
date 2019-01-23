import { Component } from "@angular/core";
import { isAndroid } from "tns-core-modules/platform";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { BrowseService } from "../browse/browse.service";
import { Page } from "tns-core-modules/ui/page";

@Component({
    moduleId: module.id,
    selector: "tabs-page",
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.scss"]
})
export class TabsComponent {
    constructor(
        private routerExtension: RouterExtensions,
        private browserService: BrowseService,
        private activeRoute: ActivatedRoute,
        private page: Page) {
    }

    ngOnInit() {
        this.routerExtension.navigate([{ outlets: { homeTab: ["home"], browseTab: ["browse"], searchTab: ["search"] } }], { relativeTo: this.activeRoute });
        this.page.actionBarHidden = true;
    }

    getIconSource(icon: string): string {
        const iconPrefix = isAndroid ? "res://" : "res://tabIcons/";

        return iconPrefix + icon;
    }

    //Checks which tab is selected (in order to turn off scanner when not used)
    tabViewIndexChange(result){
        //For now, both are the same
        if(result==1) {
            this.browserService.toggle();
        } else {
            this.browserService.toggle();
        }
    }
}