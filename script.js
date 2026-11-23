'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.getElementById('site-header');
const progress = document.getElementById('scroll-progress');
const progressFill = document.getElementById('scroll-progress-fill');
let scrollFrame = 0;

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;

  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  if (progress && progressFill) {
    progressFill.style.transform = `scaleX(${percentage / 100})`;
    progress.setAttribute('aria-valuenow', String(Math.round(percentage)));
  }
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) {
    scrollFrame = window.requestAnimationFrame(() => {
      updateScrollUI();
      scrollFrame = 0;
    });
  }
}, { passive: true });

window.addEventListener('resize', updateScrollUI);
updateScrollUI();

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('site-nav');

function closeNavigation(returnFocus) {
  if (!navToggle || !nav) return;
  nav.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation menu');
  if (returnFocus) navToggle.focus();
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeNavigation(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNavigation(true);
    }
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
    if (event.matches) closeNavigation(false);
  });
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Enable light theme' : 'Enable dark theme');
    themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  });
}

const year = document.getElementById('currentYear');
if (year) year.textContent = String(new Date().getFullYear());

const revealItems = document.querySelectorAll('[data-reveal]');
const staggerGroups = document.querySelectorAll('[data-stagger]');
staggerGroups.forEach((group) => {
  [...group.children].forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 75}ms`);
  });
});

if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('js-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const counters = document.querySelectorAll('[data-counter]');
if (counters.length && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.target);
      if (!Number.isFinite(target)) {
        element.textContent = '—';
        observer.unobserve(element);
        return;
      }

      const suffix = element.dataset.suffix || '';
      if (reducedMotion) {
        element.textContent = `${target}${suffix}`;
        observer.unobserve(element);
        return;
      }

      const duration = 1100;
      const start = performance.now();
      const animate = (now) => {
        const progressValue = Math.min((now - start) / duration, 1);
        const eased = 1 - ((1 - progressValue) ** 3);
        element.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progressValue < 1) {
          window.requestAnimationFrame(animate);
        } else {
          observer.unobserve(element);
        }
      };
      window.requestAnimationFrame(animate);
    });
  }, { threshold: 0.65 });

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target);
    if (Number.isFinite(target)) counter.textContent = `${target}${counter.dataset.suffix || ''}`;
  });
}

const rotatingSkill = document.getElementById('rotating-skill');
if (rotatingSkill && !reducedMotion) {
  const skills = ['Funnels', 'CRM automations', 'Landing pages', 'Web design'];
  let skillIndex = 0;
  window.setInterval(() => {
    skillIndex = (skillIndex + 1) % skills.length;
    rotatingSkill.classList.add('is-changing');
    window.setTimeout(() => {
      rotatingSkill.textContent = skills[skillIndex];
      rotatingSkill.classList.remove('is-changing');
    }, 180);
  }, 2600);
}

const journeyDescriptions = {
  ad: ['01 / First impression', 'A clear promise catches the right person’s attention and gives them one useful next step.'],
  landing: ['02 / The landing page', 'The page answers the visitor’s first questions, shows relevant proof, and makes the action easy to find.'],
  form: ['03 / The form', 'Ask only for the details needed to start a helpful conversation. Less friction means fewer abandoned forms.'],
  pipeline: ['04 / The pipeline', 'A new inquiry lands in the right CRM stage, with an owner and a clear next action.'],
  followup: ['05 / Follow-up', 'Timely, human-sounding messages keep the conversation moving without making people feel chased.'],
  booked: ['06 / Booked call', 'The lead gets a clear confirmation and your team knows exactly what happens next.']
};
const journeyDescription = document.getElementById('journey-description');
document.querySelectorAll('[data-journey-step]').forEach((step) => {
  step.addEventListener('click', () => {
    const details = journeyDescriptions[step.dataset.journeyStep];
    if (!details || !journeyDescription) return;
    document.querySelectorAll('[data-journey-step]').forEach((item) => {
      const active = item === step;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const number = step.querySelector('span').textContent;
    journeyDescription.querySelector('.journey-detail-kicker').textContent = details[0];
    journeyDescription.querySelector('p').textContent = details[1];
    journeyDescription.dataset.activeStep = number;
  });
});

const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card[data-categories]');
const filterEmpty = document.getElementById('filterEmpty');
const filterStatus = document.getElementById('filterStatus');
const filterTimers = new WeakMap();
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    let visibleCount = 0;
    projectCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.categories.split(/\s+/).includes(filter);
      if (filterTimers.has(card)) window.clearTimeout(filterTimers.get(card));

      if (matches) {
        card.hidden = false;
        visibleCount += 1;
        window.requestAnimationFrame(() => card.classList.remove('is-hiding'));
      } else {
        card.classList.add('is-hiding');
        const timer = window.setTimeout(() => {
          if (card.classList.contains('is-hiding')) card.hidden = true;
        }, reducedMotion ? 0 : 220);
        filterTimers.set(card, timer);
      }
    });

    if (filterEmpty) filterEmpty.hidden = visibleCount > 0;
    if (filterStatus) filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} shown.`;
  });
});

