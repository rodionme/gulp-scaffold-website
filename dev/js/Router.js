// For SPA

'use strict';

var Router = (function () {
  var routes = [
    {id: 'page-index', hash: '#page-index', controller: 'IndexController'}
  ],
      defaultRoute = '#page-index',
      currentHash = '';

  function startRouting() {
    if (window.location.hash) {
      hashCheck();
    }

    window.location.hash = window.location.hash || defaultRoute;
    window.onhashchange = hashCheck;
  }

  function hashCheck() {
    var isPageFound = false,
        i, currentRoute;

    $(document.body).find('.page-container').removeClass('active');

    if (window.location.hash !== currentHash) {
      for (i = 0; currentRoute = routes[i++];) {
        if (window.location.hash === currentRoute.hash) {
          isPageFound = true;
          break;
        }
      }

      if (isPageFound) {
        loadController(currentRoute);
      } else {
        console.log('Page not found');
      }
      currentHash = window.location.hash;
    }
  }

  function loadController(route) {
    console.log(route.hash);
    $(document.body).data('page', route.id);
    $(route.hash).addClass('active');

    window[route.controller].start(route.id);
  }

  return {
    startRouting: startRouting
  };
})();

// For common site

'use strict';

var Router = (function () {
  var routes = [
    { id: 'index-page', controller: 'IndexController' }
  ];

  function startRouting() {
    pageCheck();
  }

  function pageCheck() {
    var pageId = $(document.body).find('.page-container').attr('id'),
        isPageFound = false,
        i, currentRoute;

    for (i = 0; currentRoute = routes[i++];) {
      if (pageId === currentRoute.id) {
        isPageFound = true;
        break;
      }
    }

    if (isPageFound) {
      loadController(currentRoute);
    } else {
      console.log('Page id not found');
    }
  }

  function loadController(route) {
    window[route.controller].start(route.id);
  }

  return {
    startRouting: startRouting
  };
})();