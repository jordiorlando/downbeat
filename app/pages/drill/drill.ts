import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Platform} from 'ionic-angular';
// import {File} from 'ionic-native';
import * as SVG from 'svg.js';


@Component({
  templateUrl: 'build/pages/drill/drill.html'
})
export class DrillPage {
  marcher: string = 'A19';
  drill: any;

  constructor(platform: Platform, http: Http) {
    // console.log('height: ' + platform.height());
    // let field = SVG('field').size(370, 170);
    console.log(SVG);

    http.get('drill/test.json').subscribe(res => this.drill = res.json());
  }

  pinchinEvent(e) {
    console.log(e.type);
    console.log('center: (' + e.center.x + ', ' + e.center.y + ')');

    let style = window.getComputedStyle(e.target);
    // e.target.style.width = parseInt(style.width) - 5 + 'px';
  }

  pinchoutEvent(e) {
    console.log(e.type);
    console.log('center: (' + e.center.x + ', ' + e.center.y + ')');

    let style = window.getComputedStyle(e.target);
    // e.target.style.width = parseInt(style.width) + 5 + 'px';
  }

  tapEvent(e) {
    // let style = window.getComputedStyle(e.target);
    // console.log(e.target, style);
    // e.target.style.width = parseInt(style.width) + 20 + 'px';

    console.log(this.drill.marchers[this.marcher]);
  }
}
