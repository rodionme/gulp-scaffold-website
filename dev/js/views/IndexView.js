'use strict';

var IndexView = (function () {
  function render(pageId) {
    var pageContainer = document.getElementById(pageId),
        html;

    html = '<p>Index page</p>';

    pageContainer.innerHTML = html;
  }

  return {
    render: render
  };
})();