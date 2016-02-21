'use strict';

describe('Navigation lifecycle', function () {
  var elt,
    $compile,
    $rootScope,
    $router,
    $compileProvider;

  beforeEach(function () {
    module('ng');
    module('ngComponentRouter');
    module(function (_$compileProvider_) {
      $compileProvider = _$compileProvider_;
    });

    inject(function (_$compile_, _$rootScope_, _$router_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $router = _$router_;
    });

    registerComponent('oneCmp', {
      template: '<div>{{oneCmp.number}}</div>',
      controller: function () {this.number = 'one'}
    });
    registerComponent('twoCmp', {
      template: '<div><a ng-link="[\'/Two\']">{{twoCmp.number}}</a></div>',
      controller: function () {this.number = 'two'}
    });
  });


  it('should run the activate hook of controllers', function () {
    var spy = jasmine.createSpy('activate');
    registerComponent('activateCmp', {
      template: '<p>hello</p>',
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/a', component: 'activateCmp' }
    ]);
    compile('<div>outer { <div ng-outlet></div> }</div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });


  it('should pass instruction into the activate hook of a controller', function () {
    var spy = jasmine.createSpy('activate');
    registerComponent('userCmp', {
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/user/:name', component: 'userCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalledWith(instructionFor('userCmp'), undefined);
  });


  it('should pass previous instruction into the activate hook of a controller', function () {
    var spy = jasmine.createSpy('activate');
    var activate = registerComponent('activateCmp', {
      template: 'hi',
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/user/:name', component: 'oneCmp' },
      { path: '/post/:id', component: 'activateCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor('activateCmp'),
                                     instructionFor('oneCmp'));
  });

  it('should inject $scope into the controller constructor', function () {
    var injectedScope;
    registerComponent('userCmp', {
      template: '',
      controller: function ($scope) {
        injectedScope = $scope;
      }
    });

    $router.config([
      { path: '/user', component: 'userCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user');
    $rootScope.$digest();

    expect(injectedScope).toBeDefined();
  });


  it('should run the deactivate hook of controllers', function () {
    var spy = jasmine.createSpy('deactivate');
    registerComponent('deactivateCmp', {
      $routerOnDeactivate: spy
    });

    $router.config([
      { path: '/a', component: 'deactivateCmp' },
      { path: '/b', component: 'oneCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalled();
  });


  it('should pass instructions into the deactivate hook of controllers', function () {
    var spy = jasmine.createSpy('deactivate');
    registerComponent('deactivateCmp', {
      $routerOnDeactivate: spy
    });

    $router.config([
      { path: '/user/:name', component: 'deactivateCmp' },
      { path: '/post/:id', component: 'oneCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor('oneCmp'),
                                     instructionFor('deactivateCmp'));
  });


  it('should run the deactivate hook before the activate hook', function () {
    var log = [];

    registerComponent('activateCmp', {
      $routerOnActivate: function () {
        log.push('activate');
      }
    });

    registerComponent('deactivateCmp', {
      $routerOnDeactivate: function () {
        log.push('deactivate');
      }
    });

    $router.config([
      { path: '/a', component: 'deactivateCmp' },
      { path: '/b', component: 'activateCmp' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    $router.navigateByUrl('/b');
    $rootScope.$digest();

    expect(log).toEqual(['deactivate', 'activate']);
  });

  it('should reuse a component when the routerCanReuse hook returns true', function () {
    var log = [];
    var cmpInstanceCount = 0;

    function ReuseCmp() {
      cmpInstanceCount++;
    }

    registerComponent('reuseCmp', {
      template: 'reuse {<ng-outlet></ng-outlet>}',
      $routeConfig: [
        {path: '/a', component: 'oneCmp'},
        {path: '/b', component: 'twoCmp'}
      ],
      controller: ReuseCmp,
      $routerCanReuse: function () {
        return true;
      },
      $routerOnReuse: function (next, prev) {
        log.push('reuse: ' + prev.urlPath + ' -> ' + next.urlPath);
      }
    });

    $router.config([
      { path: '/on-reuse/:number/...', component: 'reuseCmp' },
      { path: '/two', component: 'twoCmp', name: 'Two'}
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/on-reuse/1/a');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {one} }');

    $router.navigateByUrl('/on-reuse/2/b');
    $rootScope.$digest();
    expect(log).toEqual(['reuse: on-reuse/1 -> on-reuse/2']);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {two} }');
  });


  it('should not reuse a component when the routerCanReuse hook returns false', function () {
    var log = [];
    var cmpInstanceCount = 0;

    function NeverReuseCmp() {
      cmpInstanceCount++;
    }
    registerComponent('reuseCmp', {
      template: 'reuse {<ng-outlet></ng-outlet>}',
      $routeConfig: [
        {path: '/a', component: 'oneCmp'},
        {path: '/b', component: 'twoCmp'}
      ],
      controller: NeverReuseCmp,
      $routerCanReuse: function () {
        return false;
      },
      $routerOnReuse: function (next, prev) {
        log.push('reuse: ' + prev.urlPath + ' -> ' + next.urlPath);
      }
    });

    $router.config([
      { path: '/never-reuse/:number/...', component: 'reuseCmp' },
      { path: '/two', component: 'twoCmp', name: 'Two'}
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/never-reuse/1/a');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(1);
    expect(elt.text()).toBe('outer { reuse {one} }');

    $router.navigateByUrl('/never-reuse/2/b');
    $rootScope.$digest();
    expect(log).toEqual([]);
    expect(cmpInstanceCount).toBe(2);
    expect(elt.text()).toBe('outer { reuse {two} }');
  });


  // TODO: need to solve getting ahold of canActivate hook
  it('should not activate a component when canActivate returns false', function () {
    var canActivateSpy = jasmine.createSpy('canActivate').and.returnValue(false);
    var spy = jasmine.createSpy('activate');
    registerComponent('activateCmp', {
      $canActivate: canActivateSpy,
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/a', component: 'activateCmp' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).not.toHaveBeenCalled();
    expect(elt.text()).toBe('outer {  }');
  });


  it('should activate a component when canActivate returns true', function () {
    var activateSpy = jasmine.createSpy('activate');
    var canActivateSpy = jasmine.createSpy('canActivate').and.returnValue(true);
    registerComponent('activateCmp', {
      template: 'hi',
      $canActivate: canActivateSpy,
      $routerOnActivate: activateSpy
    });

    $router.config([
      { path: '/a', component: 'activateCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(canActivateSpy).toHaveBeenCalled();
    expect(activateSpy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  });


  it('should activate a component when canActivate returns a resolved promise', inject(function ($q) {
    var spy = jasmine.createSpy('activate');
    registerComponent('activateCmp', {
      template: 'hi',
      $canActivate: function () {
        return $q.when(true);
      },
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/a', component: 'activateCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  }));


  it('should inject into the canActivate hook of controllers', inject(function ($http) {
    var spy = jasmine.createSpy('canActivate').and.returnValue(true);
    registerComponent('activateCmp', {
      $canActivate: spy
    });

    spy.$inject = ['$nextInstruction', '$http'];

    $router.config([
      { path: '/user/:name', component: 'activateCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    var args = spy.calls.mostRecent().args;
    expect(args[0].params).toEqual({name: 'brian'});
    expect(args[1]).toBe($http);
  }));


  it('should not navigate when routerCanDeactivate returns false', function () {
    registerComponent('activateCmp', {
      template: 'hi',
      $routerCanDeactivate: function () {
        return false;
      }
    });

    $router.config([
      { path: '/a', component: 'activateCmp' },
      { path: '/b', component: 'oneCmp' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');

    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');
  });


  it('should navigate when routerCanDeactivate returns true', function () {
    registerComponent('activateCmp', {
      template: 'hi',
      $routerCanDeactivate: function () {
        return true;
      }
    });

    $router.config([
      { path: '/a', component: 'activateCmp' },
      { path: '/b', component: 'oneCmp' }
    ]);
    compile('outer { <div ng-outlet></div> }');

    $router.navigateByUrl('/a');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { hi }');

    $router.navigateByUrl('/b');
    $rootScope.$digest();
    expect(elt.text()).toBe('outer { one }');
  });


  it('should activate a component when canActivate returns true', function () {
    var spy = jasmine.createSpy('activate');
    registerComponent('activateCmp', {
      template: 'hi',
      $canActivate: function () {
        return true;
      },
      $routerOnActivate: spy
    });

    $router.config([
      { path: '/a', component: 'activateCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/a');
    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
    expect(elt.text()).toBe('hi');
  });


  it('should pass instructions into the routerCanDeactivate hook of controllers', function () {
    var spy = jasmine.createSpy('routerCanDeactivate').and.returnValue(true);
    registerComponent('deactivateCmp', {
      $routerCanDeactivate: spy
    });

    $router.config([
      { path: '/user/:name', component: 'deactivateCmp' },
      { path: '/post/:id', component: 'oneCmp' }
    ]);
    compile('<div ng-outlet></div>');

    $router.navigateByUrl('/user/brian');
    $rootScope.$digest();
    $router.navigateByUrl('/post/123');
    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(instructionFor('oneCmp'),
                                     instructionFor('deactivateCmp'));
  });


  function registerComponent(name, options) {
    var controller = options.controller || function () {};

    ['$routerOnActivate', '$routerOnDeactivate', '$routerOnReuse', '$routerCanReuse', '$routerCanDeactivate'].forEach(function (hookName) {
      if (options[hookName]) {
        controller.prototype[hookName] = options[hookName];
      }
    });

    function factory() {
      return {
        template: options.template || '',
        controllerAs: name,
        controller: controller
      };
    }

    if (options.$canActivate) {
      factory.$canActivate = options.$canActivate;
    }
    if (options.$routeConfig) {
      factory.$routeConfig = options.$routeConfig;
    }

    $compileProvider.directive(name, factory);
  }

  function compile(template) {
    elt = $compile('<div>' + template + '</div>')($rootScope);
    $rootScope.$digest();
    return elt;
  }

  function instructionFor(componentType) {
    return jasmine.objectContaining({componentType: componentType});
  }
});
