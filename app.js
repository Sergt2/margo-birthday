/* Статистика общения в Telegram. */
const CHAT_STATS = { messages: 5800, voiceMessages: 355 };
const scenes = [...document.querySelectorAll('.scene')];
const progress = document.querySelector('.progress');
const next = document.getElementById('next');
const prev = document.getElementById('prev');
const story = document.querySelector('.story');
const dialog = document.getElementById('letter-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const nextLabels = ['Это моя волна', 'А дальше что?', 'Звучит как я', 'Хочу дальше', 'Где мой торт?', 'И ещё кое-что', 'Последний сюрприз', 'Ещё раз с самого начала'];
let current = 0;
let statsFrame;
const format = number => Math.round(number).toLocaleString('ru-RU');
const bars = scenes.map((scene, i) => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `${i + 1}. ${scene.dataset.label}`);
  button.addEventListener('click', () => go(i));
  progress.append(button);
  return button;
});
function animateStats() {
  cancelAnimationFrame(statsFrame);
  const start = performance.now();
  function tick(now) {
    const fraction = reducedMotion.matches ? 1 : Math.min((now - start) / 950, 1);
    const eased = 1 - (1 - fraction) ** 3;
    document.getElementById('messages-count').textContent = format(CHAT_STATS.messages * eased);
    document.getElementById('voice-count').textContent = format(CHAT_STATS.voiceMessages * eased);
    if (fraction < 1) statsFrame = requestAnimationFrame(tick);
  }
  statsFrame = requestAnimationFrame(tick);
}
function go(index) {
  if (index < 0 || index >= scenes.length || dialog.open) return;
  current = index;
  scenes.forEach((scene, i) => {
    scene.classList.toggle('active', i === index);
    scene.classList.toggle('past', i < index);
    scene.inert = i !== index;
    scene.setAttribute('aria-hidden', String(i !== index));
    bars[i].classList.toggle('done', i < index);
    bars[i].setAttribute('aria-current', String(i === index));
  });
  prev.disabled = index === 0;
  document.getElementById('next-text').textContent = nextLabels[index];
  document.getElementById('next-arrow').textContent = index === scenes.length - 1 ? '↻' : '↗';
  document.getElementById('position').textContent = `${String(index + 1).padStart(2, '0')} / 08`;
  document.getElementById('hint').textContent = index === 0 ? 'ЛИСТАЙ. УЛЫБАЙСЯ. ЭТО ТВОЁ.' : index === 7 ? 'С ЛЮБОВЬЮ. НА ПОВТОРЕ.' : 'СВАЙП ВЛЕВО — ИДЁМ ДАЛЬШЕ';
  document.querySelector('meta[name=theme-color]').content = scenes[index].dataset.color;
  if (index === 1) animateStats();
  else cancelAnimationFrame(statsFrame);
  if (index === 7) celebrate();
}
next.addEventListener('click', () => { if (current === scenes.length - 1) { resetCake(); go(0); } else go(current + 1); });
prev.addEventListener('click', () => go(current - 1));
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); go(0); });
document.addEventListener('keydown', e => {
  if (dialog.open || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
  if (e.key === 'Home') { e.preventDefault(); go(0); }
  if (e.key === 'End') { e.preventDefault(); go(scenes.length - 1); }
});
let touchStart = null;
story.addEventListener('touchstart', e => {
  if (e.touches.length !== 1 || e.target.closest('button,a,dialog')) { touchStart = null; return; }
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
story.addEventListener('touchend', e => {
  if (!touchStart || dialog.open || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });
story.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
const nameDetails = ['Самая сладкая. Даже без сахара.', 'Мелкая — только в прозвище. В сердце — огромная.', 'Имя, от которого становится теплее.'];
document.querySelectorAll('[data-name]').forEach(button => {
  const small = button.querySelector('small');
  const initial = small.textContent;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    small.textContent = expanded ? nameDetails[Number(button.dataset.name)] : initial;
  });
});
const compliments = ['Мелкая, а сколько в тебе всего прекрасного.', 'Ты как любимая песня. Хочется ещё раз.', 'Морковка, с тобой даже обычный вторник — событие.', 'Твоей улыбке нужен отдельный фан-клуб.', 'Маргоша, ты — причина улыбнуться прямо сейчас.', 'Уровень очарования: игра сломалась.'];
let complimentIndex = 0;
document.getElementById('another').addEventListener('click', () => {
  complimentIndex = (complimentIndex + 1) % compliments.length;
  const el = document.getElementById('compliment');
  el.textContent = compliments[complimentIndex];
  el.classList.remove('switching');
  void el.offsetWidth;
  el.classList.add('switching');
  document.getElementById('track-number').textContent = `${String(complimentIndex + 1).padStart(2, '0')} / 06`;
});
const particles = document.createElement('div');
particles.className = 'confetti-layer';
particles.setAttribute('aria-hidden', 'true');
story.append(particles);
let cleanupParticles;
function celebrate() {
  if (reducedMotion.matches) return;
  clearTimeout(cleanupParticles);
  particles.replaceChildren();
  for (let i = 0; i < 34; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.textContent = ['♡', '✦', '✧', '🥕', '💖'][i % 5];
    piece.style.left = Math.random() * 100 + '%';
    piece.style.color = ['#f8f3b5', '#ec6d9b', '#7152b5', '#d1f372'][i % 4];
    piece.style.setProperty('--drift', (Math.random() - .5) * 130 + 'px');
    piece.style.animationDelay = Math.random() * .45 + 's';
    particles.append(piece);
  }
  cleanupParticles = setTimeout(() => particles.replaceChildren(), 3300);
}
let blown = false;
const cake = document.querySelector('.cake');
const blow = document.getElementById('blow');
function resetCake() {
  blown = false;
  cake.classList.remove('blown');
  cake.setAttribute('aria-label', 'Розовый торт с тремя горящими свечами');
  blow.innerHTML = 'Задуть свечи <span>✧</span>';
  document.getElementById('wish-status').textContent = 'Вдох. Выдох. И пусть сбывается.';
}
blow.addEventListener('click', () => {
  if (blown) { resetCake(); return; }
  blown = true;
  cake.classList.add('blown');
  cake.setAttribute('aria-label', 'Розовый торт. Все три свечи погашены.');
  blow.innerHTML = 'Ещё одно желание? <span>↻</span>';
  document.getElementById('wish-status').textContent = 'Желание отправлено во Вселенную. Пусть сбудется! ♡';
  celebrate();
});
function openLetter() { dialog.showModal(); document.querySelector('.letter-scroll').scrollTop = 0; }
document.getElementById('envelope').addEventListener('click', openLetter);
document.getElementById('open-letter').addEventListener('click', openLetter);
document.getElementById('close-letter').addEventListener('click', () => dialog.close());
document.getElementById('letter-done').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
go(0);