const projectDetails = {
  termtrack: {
    category: 'Web app / Student productivity',
    title: 'Study TermTrack',
    summary: 'An academic time-management web app.',
    problem: '[Add the specific challenge this project was designed to solve.]',
    build: 'A web app for organizing academic time and tasks.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome, or describe what shipped without claiming unmeasured impact.]',
    url: 'https://kirsteingenzen.github.io/Study-TermTrack/'
  },
  planarity: {
    category: 'Interactive project / Puzzle',
    title: 'Planarity Nexus',
    summary: 'A puzzle-based interactive platform.',
    problem: '[Add the intended audience and problem this experience addresses.]',
    build: 'An interactive puzzle experience.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome or describe the completed experience.]',
    url: 'https://kirsteingenzennojapa.github.io/Planarity-Nexus/'
  },
  controller: {
    category: 'Web app / Mobile interaction',
    title: 'Mobile Controller App',
    summary: 'A responsive mobile-to-web controller.',
    problem: '[Describe the interaction this project was built to make easier.]',
    build: 'A mobile-friendly controller connected to a web experience.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome or describe what works in the live demo.]',
    url: 'https://mobile-phone-controller-78vl.vercel.app/'
  },
  aframe: {
    category: 'Browser experience / A-Frame',
    title: 'Group Activity',
    summary: 'A browser-based 3D environment for group activities.',
    problem: '[Describe the group activity this project supports.]',
    build: 'A 3D browser experience built for group participation.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome or describe the experience delivered.]',
    url: 'https://group-activity-a-frame-two.vercel.app/'
  },
  shooter: {
    category: 'Browser game / Interactive',
    title: '2D Shooter Game',
    summary: 'A browser game with movement controls and enemy mechanics.',
    problem: '[Describe the game concept and player challenge.]',
    build: 'A playable 2D browser game.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome or a short description of the finished game.]',
    url: 'https://2d-shooter.vercel.app/'
  },
  smartgrade: {
    category: 'Web system / Education',
    title: 'SMARTGRADE Web',
    summary: 'A web system project.',
    problem: '[Add the specific user need this system addresses.]',
    build: 'A web-based education system project.',
    tools: '[Add the tools and technologies actually used.]',
    result: '[Add a verified outcome or describe the delivered scope.]',
    url: 'https://smartgrade-vue.vercel.app/login'
  },
  funnel: {
    category: 'Funnel / Replace placeholder',
    title: 'Lead capture journey',
    summary: 'Placeholder — replace this card with a real funnel project.',
    problem: '[Add the client’s actual funnel challenge.]',
    build: '[Describe the landing page, offer, form, and connected journey you built.]',
    tools: '[Add the actual tools used, for example GoHighLevel if applicable.]',
    result: '[Add a verified result. Do not publish unverified conversion metrics.]'
  },
  automation: {
    category: 'Automation / Replace placeholder',
    title: 'Follow-up workflow',
    summary: 'Placeholder — replace this card with a real automation project.',
    problem: '[Add the real follow-up or operations problem.]',
    build: '[Describe the workflow, triggers, conditions, and handoff.]',
    tools: '[Add the actual tools used.]',
    result: '[Add a verified result or operational improvement.]'
  },
  crm: {
    category: 'CRM / Replace placeholder',
    title: 'Pipeline that follows through',
    summary: 'Placeholder — replace this card with a real CRM project.',
    problem: '[Add the real lead-management challenge.]',
    build: '[Describe the pipeline stages, fields, ownership, and process.]',
    tools: '[Add the actual CRM and connected tools.]',
    result: '[Add a verified result or workflow improvement.]'
  },
  campaign: {
    category: 'Visual campaign / Carousel',
    title: 'Business promotion system',
    summary: 'A coordinated set of social campaign graphics.',
    problem: '[Add the campaign brief or communication goal.]',
    build: 'A six-slide promotional carousel.',
    tools: '[Add the design tools actually used.]',
    result: '[Add a verified outcome or explain how the campaign was used.]'
  },
  'church-ads': {
    category: 'Graphic design / Event ads',
    title: 'Church event ads',
    summary: 'Event-led social graphics with a consistent visual direction.',
    problem: '[Add the event brief or audience need.]',
    build: 'A collection of nine event advertisement designs.',
    tools: '[Add the design tools actually used.]',
    result: '[Add a verified outcome or describe the final deliverables.]'
  },
  flyers: {
    category: 'Graphic design / Flyers',
    title: 'Church flyers',
    summary: 'Flyer layouts for church events and announcements.',
    problem: '[Add the communication goal for the flyer series.]',
    build: 'A collection of five event flyer designs.',
    tools: '[Add the design tools actually used.]',
    result: '[Add a verified outcome or describe the final deliverables.]'
  },
  apparel: {
    category: 'Apparel / Graphic design',
    title: 'T-shirt design series',
    summary: 'Apparel graphics and mockups from a multi-part series.',
    problem: '[Add the apparel brief or design challenge.]',
    build: 'A collection of apparel graphics and mockups.',
    tools: '[Add the design tools actually used.]',
    result: '[Add a verified outcome or describe the finished collection.]'
  }
};

