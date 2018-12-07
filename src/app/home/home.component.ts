import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { DataService, IDataContainer} from "../core/data.service";
import { prompt, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";
import { AppTour } from 'nativescript-app-tour';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { TextField } from "tns-core-modules/ui/text-field";
import { request, getFile, getImage, getJSON, getString, HttpRequestOptions } from "tns-core-modules/http";


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    containers: Array<IDataContainer>;
    tour;
    result;

    //List of features (for app tour)
    @ViewChild('feat1') feat1: ElementRef;
    @ViewChild('feat2') feat2: ElementRef;

    constructor(private data: DataService, private _modalService: ModalDialogService,
        private _vcRef: ViewContainerRef) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
    }

    // Function setIP called when the the 'enter' key is pressed in the TextField
    // Get the address typed and set it in data service
    setIP(result): void {
        this.data.setIPAddress(result);
        this.getList();
    }

    // Fuction getList
    // Send a HTTP GET to the server and set the list of items
    getList(): void {
        let request: HttpRequestOptions = {url: "http://" + this.data.getIPServer() + "/items", method: "GET", dontFollowRedirects: false};
        getJSON(request).then((r: any) => {
            console.log("result from the get request:", r);
        }, (e) => {
            console.log(e);
        });
    }

    fabTap(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this._vcRef,
			context: {members: this.data.getMemberList()}
        };

        this._modalService.showModal(ModalViewComponent, options)
        .then((dialogResult: Object) => {
            this.result = dialogResult;
            if(this.result) {
                let newContainer: IDataContainer = {id: 999, name: this.result.newContainer, listItems: new Array<IDataContainer>(), owner: {id:999, name:this.result.owner}}
                this.containers.push(newContainer);
            }
        })
    }

    //App tour function
    startTour(){
        const stops = [
            {
                view: this.feat2.nativeElement,
                title: 'Bouton d\'ajout',
                description: "Ajoutez des conteneurs avec ce bouton",
                dismissable: true
            },
            {
                view: this.feat1.nativeElement,
                title: 'Liste de conteneurs',
                description: 'La liste des conteneurs est affichée ici',
                outerCircleColor: 'orange',
                rippleColor: 'black'
            }
        ];

        this.tour = new AppTour(stops);
        this.tour.show();
    }

}
