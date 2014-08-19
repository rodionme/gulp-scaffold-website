'use strict';

var LaunchView = (function () {
  function render(pageId) {
    var pageContainer = document.getElementById(pageId),
        html;

    html = '<p>Launch page</p>';

    pageContainer.innerHTML = html;
  }

  return {
    render: render
  };
})();