import { Component, OnInit, ViewContainerRef, HostBinding } from "@angular/core";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("MLKitBarcodeScanner", () => require("nativescript-plugin-firebase/mlkit/barcodescanning").MLKitBarcodeScanner);

import { MLKitScanBarcodesOnDeviceResult } from "nativescript-plugin-firebase/mlkit/barcodescanning";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { dialogBrowseComponent } from "../dialogBrowse/dialogBrowse.component";
import { DataService, IDataContainer, User } from "../core/data.service";
import { BrowseService } from "./browse.service"
import { RouterExtensions } from "nativescript-angular/router";
import { request } from "tns-core-modules/http";


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
    containers;
    parentID;
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
        this.containers = this.data.getContainers();
    }

    //Function to call every X sec
    public onScan(event: any): void {

        const result: MLKitScanBarcodesOnDeviceResult = event.value;
        this.barcodes = result.barcodes;

        if (this.barcodes.length > 0) {
            //Pause reader
            this.pause = true;

            let barcode = this.barcodes.pop();
            this.barcodes.splice(0, this.barcodes.length);

            // Test if it is a know barcode
            let itemFound;
            for (let i = 0; i < this.containers.length; i++) {
                // check containers barcodes
                if (this.containers[i].codeValue == barcode.value && !itemFound) {
                    itemFound = this.containers[i];
                }
                if (!itemFound) {
                    // Check in the items of this container
                    for (let j = 0; j < this.containers[i].listItems.length; j++) {
                        if (this.containers[i].listItems[j].codeValue == barcode.value) {
                            itemFound = this.containers[i].listItems[j];
                        }
                    }
                }
            }

            if (!itemFound) {
                /* ***********************************************************
                               * CASE 1 : UNKNOWN CODE *
                                    Add the item 
                *************************************************************/
                // options for the dialog
                const options: ModalDialogOptions = {
                    // tell angular where (in the component tree) to load the dialog component.
                    viewContainerRef: this._vcRef,
                    // Parameters are specified in the context, here we provide the list of containers
                    context: { objects: this.data.getContainers(), barcode: barcode},
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
            } else {
                /* ***********************************************************
                                * CASE 2 : KNOWN CODE *
                                    Route to the item
            *************************************************************/
                // Get the parent of the item
                request({
                    url: "http://" + this.data.getIPServer() + "/item/getParent",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        id: itemFound.id,
                        token: this.data.getCurrentUser().token
                    })
                }).then((response) => {
                    if (response.content.toJSON().status == "fail") {
                        this.logout();
                        alert("Your session has expired. Please log in again.");
                    } else {
                        // We receive the parent
                        this.parentID = response.content.toJSON().parent;
                    }
                }, (e) => { });

                // Display the item
                if (this.parentID == 0) {
                    alert("The item scanned is " + itemFound.name + " and is located at the root of the StormSpace.");
                    setTimeout(() => this.pause = false, 1000)
                } else {
                    alert("The item scanned is " + itemFound.name + " and is stored in " + this.data.getContainer(this.parentID).name);
                    setTimeout(() => this.pause = false, 1000)
                    this.router.navigate(["../container", this.parentID]);
                }
            }
        }
    }

    // Go back to spaces
    onNavBack() {
        this.router.navigate(["../spaces"], { clearHistory: true });
    }

    // Logout : reset currentUser and route to login page
    logout() {
        this.data.setCurrentUser(new User());
        this.router.navigate(["../login"], { clearHistory: true });
    }
}
