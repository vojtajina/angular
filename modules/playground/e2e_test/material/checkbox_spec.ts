import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('md-checkbox', function() {
  var url = 'playground/src/material/checkbox/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  it('should toggle a checkbox', function() {
    var checkbox = element.all(by.css('md-checkbox')).first();

    checkbox.click();
    expect(checkbox.getAttribute('aria-checked')).toEqual('true');

    checkbox.click();
    expect(checkbox.getAttribute('aria-checked')).toEqual('false');
  });
});
