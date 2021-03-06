import { Injectable } from "@angular/core";
import { verticalAlignmentProperty } from "tns-core-modules/ui/page/page";
import { element } from "@angular/core/src/render3/instructions";
export interface IDataContainer {
    id: number;
    name: string;
    listItems: Array<IDataContainer>;
    owner: IMember;
    codeValue: string;
}

export interface IMember {
    id: number;
    name: string;
    email: string;
}

export interface ISpace {
    id: number,
    name: string
}

export class User {
    email: string;
    password: string;
    confirmPassword: string;
    id: number;
    name: string;
    spaces: Array<ISpace>;
    currentSpace: ISpace;
    token: string;
}

@Injectable()
export class DataService {

    protected IP_Server: String = "51.38.68.118:5000";
    //protected IP_Server: String = "192.168.1.25:5000";
    //protected IP_Server: String = "192.168.1.14:5000";

    protected members = new Array<IMember>();

    protected currentUser: User;

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
                this.containers.push({id: item.id, name: item.name, owner: this.getMember(item.owner), listItems: new Array<IDataContainer>(), codeValue: item.codeValue});
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
                parent.listItems.push({id: item.id, name: item.name, owner: this.getMember(item.owner), listItems: new Array<IDataContainer>(), codeValue: item.codeValue});
            }
        });
    }
    // Add an container/item in the tree (only work with a 2-level tree) (si on veut faire une arborescence à niveau infini alors autant refaire un getContainers/fillContainers en redemandant tout au backend)
    addContainer(newC: IDataContainer, parent: number): void {
        if(parent == 0) {
            this.containers.push(newC);
        } else {
            console.log("parent = ", parent);
            this.containers.forEach(cont => {
                if(cont.id == parent) {
                    cont.listItems.push(newC);
                }
            });   
        }
    }
    
    // List of the members
    getMemberList(): Array<IMember> {
        return this.members;
    }
    setMembers(list): void {
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

    getIPServer(): String {
        return this.IP_Server;
    }

    // Set the logged user
    setCurrentUser(user: User) {
        this.currentUser = user;
    }
    getCurrentUser(): User {
        return this.currentUser;
    }

    // Add a container from the response of the server after POST request
    addContainerFromServer(response): void {
         // Get the new member added to the server with the id just generated
         const jsonResponse = response.content.toJSON();
         // Need to format the answer int the frontend format: with the name of the owner and not the id, and with an empty list of children
         let newContainer = {
             id: jsonResponse.newItem.id,
             name: jsonResponse.newItem.name,
             owner: this.getMember(jsonResponse.newItem.owner),
             listItems: new Array<IDataContainer>(),
             codeValue: jsonResponse.newItem.codeValue
         }
         // Add it to the containers in the data service just in case
         this.addContainer(newContainer, jsonResponse.newItem.parent);
    }
}
