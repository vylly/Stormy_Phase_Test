import { Component} from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { DataService,IDataContainer } from "../core/data.service";
import { Observable } from "rxjs";
import { request, getJSON, HttpRequestOptions } from "tns-core-modules/http";

@Component({
    selector: "modal-content",
    moduleId: module.id,
    templateUrl: "./dialogBrowse.component.html"
})

export class dialogBrowseComponent {

    //List of containers
    private objects: Array<IDataContainer> = [];
    //List of containers name
    private objectsNames: Array<String> = [];

    //Path to current container displayed
    // public objectPath: Array<IDataContainer> = [];

    //List of name shown in UI component
    public listContainers: Observable<Array<string>>;

    public prompt1: string = "Select location of the new object";
    public prompt2: string = "Type the name of the new object/container";
    
    //Current selected container
    public picked: IDataContainer;
    public answer;

    private subscr;
    selectedLocationIndex = 0;

    constructor(
        private _params: ModalDialogParams,
        private data : DataService
        ) {

        //Receive list of containers in its purest form
        this.objects =  _params.context.objects

        //Extract names from the list 
        for (let i = 0; i<this.objects.length; i++) {
            this.objectsNames.push(this.objects[i].name);
        }
        
        //Watch for changes in the list of names
        this.listContainers = Observable.create(subscriber => {
            this.subscr = subscriber;
            subscriber.next(this.objectsNames);
            return function () {
                console.log("Unsubscribe calleed!!!");
            };
            
        });
    }
    
    //When user taps on selected item in ListPicker, 
    public onTap(args) {
        console.log("onTap() called");
        
    }

    public selectContainer(args) {
        console.log("selectContainer()");
        //Todo
    }

    //Called when click on left arrow (access to parent container)
    public up() {
        console.log("We wish to display parent of : " + this.picked.name + " with id : " + this.picked.id);

        //If the selected item has parent, display it
    }

    //Called when click on right arrow (access to child container)
    public down(args) { 
        console.log("We wish to display childs of : " + this.picked.name + " with id : " + this.picked.id);

        //If the selected item has childs, display it
        //console.log(this.data.getListItems(this.picked.id).length)
        if(this.picked.listItems.length != 0)
        {
            console.log(this.picked.listItems)
            //Clear array
            this.objectsNames = [];
            this.objects = [];
            this.subscr.next([...this.objectsNames]);
            //We add all childs of the selected container in the listPicker
            for (let i = 0; i<this.data.getListItems(this.picked.id).length; i++) {
                this.objectsNames.push(this.data.getListItems(this.picked.id)[i].name);
                this.objects.push(this.data.getListItems(this.picked.id)[i]);
            }
            console.log(this.objectsNames); 
            //Update selected container
            let picker = <ListPicker>args.object;
            this.picked = this.objects[picker.selectedIndex];
            this.subscr.next([...this.objectsNames]);

            //Add clicked component to path
            //this.objectPath.push()
        } else {
            console.log("Containers has no childs !!!")
        }
    }

    //Detects change of selected item (is called at boot)
    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.objects[picker.selectedIndex];
        //console.log("selectIndexChanged(); picker.selectedIndex=" + picker.selectedIndex + " this.picked="+this.objects[picker.selectedIndex].name);
    }

    //To close the dialog, call the closeCallback function of the dialog params.
    public close(result : string) {
        console.log("result:" + result);
        if(result) {
            this.answer = {owner: 'All', newContainer: result}

            //Write the new item in the server
            request({
                url: "http://" + this.data.getIPServer() + "/item/add",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    //owner: this.data.getMemberFromName(this.result.owner).id
                    owner : this.data.getMemberFromName('All').id,
                    name: result,
                    parent: 0
                })
            }).then((response) => this.data.addContainerFromServer, (e) => {});
        } else {
            this.answer = null;
        }
        this._params.closeCallback(this.answer);
  }

}