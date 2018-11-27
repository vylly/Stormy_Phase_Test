import { Injectable } from "@angular/core";
import { verticalAlignmentProperty } from "tns-core-modules/ui/page/page";
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

    protected members = new Array<IMember>(
        {
            id: 0,
            name: "all"
        },
        {
            id: 1,
            name: "William"
        },
        {
            id: 2,
            name: "Vincent"
        },
        {
            id: 3,
            name: "Max"
        },
        {
            id: 4,
            name: "Thomas"
        }
    )

    protected items = new Array<IDataContainer>(
        {
            id: 1,
            name: "Ballon de basket",
            listItems: new Array<IDataContainer>(),
            owner: this.members[1]
        },
        {
            id: 2,
            name: "Casserole",
            listItems: new Array<IDataContainer>(),
            owner: this.members[4]
        },
        {
            id: 3,
            name: "Raquettes de ping-pong",
            listItems: new Array<IDataContainer>(),
            owner: this.members[0]
        },
        {
            id: 4,
            name: "PS4",
            listItems: new Array<IDataContainer>(),
            owner: this.members[2]
        },
        {
            id: 5,
            name: "Chapeau",
            listItems: new Array<IDataContainer>(),
            owner: this.members[3]
        },
        {
            id: 6,
            name: "Snowboard",
            listItems: new Array<IDataContainer>(),
            owner: this.members[4]
        }


    );
    protected containers = new Array<IDataContainer>(
        {
            id: 1,
            name: "Grenier",
            listItems: new Array<IDataContainer>(this.items[0], this.items[1], this.items[2]),
            owner: this.members[0]
        },
        {
            id: 2,
            name: "Placard",
            listItems: new Array<IDataContainer>(this.items[4], this.items[5], this.items[3]),
            owner: this.members[0]
        },

    );



    getItems(): Array<IDataContainer> {
        return this.items;
    }

    getItem(id: number): IDataContainer {
        return this.items.filter((item) => item.id === id)[0];
    }
    getContainers(): Array<IDataContainer> {
        return this.containers;
    }
    getContainer(id: number): IDataContainer {
        return this.containers.filter((container: IDataContainer) => container.id === id)[0];
    }
    getListItems(id: number): Array<IDataContainer> {
      return this.getContainer(id).listItems;
    }
    
    getMemberList(): Array<IMember> {
        return this.members;
    }
    getMember(id: number): IMember {
        return this.members.filter((member) => member.id === id)[0];
    }
    getMaxIdContainer(): number {
        var max = 0;
        for(var i; i<this.containers.length; i++) {
            if(this.containers[i].id > max) {
                max = this.containers[i].id;
            }
        }
        return max;
    }
    getMaxIdItem(): number {
        var max = 0;
        for(var i; i<this.items.length; i++) {
            if(this.items[i].id > max) {
                max = this.items[i].id;
            }
        }
        return max;
    }
    
}
