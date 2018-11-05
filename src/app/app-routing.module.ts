import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { BrowseComponent } from "./browse/browse.component";
import { HomeComponent } from "./home/home.component";
import { ItemDetailComponent } from "./item-detail/item-detail.component";
import { SearchComponent } from "./search/search.component";
import { ScanComponent } from "./scan/scan.component";
import { ContainerComponent } from "./container/container.component";

export const COMPONENTS = [BrowseComponent, HomeComponent, ItemDetailComponent, SearchComponent, ScanComponent, ContainerComponent];

const routes: Routes = [
    { path: "", redirectTo: "/(homeTab:home//browseTab:browse//searchTab:search//scanTab:scan)", pathMatch: "full" },

    { path: "home", component: HomeComponent, outlet: "homeTab" },
    { path: "browse", component: BrowseComponent, outlet: "browseTab" },
    { path: "search", component: SearchComponent, outlet: "searchTab" },
    { path: "scan", component ScanComponent, outlet: "scanTab"},

    { path: "item/:id", component: ItemDetailComponent, outlet: "homeTab" },
    { path: "container/:id", component: ContainerComponent, outlet "homeTab"}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
