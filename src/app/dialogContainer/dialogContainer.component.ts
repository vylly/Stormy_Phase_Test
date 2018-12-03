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
            <ListPicker [items]="listMembers" selectedIndex=0 (selectedIndexChange)=selectedIndexChanged($event) class="p-15"></ListPicker>
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

export class ModalViewComponent {
    public members: Array<IMember> = [];
    public prompt1: string = "Select the owner of the new object";
    public prompt2: string = "Type the name of the new object";
    public listMembers: Array<string> = [];
    public picked: string;
    public answer;

    constructor(private _params: ModalDialogParams) {
        this.members = _params.context.members;
        for (let i = 0; i<this.members.length; i++) {
            this.listMembers.push(this.members[i].name);
        }
	}

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.listMembers[picker.selectedIndex];
    }

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