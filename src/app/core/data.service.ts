import { Injectable } from "@angular/core";
import { verticalAlignmentProperty } from "tns-core-modules/ui/page/page";
import { element } from "@angular/core/src/render3/instructions";
export interface IDataContainer {
    id: number;
    name: string;
    listItems: Array<IDataContainer>;
    owner: IMember;
}

export interface IMember {
    id: number;
    name: string;
}


@Injectable()
export class DataService {

    protected IP_Server: String;

    protected members = new Array<IMember>();

    protected containers = new Array<IDataContainer>();

    // Containers function
    getContainers(): Array<IDataContainer> {
        return this.containers;
    }
    getContainer(id: number): IDataContainer {
        return this.containers.filter((container: IDataContainer) => container.id === id)[0];
    }
    getListItems(id: number): Array<IDataContainer> {
      return this.getContainer(id).listItems;
    }
    // Use the items from the database to build the containers on the first level
    setContainers(list): void {
        this.containers.splice(0, this.containers.length);
        list.forEach(item => {
            if(item.parent == 0) {
                console.log("getMember(): ", this.getMember(item.owner));
                this.containers.push({id: item.id, name: item.name, owner: this.getMember(item.owner), listItems: new Array<IDataContainer>()});
            }
        })
    }
    // Add the items in their parent's lists
    fillContainers(list): void {
        list.forEach(item => {
            if(item.parent != 0) {
                let parent = this.containers.find(element => {
                    return element.id == item.parent
                });
                parent.listItems.push({id: item.id, name: item.name, owner: this.getMember(item.owner), listItems: new Array<IDataContainer>()});
            }
        });
    }
    
    // List of the members
    getMemberList(): Array<IMember> {
        return this.members;
    }
    setMembers(list: IMember[]): void {
        // Empty the current this.members
        this.members.splice(0, this.members.length);
        // Push all the new list
        list.forEach(member => this.members.push(member));
    }
    getMember(id: number): IMember {
        return this.members.filter((member) => member.id === id)[0];
    }
    getMemberFromName(name: string): IMember {
        return this.members.filter((member) => member.name === name)[0];
    }

    // IP address
    setIPAddress(add: String) {
        this.IP_Server = add;
    }
    getIPServer(): String {
        return this.IP_Server;
    }
}
