import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { DataService, User, ISpace } from "../core/data.service";
import { TextField } from "tns-core-modules/ui/text-field";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";


@Component({
    moduleId: module.id,
    selector: "spaces-page",
    templateUrl: "./spaces.component.html",
    styleUrls: ["./spaces.component.scss"]
})
export class SpacesComponent {
    user: User;
    picked: ISpace;
    spaces: Array<ISpace>;
    listNameSpaces: Array<string> = [];
    typed_name: string;

    // Constructor
    constructor(private routerExtension: RouterExtensions, private dataService: DataService) {

    };

    ngOnInit(): void {
        this.user = this.dataService.getCurrentUser();
        // Initialise list of ISpace
        this.spaces = this.user.spaces;
        // Initialise list of string for the list picker
        for (let i = 0; i < this.spaces.length; i++) {
            this.listNameSpaces.push(this.spaces[i].name);
        }
        this.typed_name = "";
        console.log("user logged :", this.user);
    }


    //Detects change of selected item (is called at boot)
    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.spaces[picker.selectedIndex];
    }

    // onSubmitSpace go to the selected space
    public onSubmitSpace() {
        this.user.currentSpace = this.picked;
        this.dataService.setCurrentUser(this.user);
        this.routerExtension.navigate(["../tabs/default"])
    }

    // Get the name type in the field
    public onTextChanged(args) {
        let textField = <TextField>args.object;
        this.typed_name = textField.text;

    }

    // Create a new space
    public onCreate() {
        if (this.typed_name == "") {
            alert("Please enter a name for your space");
        } else {
            // Write the new space in the server, with its name and the id of the creator (currentUser)
            request({
                url: "http://" + this.dataService.getIPServer() + "/space/add",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    name: this.typed_name,
                    id: this.user.id,
                    token: this.user.token
                })
            }).then((response) => {
                if (response.content.toJSON().status == "fail") {
                    this.logout();
                    alert("Your session has expired. Please log in again.");
                } else {
                    // Get the new member added to the server with the id just generated
                    const result = response.content.toJSON();
                    // Update the items in the currentUser
                    let new_space = response.content.toJSON().space
                    this.user.spaces.push(new_space);
                    this.user.currentSpace = new_space;
                    this.listNameSpaces.push(new_space.name);
                    this.dataService.setCurrentUser(this.user);
                    this.routerExtension.navigate(["../tabs/default"]);
                }
            }, (e) => { });
        }
    }

    // Logout : reset currentUser and route to login page
    logout() {
        this.dataService.setCurrentUser(new User());
        this.routerExtension.navigate(["../login"]);
    }

}