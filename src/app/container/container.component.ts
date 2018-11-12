import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { DataService, IDataContainer, IDataItem } from "../core/data.service";
import { prompt, PromptResult, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";
import { ItemDetailComponent } from "../item-detail/item-detail.component";

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
  listItems: Array<IDataItem>;

  constructor(
      private data: DataService,
      private route: ActivatedRoute,
      private router: RouterExtensions
  ) { }

  ngOnInit(): void {
      const id = +this.route.snapshot.params.id;
      this.container = this.data.getContainer(id);
      this.listItems = this.container.listItems;
      //this.listItems = this.data.getListItems(id);
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
            let newItem = r.text;
        }
    });
}

}
