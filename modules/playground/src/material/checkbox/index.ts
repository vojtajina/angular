import {bootstrap} from 'angular2/bootstrap';
import {bind, provide, Component, Directive, View, ViewEncapsulation} from 'angular2/core';
import {UrlResolver} from 'angular2/compiler';
import {MdCheckbox} from 'angular2_material/src/components/checkbox/checkbox';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';


@Component({
  selector: 'demo-app',
})
@View({
  templateUrl: './demo_app.html',
  directives: [MdCheckbox],
  encapsulation: ViewEncapsulation.None
})
class DemoApp {
  toggleCount: number;

  constructor() {
    this.toggleCount = 0;
  }

  increment() {
    this.toggleCount++;
  }
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [provide(UrlResolver, {useValue: new DemoUrlResolver()})]);
}
