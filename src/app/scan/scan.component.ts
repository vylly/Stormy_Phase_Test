import { Component, OnInit } from "@angular/core";


import { registerElement } from "nativescript-angular/element-registry";
registerElement("MLKitBarcodeScanner", () => require("nativescript-plugin-firebase/mlkit/barcodescanning").MLKitBarcodeScanner);

import { MLKitScanBarcodesOnDeviceResult } from "nativescript-plugin-firebase/mlkit/barcodescanning";

/* ***********************************************************
* Before you can navigate to this page from your app, you need to reference this page's module in the
* global app router module. Add the following object to the global array of routes:
* { path: "scan", loadChildren: "./scan/scan.module#ScanModule" }
* Note that this simply points the path to the page module file. If you move the page, you need to update the route too.
*************************************************************/

@Component({
    selector: "Scan",
    moduleId: module.id,
    templateUrl: "./scan.component.html"
})
export class ScanComponent implements OnInit {
    barcodes: Array<{
        value: string;
        format: string;
      }>;

      pause: boolean = false;

    constructor() {
        /* ***********************************************************
        * Use the constructor to inject app services that you need in this component.
        *************************************************************/
    }

    ngOnInit(): void {
        /* ***********************************************************
        * Use the "ngOnInit" handler to initialize data for this component.
        *************************************************************/
    }

    //Function to call every X sec
    public onScan(event: any): void {
        
        const result: MLKitScanBarcodesOnDeviceResult = event.value;
        this.barcodes = result.barcodes;
        console.log("this.barcodes: " + JSON.stringify(this.barcodes));

        if (this.barcodes.length > 0) {
            console.log("pausing the scanner for 3 seconds (to test the 'pause' feature)");
            this.pause = true;
            alert("code scannééé !");
            setTimeout(() => this.pause = false, 3000)
          }
    }
}
