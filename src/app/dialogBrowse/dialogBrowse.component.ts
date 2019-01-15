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

    //Path to picked
    public pathToPicked = [0]

    //List of name shown in UI component
    public listContainers: Observable<Array<string>>;

    public prompt1: string = "Select location of the new object";
    public prompt2: string = "Type the name of the new object/container";
    
    //Current selected container
    public picked: IDataContainer;
    public answer;

    private subscr;
    selectedLocationIndex = 0;

    private objectParent: IDataContainer;

    constructor(
        private _params: ModalDialogParams,
        private data : DataService
        ) {

        // just in case we create an object directly
        this.objectParent = {id:0, name:"root", listItems: new Array<IDataContainer>(), owner:this.data.getMemberList()[0]};

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
        //console.log("We wish to display parent of : " + this.picked.name + " with id : " + this.picked.id);
        
        // --- If the size of the path is 1 : not possible to go up --- //
        if(this.pathToPicked.length == 1) {
            //Do nothing
            //console.log("Cannot go up (this.pathToPicked.length == 1)")
        
        // --- If the size of the path is 2 : need to display the root --- //
        } else if(this.pathToPicked.length == 2) {
        
            //console.log("this.pathToPicked.length == 2")
            this.picked = this.objectParent;

            //Clear Array
            this.objectsNames = [];
            this.objects = [];
            this.subscr.next([...this.objectsNames]);

            //Get the root (whole data)
            this.objects = this.data.getContainers();
            for (let i = 0; i<this.objects.length; i++) {
                this.objectsNames.push(this.objects[i].name);
            }
            this.subscr.next([...this.objectsNames]);
        
            //Remove last element of path
            this.pathToPicked.pop()

            // Set the parent = root (works only for two level architecture)
            this.objectParent.id = 0            
             

        // --- If the size of the path is > 2 : need to display parent of picked --- //
        } else {
            console.log("this.pathToPicked.length > 2 SHOULD NOT APPEAR ATM")
            this.picked = this.objectParent;
            this.data.getContainer(this.picked.id)
            
            //Clear Array
            this.objectsNames = [];
            this.objects = [];
            this.subscr.next([...this.objectsNames]);

            //Populate array with first level items
            for (let i = 0; i<this.data.getListItems(this.picked.id).length; i++) {
                this.objectsNames.push(this.data.getListItems(this.picked.id)[i].name);
                this.objects.push(this.data.getListItems(this.picked.id)[i]);
            }
            this.subscr.next([...this.objectsNames]);
        }      
        //console.log("pathToPicked : " + this.pathToPicked);

    }

    //Called when click on right arrow (access to child container)
    public down(args) { 
        console.log("We wish to display childs of : " + this.picked.name + " with id : " + this.picked.id);

        //Add current ID to path
        this.pathToPicked.push(this.picked.id);
        console.log(this.pathToPicked);
        //Update objectParent
        this.objectParent = this.picked;

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
            
            //11/01/2018 Commenté cette ligne
            //let picker = <ListPicker>args.object;

            this.picked = this.objects[0];
            this.subscr.next([...this.objectsNames]);

            //console.log("picker.selectedIndex" + picker.selectedIndex)
            console.log("this.picked.id :" + this.picked.id)
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
            console.log(this.data.getCurrentUser());

            //Write the new item in the server
            request({
                url: "http://" + this.data.getIPServer() + "/item/add",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                content: JSON.stringify({
                    owner: this.data.getCurrentUser().id,
                    name: result,
                    parent: this.objectParent.id,
                    space: this.data.getCurrentUser().space
                })
            }).then((response) => this.data.addContainerFromServer(response), (e) => {});
        } else {
            this.answer = null;
        }
        this._params.closeCallback(this.answer);
  }
}