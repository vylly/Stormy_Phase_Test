import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { DataService, IDataContainer, User } from "../core/data.service";
import { AppTour } from 'nativescript-app-tour';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";
import { RouterExtensions } from "nativescript-angular/router";
import { TextField } from "tns-core-modules/ui/text-field";
//import * as Https from 'nativescript-https'


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
    deleteMode: boolean;

    //List of features (for app tour)
    @ViewChild('feat1') feat1: ElementRef;
    @ViewChild('feat2') feat2: ElementRef;

    constructor(private data: DataService, private _modalService: ModalDialogService,
        private _vcRef: ViewContainerRef, private router: RouterExtensions) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
        this.user = this.data.getCurrentUser();
        this.getMembers();
        this.deleteMode = false;
    }


    // Function getList
    // Send a HTTP GET to the server to the route /items and set the list of items
    // Then build the whole tree
    getList(): void {

        request({
            url: "http://" + this.data.getIPServer() + "/items",
            method: "POST",
            headers: { "Content-Type": "application/json" },

            // body: {
            //     "content" : JSON.stringify({
            //         space: this.user.currentSpace.id 
            //     }) 
            // }
            content: JSON.stringify({
                space: this.user.currentSpace.id,
                token: this.user.token
            })

        }).then((response) => {
            if (response.content.toJSON().status == "success") {
                // Update the items in the data service
                this.data.setContainers(response.content.toJSON().listItems);
                this.data.fillContainers(response.content.toJSON().listItems);
                // Update the list in this component
                this.containers = this.data.getContainers();
            } else {
                // Invalid token
                this.logout();
                alert("Your session has expired. Please log in again.");
            }
        }, (e) => { });
    }

    // Function getMembers
    // Send a HTTP GET to the server to the route /members and set the list of members
    getMembers(): void {
        request({
            url: "http://" + this.data.getIPServer() + "/members",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify({
                space: this.user.currentSpace.id,
                token: this.user.token
            })
            // body: {
            //     "content" : JSON.stringify({
            //         space: this.user.currentSpace.id
            //     })
            // }

        }).then((response) => {
            if (response.content.toJSON().status == "success") {
                // Update the member list
                this.data.setMembers(response.content.toJSON().listMembers);
                // We request the items only when the members are set (because we need to find the owner)
                this.getList();
            } else {
                // Invalid token
                this.logout();
                alert("Your session has expired. Please log in again.");
            }
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
                        // body: {
                        //    "content":  JSON.stringify({
                        //         owner: this.data.getMemberFromName(this.result.owner).id,
                        //         name: this.result.newContainer,
                        //         parent: 0,
                        //         space: this.user.currentSpace.id    
                        //     })
                        // }
                        content: JSON.stringify({
                            owner: this.data.getMemberFromName(this.result.owner).id,
                            name: this.result.newContainer,
                            parent: 0,
                            space: this.user.currentSpace.id,
                            token: this.user.token
                        })

                    }).then((response) => {
                        if (response.content.toJSON().status == "fail") {
                            this.logout();
                            alert("Your session has expired. Please log in again.");
                        } else {
                            this.data.addContainerFromServer(response);
                        }
                    }, (e) => { });
                }
            })
    }

    // App tour function
    startTour() {
        const stops = [
            {
                view: this.feat2.nativeElement,
                title: 'Bouton d\'ajout',
                description: "Add containers with this button",
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

    // Logout : reset currentUser and route to login page
    logout() {
        this.data.setCurrentUser(new User());
        this.router.navigate(["../login"]);
    }

    // Go back to spaces
    onNavBack() {
        this.router.navigate(["../spaces"], {clearHistory: true});
    }

    // Delete an item
    onDelete(container) {
        dialogs.confirm("Are you sure you want to delete " + container.name + " ?").then(result => {
            if (result) {
                let listIds = [container.id];
                container.listItems.forEach(item => listIds.push(item.id));
                request({
                    url: "http://" + this.data.getIPServer() + "/item/remove",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        idList: listIds,
                        token: this.user.token
                    })
                }).then((response) => {
                    if (response.content.toJSON().status == "fail") {
                        this.logout();
                        alert("Your session has expired. Please log in again.");
                    } else {
                        this.getList();
                    }
                }, (e) => { });
            }
        });
    }

    // Activate the delete mode
    toggleDelete() {
        this.deleteMode = !this.deleteMode;
    }

    // Search an item an display its container in a popup (the first one if many items have the same name)
    onSearchItem(args) {
        let field = <TextField>args.object;
        for (let i = 0; i < this.containers.length; i++) {
            // Test if it is a container with parent = 0
            if (this.containers[i].name == field.text) {
                alert("This item is a container, in the root of this space.");
                field.text = "";
                return;
            }
            // Test if it is in the children of a container
            for (let j = 0; j < this.containers[i].listItems.length; j++) {
                if (this.containers[i].listItems[j].name == field.text) {
                    alert("This item is in " + this.containers[i].name);
                    field.text = "";
                    return;
                }
            }
        }
        // The item was not found
        alert("Item not found");
        field.text = "";
        return;
    }

}
