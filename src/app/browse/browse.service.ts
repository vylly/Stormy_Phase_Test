
import { Injectable, Output, EventEmitter } from "@angular/core";

@Injectable()
export class BrowseService {
    //Is scanner paused ?
    pause = false;

    //Every component that will inject this service can be notified.
    @Output() change: EventEmitter<boolean> = new EventEmitter();

    //Change state of scanner
    toggle() {
        this.pause = !this.pause;
        this.change.emit(this.pause);
  }
  

}