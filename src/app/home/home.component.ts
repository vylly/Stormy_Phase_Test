import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IDataContainer, IDataItem } from "../core/data.service";
import { prompt, PromptResult, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";

// LIST TAB


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    containers: Array<IDataContainer>;

    constructor(private data: DataService, private router: RouterExtensions) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
    }

    fabTap(args): void {
        // options for the dialog
      let options: PromptOptions = {
          title: "New item",
          message: "Enter the name of the item you want to add to this container",
          inputType: inputType.text,
          okButtonText: "OK",
          cancelButtonText: "Cancel",
          cancelable: true
      };
      // open dialog
    prompt(options).then(r => {
        if(r.result) {
            let newContainer: IDataContainer = {id: 999, name: r.text, listItems: null}
            this.containers.push(newContainer);
        }
    });
  }
}
