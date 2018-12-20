import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { DataService, IDataContainer} from "../core/data.service";
import { AppTour } from 'nativescript-app-tour';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";


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
        this.getMembers(); // getList is called in this function
    }

    // Function getList
    // Send a HTTP GET to the server to the route /items and set the list of items
    // Then build the whole arborescence
    getList(): void {
        console.log("in getList()")
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
            // We request the items only when the members are set (because we need to find the owner)
            this.getList();
            console.log("Now containers:", this.containers);
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
                }).then((response) => this.data.addContainerFromServer(response), (e) => {});
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
