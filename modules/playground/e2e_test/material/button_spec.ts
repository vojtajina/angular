import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('mdButton', function() {
  var url = 'playground/src/material/button/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  // Buttons are broken right now, see https://github.com/angular/angular/issues/1602
});
