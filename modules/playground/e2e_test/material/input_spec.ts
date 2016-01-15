import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('md-input', function() {
  var url = 'playground/src/material/input/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  it('should enter a value to the input', () => {
    var input = element.all(by.css('md-input-container input')).first();

    input.sendKeys('Hello');

    expect(input.getAttribute('value')).toEqual('Hello');
  });
});
