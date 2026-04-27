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

        // Mobile burger menu behavior (nav.html is injected dynamically)
        var nav = placeholder.querySelector('nav');
        var toggle = placeholder.querySelector('.nav-toggle');
        if (nav && toggle) {
          function setOpen(isOpen) {
            nav.classList.toggle('nav-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          }

          toggle.addEventListener('click', function () {
            var isOpen = nav.classList.contains('nav-open');
            setOpen(!isOpen);
          });

          // Close on Esc
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setOpen(false);
          });

          // Close after tapping a link (helps on phones)
          nav.addEventListener('click', function (e) {
            var target = e.target;
            if (target && target.closest && target.closest('a[href]')) {
              setOpen(false);
            }
          });

          // If resized back to desktop, ensure menu is not "stuck" hidden
          window.addEventListener('resize', function () {
            if (window.innerWidth > 900) setOpen(false);
          });
        }
        
        // Detect if we're on GitHub Pages at /Portfolio_2_Mock/
        var basePath = '';
        if (currentPath.includes('/Portfolio_2_Mock/')) {
          basePath = '/Portfolio_2_Mock';
        }
        
        links.forEach(function (link) {
          var href = link.getAttribute('href');
          
          // Skip non-page links
          if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('javascript:')) {
            return;
          }

          // Convert absolute paths to include the base path if on GitHub Pages
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

