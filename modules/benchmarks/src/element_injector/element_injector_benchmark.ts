import {reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';
import {Injectable, Injector} from 'angular2/core';
import {ProtoElementInjector, DirectiveProvider} from 'angular2/src/core/linker/element_injector';
import {getIntParameter, bindAction, microBenchmark} from 'angular2/src/testing/benchmark_util';
import {BrowserDomAdapter} from 'angular2/src/platform/browser/browser_adapter';

var count = 0;

export function main() {
  BrowserDomAdapter.makeCurrent();
  var iterations = getIntParameter('iterations');

  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var providers = [
    DirectiveProvider.createFromType(A, null),
    DirectiveProvider.createFromType(B, null),
    DirectiveProvider.createFromType(C, null)
  ];
  var proto = ProtoElementInjector.create(null, 0, providers, false, 0, null);
  var elementInjector = proto.instantiate(null);

  function instantiate() {
    for (var i = 0; i < iterations; ++i) {
      var ei = proto.instantiate(null);
      ei.hydrate(null, null, null);
    }
  }

  function hydrate() {
    for (var i = 0; i < iterations; ++i) {
      elementInjector.dehydrate();
      elementInjector.hydrate(null, null, null);
    }
  }

  bindAction('#instantiate', () => microBenchmark('instantiateAvg', iterations, instantiate));
  bindAction('#hydrate', () => microBenchmark('instantiateAvg', iterations, hydrate));
}

@Injectable()
class A {
  constructor() { count++; }
}

@Injectable()
class B {
  constructor() { count++; }
}

@Injectable()
class C {
  constructor(a: A, b: B) { count++; }
}
