const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });
}

const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
const nav = document.querySelector('nav');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));

    if (nav) {
      nav.classList.toggle('open', isOpen);
    }
  });

  navList.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');

      if (nav) {
        nav.classList.remove('open');
      }
    });
  });
}
