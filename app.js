const sections = [...document.querySelectorAll('.section')];
const nav = document.querySelector('.slide-nav');
const progress = document.querySelector('.progress span');

sections.forEach((section, index) => {
  const a = document.createElement('a');
  a.href = `#${section.id}`;
  a.setAttribute('aria-label', `Перейти к экрану ${index + 1}`);
  nav.appendChild(a);
});
const dots = [...nav.querySelectorAll('a')];

const revealItems = [...document.querySelectorAll('h1,h2,.lead,.copy,.wide-copy,.problem-grid,.media-frame,.agent-list,.benefit-grid,.timeline,.orbit,.principles,.feature-list,.industry-cases,.contact-panel,.button')];
revealItems.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
revealItems.forEach(el => io.observe(el));

const update = () => {
  const scrollY = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${Math.max(0, Math.min(100, (scrollY / max) * 100))}%`;

  let current = 0;
  sections.forEach((section, i) => {
    const top = section.offsetTop - window.innerHeight * 0.36;
    if (scrollY >= top) current = i;
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
};
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();
