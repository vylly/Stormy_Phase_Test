import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { DataService, IDataContainer, User } from "../core/data.service";
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
    user: User;

    //List of features (for app tour)
    @ViewChild('feat1') feat1: ElementRef;
    @ViewChild('feat2') feat2: ElementRef;

    constructor(private data: DataService, private _modalService: ModalDialogService,
        private _vcRef: ViewContainerRef) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
        this.user = this.data.getCurrentUser();
        this.getMembers();
    }


    // Function getList
    // Send a HTTP GET to the server to the route /items and set the list of items
    // Then build the whole tree
    getList(): void {
        request({
            url: "http://" + this.data.getIPServer() + "/items",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                space: this.user.space
            })
        }).then((response) => {
            // Update the items in the data service
            this.data.setContainers(response.content.toJSON().listItems);
            this.data.fillContainers(response.content.toJSON().listItems);
            // Update the list in this component
            this.containers = this.data.getContainers();
        }, (e) => { });
    }

    // Fuction getMembers
    // Send a HTTP GET to the server to the route /members and set the list of members
    getMembers(): void {
        request({
            url: "http://" + this.data.getIPServer() + "/members",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                space: this.user.space
            })
        }).then((response) => {
            // Update the member list
            this.data.setMembers(response.content.toJSON().listMembers);
            // We request the items only when the members are set (because we need to find the owner)
            this.getList();
        }, (e) => { });
    }

    fabTap(): void {
        const options: ModalDialogOptions = {
            viewContainerRef: this._vcRef,
            context: { members: this.data.getMemberList() }
        };

        this._modalService.showModal(ModalViewComponent, options)
            .then((dialogResult: Object) => {
                this.result = dialogResult;
                if (this.result) {
                    // Write the new item in the server
                    request({
                        url: "http://" + this.data.getIPServer() + "/item/add",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        content: JSON.stringify({
                            owner: this.data.getMemberFromName(this.result.owner).id,
                            name: this.result.newContainer,
                            parent: 0,
                            space: this.user.space
                        })
                    }).then((response) => this.data.addContainerFromServer(response), (e) => { });
                }
            })
    }

    // App tour function
    startTour() {
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