const caseDialog = document.getElementById('caseStudyDialog');
let lastProjectTrigger = null;
document.querySelectorAll('[data-project-open]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!caseDialog) return;
    const project = projectDetails[trigger.dataset.projectOpen];
    if (!project) {
      console.error(`Missing case study content for "${trigger.dataset.projectOpen}".`);
      return;
    }

    lastProjectTrigger = trigger;
    caseDialog.querySelector('#caseCategory').textContent = project.category;
    caseDialog.querySelector('#caseTitle').textContent = project.title;
    caseDialog.querySelector('#caseSummary').textContent = project.summary;
    caseDialog.querySelector('#caseProblem').textContent = project.problem;
    caseDialog.querySelector('#caseBuild').textContent = project.build;
    caseDialog.querySelector('#caseTools').textContent = project.tools;
    caseDialog.querySelector('#caseResult').textContent = project.result;

    const visitLink = caseDialog.querySelector('#caseVisit');
    visitLink.hidden = !project.url;
    if (project.url) visitLink.href = project.url;

    if (typeof caseDialog.showModal === 'function') {
      caseDialog.showModal();
    } else {
      caseDialog.setAttribute('open', '');
    }
  });
});

if (caseDialog) {
  caseDialog.querySelector('[data-dialog-close]').addEventListener('click', () => caseDialog.close());
  caseDialog.addEventListener('click', (event) => {
    if (event.target === caseDialog) caseDialog.close();
  });
  caseDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && caseDialog.open) caseDialog.close();
  });
  caseDialog.addEventListener('close', () => {
    if (lastProjectTrigger) lastProjectTrigger.focus();
  });
}

const slider = document.getElementById('testimonialSlider');
if (slider) {
  const slides = [...slider.querySelectorAll('.testimonial-slide')];
  const count = document.getElementById('testimonialCount');
  let currentSlide = 0;
  let touchStartX = null;

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide;
      slide.hidden = !active;
      slide.classList.toggle('is-active', active);
    });
    if (count) count.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  slider.querySelector('[data-slide="previous"]').addEventListener('click', () => showSlide(currentSlide - 1));
  slider.querySelector('[data-slide="next"]').addEventListener('click', () => showSlide(currentSlide + 1));
  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(currentSlide - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(currentSlide + 1);
    }
  });
  slider.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(currentSlide + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
}

