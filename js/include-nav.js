document.addEventListener('DOMContentLoaded', function () {
  var placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  // Calculate the correct relative path to nav.html based on current page depth
  var currentPath = window.location.pathname;
  var depth = (currentPath.match(/\//g) || []).length - 1;
  var navPath = Array(depth).fill('..').join('/') || '.';
  navPath = navPath + '/nav.html';
  if (navPath === './nav.html') navPath = 'nav.html';

  fetch(navPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load nav.html: ' + response.status);
      }
      return response.text();
    })
    .then(function (html) {
      placeholder.innerHTML = html;

      var currentPath = window.location.pathname;
      var links = placeholder.querySelectorAll('a[href]');
      
      // Calculate depth of current page
      var depth = (currentPath.match(/\//g) || []).length - 1;
      var upPath = Array(depth).fill('..').join('/');
      if (upPath) upPath = upPath + '/';
      
      links.forEach(function (link) {
        var href = link.getAttribute('href');
        
        // Skip non-page links
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) {
          return;
        }

        // Convert absolute paths to relative paths
        if (href.startsWith('/')) {
          href = href.substring(1); // Remove leading /
          link.setAttribute('href', upPath + href);
        }

        // Check if this is the current page
        var linkPath = link.pathname;
        var isRootLink = linkPath === '/' || linkPath.endsWith('/index.html');
        var currentIsRoot = currentPath === '/' || currentPath.endsWith('/index.html');
        var isCurrent = linkPath === currentPath || (isRootLink && currentIsRoot);
        
        if (isCurrent) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    })
    .catch(function (error) {
      console.error(error);
      placeholder.innerHTML = '<p>Navigation failed to load.</p>';
    });
});

