import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IDataContainer, User } from "../core/data.service";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { request, getFile, getImage, getJSON, getString, HttpRequestOptions } from "tns-core-modules/http";

/* ***********************************************************
* Before you can navigate to this page from your app, you need to reference this page's module in the
* global app router module. Add the following object to the global array of routes:
* { path: "container", loadChildren: "./container/container.module#ContainerModule" }
* Note that this simply points the path to the page module file. If you move the page, you need to update the route too.
*************************************************************/

@Component({
    selector: "Container",
    moduleId: module.id,
    templateUrl: "./container.component.html"
})
export class ContainerComponent implements OnInit {
    container: IDataContainer;
    listItems: Array<IDataContainer>;
    result;
    user: User;
    deleteMode: boolean;

    constructor(
        private data: DataService,
        private route: ActivatedRoute,
        private router: RouterExtensions,
        private _modalService: ModalDialogService,
        private _vcRef: ViewContainerRef
    ) { }

    ngOnInit(): void {
        const id = +this.route.snapshot.params.id;
        this.container = this.data.getContainer(id);
        this.listItems = this.container.listItems;
        this.user = this.data.getCurrentUser();
        this.deleteMode = false;
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
                            parent: this.container.id,
                            space: this.data.getCurrentUser().currentSpace.id,
                            token: this.user.token
                        })
                    }).then((response) => {
                        if (response.content.toJSON().status == "fail") {
                            this.logout();
                            alert("Your session has expired. Please log in again.");
                        } else {
                            this.data.addContainerFromServer(response)
                        }
                    }, (e) => { });
                }
            })
    }

    // Logout : reset currentUser and route to login page
    logout() {
        this.data.setCurrentUser(new User());
        this.router.navigate(["../login"], {clearHistory: true});
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
                        // remove the item from the list
                        let newList = new Array<IDataContainer>();
                        this.listItems.forEach(item => {
                            if (item.id != container.id) {
                                newList.push(item);
                            }
                        });
                        this.listItems = newList;
                    }
                }, (e) => { });
            }
        })
    }

    // Activate the delete mode
    toggleDelete() {
        this.deleteMode = !this.deleteMode;
    }

}
