import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService, IDataContainer} from "../core/data.service";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ModalViewComponent } from "../dialogContainer/dialogContainer.component";

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

  constructor(
      private data: DataService,
      private route: ActivatedRoute,
      //private router: RouterExtensions,
      private _modalService: ModalDialogService,
      private _vcRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
      const id = +this.route.snapshot.params.id;
      this.container = this.data.getContainer(id);
      this.listItems = this.container.listItems;
  }

  fabTap(): void {
    const options: ModalDialogOptions = {
        viewContainerRef: this._vcRef,
        context: {members: this.data.getMemberList()}
    };

    this._modalService.showModal(ModalViewComponent, options)
    .then((dialogResult: Object) => {
        this.result = dialogResult;
        let newContainer: IDataContainer = {id: 999, name: this.result.newContainer, listItems: new Array<IDataContainer>(), owner: {id:999, name:this.result.owner}}
        this.listItems.push(newContainer);
    })
}

}
