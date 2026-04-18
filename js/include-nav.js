document.addEventListener('DOMContentLoaded', function () {
  var placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  var navUrl = window.location.origin + '/nav.html';

  fetch(navUrl)
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
      
      links.forEach(function (link) {
        var href = link.getAttribute('href');
        
        // Skip non-page links
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) {
          return;
        }

        // For absolute paths starting with /, convert to full URL
        if (href.startsWith('/')) {
          link.href = window.location.origin + href;
        }

        // Check if this is the current page
        var linkPath = link.pathname;
        var isRootLink = linkPath === '/' || linkPath === '/index.html';
        var currentIsRoot = currentPath === '/' || currentPath === '/index.html';
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

