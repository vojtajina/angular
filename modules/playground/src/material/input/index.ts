import {bootstrap} from 'angular2/bootstrap';
import {bind, provide, Component, View, ViewEncapsulation} from 'angular2/core';
import {MdInputContainer, MdInput} from 'angular2_material/src/components/input/input';
import {UrlResolver} from 'angular2/compiler';
import {commonDemoSetup, DemoUrlResolver} from '../demo_common';

@Component({selector: 'demo-app'})
@View({
  templateUrl: './demo_app.html',
  directives: [MdInputContainer, MdInput],
  encapsulation: ViewEncapsulation.None
})
class DemoApp {
  constructor() {}
}

export function main() {
  commonDemoSetup();
  bootstrap(DemoApp, [provide(UrlResolver, {useValue: new DemoUrlResolver()})]);
}
