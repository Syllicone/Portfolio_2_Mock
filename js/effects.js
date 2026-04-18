document.addEventListener('DOMContentLoaded', () => {
  // About heading grow effect - toggle on hover
  const heading = document.querySelector('.about-heading');
  if (heading) {
    heading.addEventListener('mouseenter', () => {
      heading.classList.toggle('grown');
    });
  }
  
  // Media grid expand functionality
  const entries = document.querySelectorAll('.entry');
  if (entries.length > 0) {
    entries.forEach((entry, index) => {
      entry.addEventListener('click', (e) => {
        e.stopPropagation();
        entries.forEach(e => e.classList.remove('expanded', 'expanded-left', 'expanded-right'));
        entry.classList.add('expanded');
        if (index % 2 === 0) {
          entry.classList.add('expanded-right');
        } else {
          entry.classList.add('expanded-left');
        }
      });
    });
    
    document.addEventListener('click', () => {
      entries.forEach(e => e.classList.remove('expanded', 'expanded-left', 'expanded-right'));
    });
  }
});
