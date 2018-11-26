import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DataService, IDataContainer, IDataItem } from "../core/data.service";
import { prompt, inputType, PromptOptions } from "tns-core-modules/ui/dialogs";
import { AppTour } from 'nativescript-app-tour';


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    containers: Array<IDataContainer>;
    tour;

    @ViewChild('feat1') feat1: ElementRef;
    @ViewChild('feat2') feat2: ElementRef;

    constructor(private data: DataService) { }

    ngOnInit(): void {
        this.containers = this.data.getContainers();
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
            let newContainer: IDataContainer = {id: 999, name: r.text, listItems: null}
            this.containers.push(newContainer);
        }
    });
  }


  startTour(){
    const stops = [
        {
            view: this.feat2.nativeElement,
            title: 'Bouton d\'ajout',
            description: "Ajoutez des conteneurs avec ce bouton",
            dismissable: true
        },
        {
            view: this.feat1.nativeElement,
            title: 'Liste de conteneurs',
            description: 'La liste des conteneurs est affichée ici',
            outerCircleColor: 'orange',
            rippleColor: 'black'
        }
    ];

    this.tour = new AppTour(stops);
    this.tour.show();
}

}
