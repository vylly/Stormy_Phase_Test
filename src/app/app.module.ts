import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule, COMPONENTS } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core/core.module";

import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "./dialogContainer/dialogContainer.component";
import { dialogBrowseComponent } from "./dialogBrowse/dialogBrowse.component";
import { BrowseService } from "./browse/browse.service";


@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        CoreModule
    ],
    entryComponents: [
        ModalViewComponent,
        dialogBrowseComponent

    ],
    declarations: [
        AppComponent,
        ModalViewComponent,
        dialogBrowseComponent,
        ...COMPONENTS
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    providers: [
        ModalDialogService,
        BrowseService
    ]
})
export class AppModule { }
