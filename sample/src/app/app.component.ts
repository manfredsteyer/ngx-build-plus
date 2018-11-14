import { Component } from '@angular/core';

declare let VERSION: string;

@Component({

  // templateUrl: './app.component.html',
  // styleUrls: ['./app.component.css']
  template: '<h1>Custom Element works!</h1>'
  
})
export class AppComponent {
  constructor() {
    console.debug('started!');
    // console.debug('VERSION', VERSION);
  }
}
