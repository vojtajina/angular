import {Component, View} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

@Component({
  selector: 'my-app'
})
@View({
  template: '<h1>Hello</h1>',
})
class FooCmp {
  constructor(a: string, b: number) {}
}


@Component({
  selector: 'my-app'
})
@View({
	template: '<h1>Hello {{ name }}</h1><router-outlet></router-outlet>',
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([
  {path: '/home', component: FooCmp}
])
class MyAppComponent {
  name: string;

  constructor() { this.name = 'Alice'; }
}

bootstrap(MyAppComponent, ROUTER_PROVIDERS);
