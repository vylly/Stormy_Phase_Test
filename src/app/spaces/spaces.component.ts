import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { alert } from "tns-core-modules/ui/dialogs";
import { DataService, User, ISpace } from "../core/data.service";
import { TextField } from "tns-core-modules/ui/text-field";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";
import { Page } from "tns-core-modules/ui/page";
import { Observable } from "rxjs";


@Component({
    moduleId: module.id,
    selector: "spaces-page",
    templateUrl: "./spaces.component.html",
    styleUrls: ["./spaces.component.scss"]
})
export class SpacesComponent {
    noSpaces: boolean;
    user: User;
    field: TextField;
    picked: ISpace;
    spaces: Array<ISpace>;
    listNameSpaces: Array<string> = [];
    listNameSpacesDisplayed: Observable<Array<string>>;
    subscr;
    typed_name: string;

    // Constructor
    constructor(private routerExtension: RouterExtensions, private dataService: DataService, private page: Page) {

    };

    ngOnInit(): void {
        this.page.actionBarHidden = false;
        this.user = this.dataService.getCurrentUser();
        // Initialise list of ISpace
        this.spaces = this.user.spaces;
        if (this.spaces.length == 0) {
            this.noSpaces = true;
        } else {
            this.noSpaces = false;
        }
        // Initialise list of string for the list picker
        for (let i = 0; i < this.spaces.length; i++) {
            this.listNameSpaces.push(this.spaces[i].name);
        }
        this.typed_name = "";
        //Watch for changes in the list of names
        this.listNameSpacesDisplayed = Observable.create(subscriber => {
            this.subscr = subscriber;
            subscriber.next(this.listNameSpaces);
            return function () {
                console.log("Unsubscribe called!!!");
            };

        });
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
        this.field = <TextField>args.object;
        this.typed_name = this.field.text;

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
                    this.dataService.setCurrentUser(this.user);
                    // Update the list picker so the newspace is displayed if we return on spaces
                    this.field.text = "";
                    if (!this.noSpaces) {
                        this.listNameSpaces.push(new_space.name);
                        this.subscr.next([...this.listNameSpaces]);
                    }
                    this.routerExtension.navigate(["../tabs/default"]);
                }
            }, (e) => { });
        }
    }

    // Logout : reset currentUser and route to login page
    logout() {
        this.dataService.setCurrentUser(new User());
        this.routerExtension.navigate(["../login"], {clearHistory: true});
    }

}