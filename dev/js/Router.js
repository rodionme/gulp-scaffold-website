'use strict';

var Router = (function () {
  var routes = [
    {id: 'page-launch', hash: '#page-launch', controller: 'LaunchController'}
  ],
      defaultRoute = '#page-launch',
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

    $(document.body).find('section').removeClass('active');

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
    $(document.body).attr('page', route.id);
    $(route.hash).addClass('active');

    window[route.controller].start(route.id);
  }

  return {
    startRouting: startRouting
  };
})();