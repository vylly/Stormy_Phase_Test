import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IMember, User } from "../core/data.service";
import { prompt, alert, PromptResult, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";
import { request, getFile, getImage, getJSON, getString, HttpRequestOptions } from "tns-core-modules/http";
import * as dialogs from "tns-core-modules/ui/dialogs";

// floating button imports
import { registerElement } from "nativescript-angular/element-registry";
registerElement("Fab", () => require("nativescript-floatingactionbutton").Fab);

// MEMBERS TAB

@Component({
    selector: "Search",
    moduleId: module.id,
    templateUrl: "./search.component.html"
})
export class SearchComponent implements OnInit {
    members: Array<IMember>;
    user: User;

    constructor(private memberService: DataService, private router: RouterExtensions, private data: DataService) { }


    ngOnInit(): void {
        this.members = this.memberService.getMemberList();
        this.user = this.memberService.getCurrentUser();
    }

    fabTap(args): void {
        // options for the dialog
        let options: PromptOptions = {
            title: "Invite a user to this space",
            message: "Enter the email of the member you want to add",
            inputType: inputType.email,
            okButtonText: "OK",
            cancelButtonText: "Cancel",
            cancelable: true
        };
        // open dialog
        prompt(options).then(r => {
            if (r.result) {
                // Write the new member in the server
                request({
                    url: "http://" + this.memberService.getIPServer() + "/member/add",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        email: r.text,
                        space: this.user.currentSpace.id,
                        token: this.user.token
                    })
                }).then((response) => {
                    if (response.content.toJSON().status == "fail") {
                        this.logout();
                        alert("Your session has expired. Please log in again.");
                    } else {
                        // Get the new member added to the server with the id just generated
                        const result = response.content.toJSON();
                        if (result.newMember.id == -1) {
                            alert("This email is not linked to a Stormy account.");
                        } else {
                            this.members.push(result.newMember);
                        }
                    }
                }, (e) => {
                });
            }
        });
    }

    // Logout : reset currentUser and route to login page
    logout() {
        this.memberService.setCurrentUser(new User());
        this.router.navigate(["../login"]);
    }

    // Go back to spaces
    onNavBack() {
        this.router.navigate(["../spaces"], {clearHistory: true});
    }

    // Leave this space
    onLeave() {
        dialogs.confirm("Are you sure you want to leave this space ? It means all your items in this space are going to be deleted !").then(result => {
            if (result) {
                request({
                    url: "http://" + this.data.getIPServer() + "/member/remove",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        id: this.user.id,
                        space: this.user.currentSpace.id,
                        token: this.user.token
                    })
                }).then((response) => {
                    if (response.content.toJSON().status == "fail") {
                        this.logout();
                        alert("Your session has expired. Please log in again.");
                    } else {
                        // Remove the spaces in the list of spaces of this user
                        this.user.spaces.splice(this.user.spaces.indexOf(this.user.currentSpace), 1)
                        this.data.setCurrentUser(this.user);
                        this.onNavBack();
                    }
                }, (e) => { });
            }
        });
    }
}
