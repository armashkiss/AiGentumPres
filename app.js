const sections = [...document.querySelectorAll('.section')];
const nav = document.querySelector('.slide-nav');
const progress = document.querySelector('.progress span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

sections.forEach((section, index) => {
  const a = document.createElement('a');
  a.href = `#${section.id}`;
  a.setAttribute('aria-label', `Перейти к экрану ${index + 1}`);
  nav.appendChild(a);
});
const dots = [...nav.querySelectorAll('a')];

const revealItems = [...document.querySelectorAll('h1,h2,.statusline,.lead,.copy,.wide-copy,.problem-grid,.media-frame,.agent-list,.benefit-grid,.timeline,.orbit,.principles,.feature-list,.industry-cases,.contact-panel,.button,.chat-examples,.control-stack')];
revealItems.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });
revealItems.forEach(el => io.observe(el));

const update = () => {
  const scrollY = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.width = `${Math.max(0, Math.min(100, (scrollY / max) * 100))}%`;

  let current = 0;
  sections.forEach((section, i) => {
    const top = section.offsetTop - window.innerHeight * 0.38;
    if (scrollY >= top) current = i;
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  document.documentElement.style.setProperty('--scroll', (scrollY / max).toFixed(4));
};
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();

if (!reducedMotion) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 4.5}deg) rotateY(${x * 5.5}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * .08}px, ${y * .12}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

window.addEventListener('load', () => {
  window.setTimeout(() => document.getElementById('boot')?.classList.add('hide'), reducedMotion ? 50 : 650);
});
window.setTimeout(() => document.getElementById('boot')?.classList.add('hide'), 1800);

// Premium motion layer: pointer light, image parallax and staged reveals.
if (!reducedMotion) {
  const orb = document.createElement('div');
  orb.className = 'cursor-orb';
  document.body.appendChild(orb);

  let ox = innerWidth * .75, oy = innerHeight * .25;
  let tx = ox, ty = oy;
  const follow = () => {
    ox += (tx - ox) * .075;
    oy += (ty - oy) * .075;
    orb.style.transform = `translate3d(${ox}px,${oy}px,0)`;
    requestAnimationFrame(follow);
  };
  follow();

  window.addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    document.body.style.setProperty('--mx', `${(e.clientX / innerWidth) * 100}%`);
    document.body.style.setProperty('--my', `${(e.clientY / innerHeight) * 100}%`);

    const hx = (e.clientX / innerWidth - .5) * -10;
    const hy = (e.clientY / innerHeight - .5) * -7;
    document.documentElement.style.setProperty('--hero-x', `${hx}px`);
    document.documentElement.style.setProperty('--hero-y', `${hy}px`);
  }, { passive: true });

  document.querySelectorAll('.media-frame').forEach(frame => {
    frame.addEventListener('pointermove', e => {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      frame.style.setProperty('--fx', `${px * 100}%`);
      frame.style.setProperty('--fy', `${py * 100}%`);
      frame.style.setProperty('--img-x', `${(px - .5) * -10}px`);
      frame.style.setProperty('--img-y', `${(py - .5) * -7}px`);
    });
    frame.addEventListener('pointerleave', () => {
      frame.style.setProperty('--img-x', '0px');
      frame.style.setProperty('--img-y', '0px');
    });
  });

  document.querySelectorAll('.problem-grid div, .agent-list article, .benefit-grid article, .timeline article, .industry-cases span').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--gx', `${((e.clientX-r.left)/r.width)*100}%`);
      card.style.setProperty('--gy', `${((e.clientY-r.top)/r.height)*100}%`);
    });
  });

  sections.forEach(section => {
    [...section.querySelectorAll('.reveal')].forEach((el, i) => {
      el.style.setProperty('--delay', `${Math.min(i * 65, 320)}ms`);
    });
  });
}

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting && entry.intersectionRatio > .32));
}, { threshold: [0, .32, .62] });
sections.forEach(s => sectionObserver.observe(s));
