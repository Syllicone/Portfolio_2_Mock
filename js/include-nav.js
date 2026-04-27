document.addEventListener('DOMContentLoaded', function () {
  var placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  // Bump when nav.html structure changes so clients don’t reuse stale markup.
  var NAV_MARKUP_CACHE_VERSION = '1';
  var NAV_HTML_SESSION_KEY = 'portfolio_nav_markup_v' + NAV_MARKUP_CACHE_VERSION;
  var NAV_PATH_SESSION_KEY = 'portfolio_nav_ok_path_v' + NAV_MARKUP_CACHE_VERSION;

  // Remember which nav folders are collapsed across full page loads (static HTML + fetch nav).
  var NAV_COLLAPSE_STORAGE_KEY = 'portfolio_nav_collapsed_v1';

  function loadCollapsedMap() {
    try {
      var raw = localStorage.getItem(NAV_COLLAPSE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCollapsedMap(map) {
    try {
      localStorage.setItem(NAV_COLLAPSE_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      /* ignore quota / private mode */
    }
  }

  function getSession(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setSession(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      /* ignore */
    }
  }

  function clearNavCache() {
    try {
      sessionStorage.removeItem(NAV_HTML_SESSION_KEY);
      sessionStorage.removeItem(NAV_PATH_SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  // Try multiple possible paths to find nav.html
  var paths = [
    'nav.html',
    '../nav.html',
    '../../nav.html',
    '../../../nav.html'
  ];

  function initNavMarkup(ph) {
    var currentPath = window.location.pathname;
    var links = ph.querySelectorAll('a[href]');

    var nav = ph.querySelector('nav');
    var toggle = ph.querySelector('.nav-toggle');
    if (nav && toggle) {
      function setOpen(isOpen) {
        nav.classList.toggle('nav-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      toggle.addEventListener('click', function () {
        var isOpen = nav.classList.contains('nav-open');
        setOpen(!isOpen);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
      });

      nav.addEventListener('click', function (e) {
        var target = e.target;
        if (target && target.closest && target.closest('a[href]')) {
          setOpen(false);
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) setOpen(false);
      });
    }

    if (nav) {
      var collapsibleTriggers = nav.querySelectorAll('span.section-heading, span.label');
      var collapseId = 0;

      function setupCollapsible(trigger, target) {
        if (!target) return;
        if (target.tagName !== 'UL') return;

        var id = target.id;
        if (!id) {
          collapseId += 1;
          id = 'nav-collapsible-' + collapseId;
          target.id = id;
        }

        trigger.classList.add('nav-collapsible-trigger');
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-controls', id);

        function setExpanded(isExpanded, persist) {
          trigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
          target.hidden = !isExpanded;
          if (persist) {
            var map = loadCollapsedMap();
            if (!isExpanded) {
              map[id] = true;
            } else {
              delete map[id];
            }
            saveCollapsedMap(map);
          }
        }

        var collapsedMap = loadCollapsedMap();
        var storedCollapsed = !!collapsedMap[id];
        setExpanded(!storedCollapsed, false);

        trigger.addEventListener('click', function () {
          var expanded = trigger.getAttribute('aria-expanded') === 'true';
          setExpanded(!expanded, true);
        });

        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var expanded = trigger.getAttribute('aria-expanded') === 'true';
            setExpanded(!expanded, true);
          }
        });
      }

      collapsibleTriggers.forEach(function (trigger) {
        var target = null;
        if (trigger.classList.contains('section-heading')) {
          target = trigger.nextElementSibling;
        } else if (trigger.classList.contains('label')) {
          target = trigger.nextElementSibling;
        }
        setupCollapsible(trigger, target);
      });
    }

    var basePath = '';
    if (currentPath.includes('/Portfolio_2_Mock/')) {
      basePath = '/Portfolio_2_Mock';
    }

    links.forEach(function (link) {
      var href = link.getAttribute('href');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      if (href.startsWith('/')) {
        link.setAttribute('href', basePath + href);
      }

      var linkPath = link.pathname;
      var isCurrent = currentPath === linkPath || currentPath.includes(href.replace(/^\//, ''));

      if (isCurrent) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function applyNavHtml(html, okPath) {
    placeholder.innerHTML = html;
    setSession(NAV_HTML_SESSION_KEY, html);
    if (okPath) {
      setSession(NAV_PATH_SESSION_KEY, okPath);
    }
    initNavMarkup(placeholder);
  }

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
        applyNavHtml(html, paths[index]);
      })
      .catch(function () {
        tryFetch(index + 1);
      });
  }

  var cachedHtml = getSession(NAV_HTML_SESSION_KEY);
  if (cachedHtml) {
    placeholder.innerHTML = cachedHtml;
    initNavMarkup(placeholder);
    return;
  }

  var preferredPath = getSession(NAV_PATH_SESSION_KEY);
  if (preferredPath && paths.indexOf(preferredPath) !== -1) {
    fetch(preferredPath)
      .then(function (response) {
        if (response.ok) return response.text();
        throw new Error('stale path');
      })
      .then(function (html) {
        applyNavHtml(html, preferredPath);
      })
      .catch(function () {
        clearNavCache();
        tryFetch(0);
      });
    return;
  }

  tryFetch(0);
});
