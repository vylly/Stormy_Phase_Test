import { Component} from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { IMember } from "../core/data.service";
import { ListPicker } from "tns-core-modules/ui/list-picker";

@Component({
    selector: "modal-content",
    template: `
    <StackLayout margin="24" horizontalAlignment="center" verticalAlignment="center">
        <StackLayout>
            <Label [text]="prompt1"></Label>
            <ListPicker [items]="listObjects" selectedIndex=0 (selectedIndexChange)=selectedIndexChanged($event) class="p-15"></ListPicker>
            <Label [text]="prompt2"></Label>
            <TextField #nameItem hint="Name of the object"></TextField>
            <StackLayout orientation="horizontal" marginTop="12">
                <Button text="ok" (tap)="close(nameItem.text)"></Button>
                <Button text="cancel" (tap)="close()"></Button>
            </StackLayout>

        </StackLayout>
    </StackLayout>
  `
})

export class dialogBrowseComponent {
    public objects: Array<IMember> = [];
    public prompt1: string = "Select the location of the new object";
    public prompt2: string = "Type the name of the new object/container";
    public listObjects: Array<string> = [];
    public picked: string;
    public answer;

    constructor(private _params: ModalDialogParams) {
        //objects = list of containers
        this.objects = _params.context.objects;
        //Pushing all containers in property listObjets of the dialog
        for (let i = 0; i<this.objects.length; i++) {
            this.listObjects.push(this.objects[i].name);
        }
	}

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.listObjects[picker.selectedIndex];
    }

    //To close the dialog, call the closeCallback function of the dialog params.
    public close(result: string) {
        if(!this.picked) {
            this.picked = "all";
        }
        if(result) {
            this.answer = {owner: this.picked, newContainer: result}
        } else {
            this.answer = null;
        }
        this._params.closeCallback(this.answer);
  }

}