import { Component, OnInit, ViewContainerRef, HostBinding } from "@angular/core";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("MLKitBarcodeScanner", () => require("nativescript-plugin-firebase/mlkit/barcodescanning").MLKitBarcodeScanner);

import { MLKitScanBarcodesOnDeviceResult } from "nativescript-plugin-firebase/mlkit/barcodescanning";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { dialogBrowseComponent } from "../dialogBrowse/dialogBrowse.component";
import { DataService, IDataContainer, User} from "../core/data.service";
import { BrowseService } from "./browse.service"
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "Browse",
    moduleId: module.id,
    templateUrl: "./browse.component.html"
})
export class BrowseComponent implements OnInit {
    barcodes: Array<{
        value: string;
        format: string;
    }>;
    result;
    user: User;
    @HostBinding('class.pause')
    pause = false;

    constructor(
        private _modalService: ModalDialogService,
        private data: DataService,
        private _vcRef: ViewContainerRef,
        private browseService: BrowseService,
        private router: RouterExtensions
    ) {
        /* ***********************************************************
        * Use the constructor to inject app services that you need in this component.
        *************************************************************/
    }

    ngOnInit(): void {
        /* ***********************************************************
        * Use the "ngOnInit" handler to initialize data for this component.
        *************************************************************/
       //Suscribe to event comming from browseService
       this.browseService.change.subscribe(pause => {
           //Change state of scanner
           this.pause = pause;
       });
       this.user = this.data.getCurrentUser();
    }

    //Function to call every X sec
    public onScan(event: any): void {
        
        const result: MLKitScanBarcodesOnDeviceResult = event.value;
        this.barcodes = result.barcodes;

        if (this.barcodes.length > 0) {
            console.log("resultat this.barcodes is : " + JSON.stringify(this.barcodes));
            //Pause reader
            this.pause = true;

            /* ***********************************************************
                                * CASE 1 : UNKNOWN CODE *
            *************************************************************/
            // options for the dialog
            const options: ModalDialogOptions = {
                // tell angular where (in the component tree) to load the dialog component.
                viewContainerRef: this._vcRef,
                // Parameters are specified in the context, here we provide the list of containers
                context: {objects: this.data.getContainers()},
            };
        
            
            // open dialog
            this._modalService.showModal(dialogBrowseComponent, options)
            .then((dialogResult: Object) => {
                //The result is the result from the dialog popup
                this.result = dialogResult;

                //Push the item in the db
                //this.listItems.push(newContainer);
            })
            setTimeout(() => this.pause = false, 1000)

            /* ***********************************************************
                                * CASE 2 : KNOWN CODE *
            *************************************************************/

            //TODO
        }
    }

    // Go back to spaces
    onNavBack() {
        this.router.navigate(["../spaces"], {clearHistory: true});
    }
}
