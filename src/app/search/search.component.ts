import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IMember } from "../core/data.service";
import { prompt, PromptResult, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";
import { request, getFile, getImage, getJSON, getString, HttpRequestOptions } from "tns-core-modules/http";

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

    constructor(private memberService: DataService, private router: RouterExtensions) { }


    ngOnInit(): void {
        this.readListFromData();
    }

    // Call the data service to set this.members (called when the tab is selected)
    readListFromData(): void {
        this.members = this.memberService.getMemberList();
    }

    fabTap(args): void {
        // options for the dialog
        let options: PromptOptions = {
            title: "New member",
            message: "Enter the name of the member you want to add",
            inputType: inputType.text,
            okButtonText: "OK",
            cancelButtonText: "Cancel",
            cancelable: true
        };
      // open dialog
      prompt(options).then(r => {
            if(r.result) {
                // Write the new member in the server
                request({
                    url: "http://" + this.memberService.getIPServer() + "/member/add",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        name: r.text
                    })
                }).then((response) => {
                    // Get the new member added to the server with the id just generated
                    const result = response.content.toJSON();
                    let newMember: IMember = result.newMember;
                    this.members.push(newMember);
                }, (e) => {
                });
          }
      });
    }
}
