import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

// TODO: Enable tests once #5132 is fixed.
xdescribe('md-grid-list', function() {
  var url = 'playground/src/material/grid_list/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  it('should set tiles into different positions', () => {
    var tiles = element.all(by.css('md-grid-list#complex md-grid-tile'));

    // If the grid-list was not doing any layout, all of the tiles would have the same position.
    // So our smoke test simply checks that any two tiles are in different positions.
    expect(tiles.first().getLocation()).not.toEqual(tiles.last().getLocation());
  });
});
