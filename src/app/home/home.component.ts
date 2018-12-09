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
        this.getMembers(); // important de set les membres d'abord pour pour retrouver les noms des owners dans set/fillContainers appelés dans getList
        this.getList();
        console.log("container:", this.containers);
    }

    // Function getList
    // Send a HTTP GET to the server to the route /items and set the list of items
    // Then build the whole arborescence
    getList(): void {
        let request: HttpRequestOptions = {url: "http://" + this.data.getIPServer() + "/items", method: "GET", dontFollowRedirects: false};
        getJSON(request).then((r: any) => {
            // Update the items in the data service (maybe sort parents / children)
            this.data.setContainers(r);
            this.data.fillContainers(r);
            // Update the list in this component
            this.containers = this.data.getContainers();
        }, (e) => {
            console.log(e);
        });
    }

    // Fuction getMembers
    // Send a HTTP GET to the server to the route /members and set the list of members
    getMembers(): void {
        let request: HttpRequestOptions = {url: "http://" + this.data.getIPServer() + "/members", method: "GET", dontFollowRedirects: false};
        getJSON(request).then((r: Array<{id:number, name:string}>) => {
            // Update the member list
            this.data.setMembers(r);
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
                // Write the new item in the server
                request({
                    url: "http://" + this.data.getIPServer() + "/item/add",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        owner: this.data.getMemberFromName(this.result.owner).id,
                        name: this.result.newContainer,
                        parent: 0
                    })
                }).then((response) => {
                    // Get the new member added to the server with the id just generated
                    const jsonResponse = response.content.toJSON();
                    // Need to format the answer int the frontend format: with the name of the owner and not the id, and with an empty list of children
                    let newContainer = {
                        id: jsonResponse.newItem.id,
                        name: jsonResponse.newItem.name,
                        owner: this.data.getMember(jsonResponse.newItem.owner),
                        listItems: new Array<IDataContainer>()
                    }
                    // Add it to the containers in the data service just in case
                    this.data.addContainer(newContainer, 0);
                }, (e) => {
                });
            }
        })
    }

    // App tour function
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
