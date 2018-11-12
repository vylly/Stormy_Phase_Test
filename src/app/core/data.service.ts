import { Injectable } from "@angular/core";
import { verticalAlignmentProperty } from "tns-core-modules/ui/page/page";

export interface IDataItem {
    id: number;
    name: string;
    description: string;
}
export interface IDataContainer {
    id: number;
    name: string;
    listItems: Array<IDataItem> ;
}

export interface IMember {
    id: number;
    name: string;
}


@Injectable()
export class DataService {

    protected items = new Array<IDataItem>(
        {
            id: 1,
            name: "Ballon de basket",
            description: "Description for Item 1"
        },
        {
            id: 2,
            name: "Casserole",
            description: "Description for Item 2"
        },
        {
            id: 3,
            name: "Raquettes de ping-pong",
            description: "Description for Item 3"
        },
        {
            id: 4,
            name: "Item 4",
            description: "Description for Item 4"
        },
        {
            id: 5,
            name: "Item 5",
            description: "Description for Item 5"
        },
        {
            id: 6,
            name: "Item 6",
            description: "Description for Item 6"
        },
        {
            id: 7,
            name: "Item 7",
            description: "Description for Item 7"
        },
        {
            id: 8,
            name: "Item 8",
            description: "Description for Item 8"
        },
        {
            id: 9,
            name: "Item 9",
            description: "Description for Item 9"
        },
        {
            id: 10,
            name: "Item 10",
            description: "Description for Item 10"
        },
        {
            id: 11,
            name: "Item 11",
            description: "Description for Item 11"
        },
        {
            id: 12,
            name: "Item 12",
            description: "Description for Item 12"
        },
        {
            id: 13,
            name: "Item 13",
            description: "Description for Item 13"
        },
        {
            id: 14,
            name: "Item 14",
            description: "Description for Item 14"
        },
        {
            id: 15,
            name: "Item 15",
            description: "Description for Item 15"
        },
        {
            id: 16,
            name: "Item 16",
            description: "Description for Item 16"
        }


    );
    protected containers = new Array<IDataContainer>(
        {
            id: 1,
            name: "Grenier",
            listItems: new Array<IDataItem>(
              {
                id: 18,
                name: "Chaussure",
                description: "Jolies Chaussures"
              },
              {
                id: 19,
                name: "Chaise",
                description: "Jolie Chaise"
              })
        },
        {
            id: 2,
            name: "Placard",
            listItems: new Array<IDataItem>(this.items[4], this.items[5], this.items[6])
        },

    );

    protected members = new Array<IMember>(
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



    getItems(): Array<IDataItem> {
        return this.items;
    }

    getItem(id: number): IDataItem {
        return this.items.filter((item) => item.id === id)[0];
    }
    getContainers(): Array<IDataContainer> {
        return this.containers;
    }
    getContainer(id: number): IDataContainer {
        return this.containers.filter((container: IDataContainer) => container.id === id)[0];
    }
    getListItems(id: number): Array<IDataItem> {
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