const inquiryForm = document.getElementById('inquiryForm');
if (inquiryForm) {
  const formStatus = document.getElementById('formStatus');
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const requiredFields = [...inquiryForm.querySelectorAll('[required]')];
  inquiryForm.noValidate = true;

  function updateFieldMessage(field, showError) {
    const message = document.getElementById(field.getAttribute('aria-describedby'));
    if (!message) return field.validity.valid;
    const invalid = showError && !field.validity.valid;
    message.textContent = invalid ? field.validationMessage : '';
    if (invalid) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    return field.validity.valid;
  }

  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => updateFieldMessage(field, true));
    field.addEventListener('input', () => updateFieldMessage(field, false));
  });

  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalidField = requiredFields.find((field) => !updateFieldMessage(field, true));
    if (invalidField) {
      if (formStatus) {
        formStatus.dataset.state = 'error';
        formStatus.textContent = 'A couple of details need attention before this can be sent.';
      }
      invalidField.focus();
      return;
    }

    if (inquiryForm.action.includes('REPLACE_WITH_FORM_ID')) {
      if (formStatus) {
        formStatus.dataset.state = 'error';
        formStatus.textContent = 'The inquiry form is not connected yet. Please email genzennojapa@gmail.com while it is being set up.';
      }
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    if (formStatus) {
      formStatus.dataset.state = '';
      formStatus.textContent = 'Sending your note…';
    }

    try {
      const response = await fetch(inquiryForm.action, {
        method: 'POST',
        body: new FormData(inquiryForm),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Form service returned ${response.status}.`);
      }

      inquiryForm.reset();
      requiredFields.forEach((field) => {
        field.removeAttribute('aria-invalid');
        updateFieldMessage(field, false);
      });
      if (formStatus) {
        formStatus.dataset.state = 'success';
        formStatus.textContent = 'Thanks for reaching out. Your note is on its way—I’ll get back to you soon.';
      }
    } catch (error) {
      console.error('Inquiry form submission failed.', error);
      if (formStatus) {
        formStatus.dataset.state = 'error';
        formStatus.textContent = 'That didn’t go through. Please email genzennojapa@gmail.com and I’ll reply directly.';
      }
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send inquiry <span aria-hidden="true">↗</span>';
    }
  });
}

const BOOKING_URL = 'REPLACE_WITH_YOUR_BOOKING_URL'; // Add a Calendly or other scheduling URL when ready.
if (BOOKING_URL !== 'REPLACE_WITH_YOUR_BOOKING_URL') {
  document.querySelectorAll('[data-booking-link]').forEach((link) => {
    link.href = BOOKING_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
  const bookingNote = document.getElementById('bookingNote');
  if (bookingNote) bookingNote.hidden = true;
}

if (inquiryForm && !inquiryForm.action.includes('REPLACE_WITH_FORM_ID')) {
  const formSetupNote = document.getElementById('formSetupNote');
  if (formSetupNote) formSetupNote.hidden = true;
}

const customCursor = document.getElementById('customCursor');
if (customCursor && window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  const label = customCursor.querySelector('.cursor-label');
  document.body.classList.add('has-custom-cursor');

  document.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      customCursor.style.left = `${pointerX}px`;
      customCursor.style.top = `${pointerY}px`;
      customCursor.classList.add('is-visible');
      pointerFrame = 0;
    });
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest('[data-cursor], a, button');
    if (!target || !label) return;
    label.textContent = target.dataset.cursor || 'View';
    customCursor.classList.add('is-hovering');
  });

  document.addEventListener('pointerout', (event) => {
    if (event.relatedTarget) return;
    customCursor.classList.remove('is-visible', 'is-hovering');
  });
}

const easterEggToast = document.getElementById('easterEggToast');
const secretSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let secretProgress = 0;
let toastTimer = 0;
document.addEventListener('keydown', (event) => {
  if (event.key === secretSequence[secretProgress]) {
    secretProgress += 1;
  } else {
    secretProgress = event.key === secretSequence[0] ? 1 : 0;
  }

  if (secretProgress === secretSequence.length && easterEggToast) {
    easterEggToast.textContent = 'Nice find. Every good system has a hidden path.';
    easterEggToast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      easterEggToast.hidden = true;
    }, 4200);
    secretProgress = 0;
  }
});
