import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule, NSEmptyOutletComponent } from "nativescript-angular/router";
import { NativeScriptCommonModule } from "nativescript-angular/common";


import { TabsComponent } from "./tabs.component";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";
import { dialogBrowseComponent } from "../dialogBrowse/dialogBrowse.component";
import { BrowseService } from "../browse/browse.service";
import { SearchComponent } from "../search/search.component";
import { HomeComponent } from "../home/home.component";
import { BrowseComponent } from "../browse/browse.component";
import { ContainerComponent } from "../container/container.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild([
            {
                path: "default", component: TabsComponent, children: [
                    {
                        path: "home",
                        outlet: "homeTab",
                        component: HomeComponent,
                        //loadChildren: "~/app/player/players.module#PlayersModule",
                    },
                    {
                        path: "browse",
                        outlet: "browseTab",
                        component: BrowseComponent,
                        //loadChildren: "~/app/team/teams.module#TeamsModule"
                    },
                    {
                        path: "search",
                        outlet: "searchTab",
                        component: SearchComponent,
                        //loadChildren: "~/app/team/teams.module#TeamsModule"
                    },
                    {
                        path: "container/:id",
                        outlet: "homeTab",
                        component: ContainerComponent
                    }
                ]
            }
        ])
    ],
    declarations: [
        TabsComponent,
        HomeComponent,
        BrowseComponent,
        SearchComponent,
        ContainerComponent,
        ModalViewComponent,
        dialogBrowseComponent,
        SearchComponent
    ],
    providers: [
        ModalDialogService,
        BrowseService,
        SearchComponent
    ],
    entryComponents: [
        dialogBrowseComponent,
        ModalViewComponent
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class TabsModule { }