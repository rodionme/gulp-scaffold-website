'use strict';

var IndexController = (function () {
  function start(pageId) {
    IndexView.render(pageId);
  }

  return {
    start: start
  };
})();