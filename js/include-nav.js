document.addEventListener('DOMContentLoaded', function () {
  var placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  // Try multiple possible paths to find nav.html
  var paths = [
    'nav.html',
    '../nav.html',
    '../../nav.html',
    '../../../nav.html'
  ];

  function tryFetch(index) {
    if (index >= paths.length) {
      console.error('Failed to load nav.html from any location');
      return;
    }

    fetch(paths[index])
      .then(function (response) {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Not found at: ' + paths[index]);
      })
      .then(function (html) {
        placeholder.innerHTML = html;

        var currentPath = window.location.pathname;
        var links = placeholder.querySelectorAll('a[href]');
        
        // Extract the base path (e.g., "/Portfolio_2_Mock/" or "/")
        var pathParts = currentPath.split('/').filter(function(p) { return p; });
        var basePath = '';
        
        // If we're in a subdirectory like Portfolio_2_Mock, include it
        if (pathParts.length > 0 && (currentPath.includes('Portfolio_2_Mock') || pathParts[0] !== 'index.html')) {
          basePath = '/' + pathParts[0];
        }
        
        links.forEach(function (link) {
          var href = link.getAttribute('href');
          
          // Skip non-page links
          if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) {
            return;
          }

          // Convert absolute paths to include the base path
          if (href.startsWith('/')) {
            var newHref = basePath + href;
            link.setAttribute('href', newHref);
          }

          // Check if this is the current page
          var linkPath = link.pathname;
          var isCurrent = currentPath === linkPath || currentPath.includes(href.replace(/^\//, ''));
          
          if (isCurrent) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        });
      })
      .catch(function (error) {
        tryFetch(index + 1);
      });
  }

  tryFetch(0);
});

