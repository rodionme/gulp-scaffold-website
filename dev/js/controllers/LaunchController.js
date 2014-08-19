'use strict';

var LaunchController = (function () {
  function start(pageId) {
    LaunchView.render(pageId);
  }

  return {
    start: start
  };
})();