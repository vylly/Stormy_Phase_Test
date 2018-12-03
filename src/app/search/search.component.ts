import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IMember } from "../core/data.service";
import { prompt, PromptResult, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";

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
                let newMember: IMember = {id: 9, name:r.text};
                this.members.push(newMember);
          }
      });
    }
}
