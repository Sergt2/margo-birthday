const scenes = [...document.querySelectorAll('.scene')];
const progress = document.querySelector('.progress');
const next = document.getElementById('next');
const prev = document.getElementById('prev');
const story = document.querySelector('.story');
const dialog = document.getElementById('letter-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const nextLabels = ['Начать праздник', 'Дальше — комплименты', 'К пожеланиям', 'Загадать желание', 'Ещё один сюрприз', 'А теперь — письмо', 'К финалу', 'Посмотреть ещё раз'];
let current = 0;
const bars = scenes.map((scene, i) => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', `${i + 1}. ${scene.dataset.label}`);
  button.addEventListener('click', () => go(i));
  progress.append(button);
  return button;
});
function go(index) {
  if (index < 0 || index >= scenes.length || document.querySelector('dialog[open]')) return;
  if (scenes[index].dataset.label !== 'Селфи на память') stopCamera();
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
  document.getElementById('position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
  document.getElementById('hint').textContent = index === 0 ? 'ЛИСТАЙ. УЛЫБАЙСЯ. ЭТО ТВОЁ.' : index === scenes.length - 1 ? 'С ЛЮБОВЬЮ. НА ПОВТОРЕ.' : 'СВАЙП ВЛЕВО — ИДЁМ ДАЛЬШЕ';
  document.querySelector('meta[name=theme-color]').content = scenes[index].dataset.color;
  if (index === scenes.length - 1) celebrate();
}
next.addEventListener('click', () => { if (current === scenes.length - 1) { resetCake(); go(0); } else go(current + 1); });
prev.addEventListener('click', () => go(current - 1));
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); go(0); });
document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || e.altKey || e.ctrlKey || e.metaKey) return;
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
  if (!touchStart || document.querySelector('dialog[open]') || !e.changedTouches.length) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) go(current + (dx < 0 ? 1 : -1));
}, { passive: true });
story.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
const nameDetails = ['Самая сладкая. Даже без сахара.', 'Мелкая — только в прозвище. Мечты — большие.', 'Имя, от которого становится теплее.'];
document.querySelectorAll('[data-name]').forEach(button => {
  const small = button.querySelector('small');
  const initial = small.textContent;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    small.textContent = expanded ? nameDetails[Number(button.dataset.name)] : initial;
  });
});
const compliments = ['Мелкая, а сколько в тебе всего прекрасного.', 'Твоя энергия заряжает лучше любимой песни.', 'Морковка, ты превращаешь будни в праздник.', 'Твоей улыбке нужен отдельный фан-клуб.', 'Маргоша, твоя улыбка — отдельный вид волшебства.', 'Уровень очарования: игра сломалась.'];
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
    piece.innerHTML = ['♡', '<svg class="decor-icon decor-icon-solid" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M12 1c1.6 7.3 3.7 9.4 11 11-7.3 1.6-9.4 3.7-11 11C10.4 15.7 8.3 13.6 1 12 8.3 10.4 10.4 8.3 12 1Z"/></svg>', '<svg class="decor-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M12 2C13.4 8.6 15.4 10.6 22 12c-6.6 1.4-8.6 3.4-10 10C10.6 15.4 8.6 13.4 2 12c6.6-1.4 8.6-3.4 10-10Z"/></svg>', '🥕', '💖'][i % 5];
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
  blow.innerHTML = 'Задуть свечи <span><svg class="decor-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path d="M12 2C13.4 8.6 15.4 10.6 22 12c-6.6 1.4-8.6 3.4-10 10C10.6 15.4 8.6 13.4 2 12c6.6-1.4 8.6-3.4 10-10Z"/></svg></span>';
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
// Селфи обрабатывается только в браузере и никуда не отправляется.
const cameraStart = document.getElementById('camera-start');
const cameraShoot = document.getElementById('camera-shoot');
const photoFilter = document.getElementById('selfie-filter');
const photoRetake = document.getElementById('photo-retake');
const photoSave = document.getElementById('photo-save');
const video = document.getElementById('selfie-video');
const photo = document.getElementById('selfie-photo');
const cameraStatus = document.getElementById('camera-status');
const filterDialog = document.getElementById('filter-dialog');
let cameraStream = null;
let cameraRequest = 0;
let photoURL = null;
function updateSelfie() {
  const live = !!cameraStream;
  video.hidden = !live;
  photo.hidden = live || !photoURL;
  document.querySelector('.selfie-placeholder').hidden = live || !!photoURL;
  cameraStart.hidden = live || !!photoURL;
  cameraShoot.hidden = !live;
  photoFilter.hidden = live || !photoURL;
  photoSave.hidden = live || !photoURL;
  photoRetake.hidden = live || !photoURL;
  cameraStart.disabled = false;
}
function stopCamera() {
  cameraRequest++;
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
  cameraStream = null;
  video.srcObject = null;
  updateSelfie();
}
async function startCamera() {
  stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraStatus.textContent = 'Камера недоступна. Открой сайт в Safari на iPhone и попробуй ещё раз.';
    return;
  }
  const request = cameraRequest;
  cameraStart.disabled = true;
  cameraStatus.textContent = 'Разреши камеру — время для твоей улыбки.';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1200},height:{ideal:1600}},audio:false});
    if (request !== cameraRequest || !document.querySelector('.selfie.active')) { stream.getTracks().forEach(track => track.stop()); return; }
    cameraStream = stream;
    video.srcObject = stream;
    updateSelfie();
    cameraShoot.disabled = true;
    await video.play();
    if (request !== cameraRequest) return;
    cameraShoot.disabled = false;
    cameraStatus.textContent = 'Вот она, твоя улыбка. Готова?';
  } catch (error) {
    if (request !== cameraRequest) return;
    stopCamera();
    cameraStatus.textContent = error.name === 'NotAllowedError' ? 'Разреши доступ к камере в настройках браузера и попробуй ещё раз.' : 'Не получилось открыть камеру. Попробуй ещё раз.';
  }
}
function setPhoto(blob) {
  if (photoURL) URL.revokeObjectURL(photoURL);
  photoURL = URL.createObjectURL(blob);
  photo.src = photoURL;
  stopCamera();
  cameraStatus.textContent = 'Есть! А может, добавить фильтр?';
}
cameraStart.addEventListener('click', startCamera);
photoRetake.addEventListener('click', startCamera);
cameraShoot.addEventListener('click', () => {
  if (!video.videoWidth || !cameraStream) return;
  const canvas = document.createElement('canvas');
  const ratio = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.round(video.videoWidth * ratio);
  canvas.height = Math.round(video.videoHeight * ratio);
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const request = cameraRequest;
  cameraShoot.disabled = true;
  canvas.toBlob(blob => {
    cameraShoot.disabled = false;
    if (request !== cameraRequest) return;
    if (blob) setPhoto(blob);
    else cameraStatus.textContent = 'Снимок не сохранился. Попробуй ещё раз.';
  }, 'image/jpeg', .93);
});
photoSave.addEventListener('click', () => {
  if (!photoURL) return;
  const link = document.createElement('a');
  link.href = photoURL;
  link.download = 'margosha-birthday.jpg';
  document.body.append(link);
  link.click();
  link.remove();
});
photoFilter.addEventListener('click', () => { if (photoURL) filterDialog.showModal(); });
document.getElementById('close-filter').addEventListener('click', () => filterDialog.close());
document.getElementById('filter-done').addEventListener('click', () => filterDialog.close());
filterDialog.addEventListener('click', e => {
  if (e.target !== filterDialog) return;
  const r = filterDialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) filterDialog.close();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) stopCamera(); });
window.addEventListener('pagehide', stopCamera);
go(0);
