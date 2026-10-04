const viewer = document.querySelector('#room');
const buttons = ['reset', 'rotate', 'animation'].map(id => document.getElementById(id));
const loading = document.querySelector('#loading');
const error = document.querySelector('#error');
const telegram = window.Telegram?.WebApp;
if (telegram) {
  telegram.ready(); telegram.expand();
  try { telegram.setHeaderColor('#071326'); telegram.setBackgroundColor('#071326'); } catch {}
  if (telegram.isVersionAtLeast?.('7.7')) telegram.disableVerticalSwipes?.();
}
let animationEnabled = true;
const haptic = () => telegram?.HapticFeedback?.selectionChanged?.();
viewer.addEventListener('progress', event => {
  const value = Math.min(100, Math.round(event.detail.totalProgress * 100));
  document.querySelector('#progress').style.width = `${value}%`;
  document.querySelector('#loading-label').textContent = value < 100 ? `Загружаем комнату… ${value}%` : 'Подготавливаем 3D…';
});
viewer.addEventListener('load', () => {
  loading.hidden = true; error.hidden = true;
  buttons.forEach(button => { button.disabled = false; });
  if (animationEnabled) viewer.play();
});
function showError() { loading.hidden = true; error.hidden = false; buttons.forEach(button => { button.disabled = true; }); }
viewer.addEventListener('error', showError);
customElements.whenDefined('model-viewer').catch(showError);
setTimeout(() => { if (!customElements.get('model-viewer')) showError(); }, 20000);
document.querySelector('#retry').addEventListener('click', () => location.reload());
document.querySelector('#reset').addEventListener('click', () => {
  viewer.cameraTarget = 'auto auto auto'; viewer.cameraOrbit = '38deg 62deg auto'; viewer.fieldOfView = '38deg';
  viewer.resetTurntableRotation(); viewer.autoRotate = false;
  document.querySelector('#rotate').setAttribute('aria-pressed', 'false'); haptic();
});
document.querySelector('#rotate').addEventListener('click', event => {
  viewer.autoRotate = !viewer.autoRotate;
  event.currentTarget.setAttribute('aria-pressed', String(viewer.autoRotate)); haptic();
});
document.querySelector('#animation').addEventListener('click', event => {
  animationEnabled = !animationEnabled;
  if (animationEnabled) viewer.play(); else viewer.pause();
  event.currentTarget.setAttribute('aria-pressed', String(animationEnabled)); haptic();
});
viewer.addEventListener('camera-change', event => {
  if (event.detail.source === 'user-interaction') document.querySelector('#hint').classList.add('hide');
});
document.addEventListener('visibilitychange', () => {
  if (!viewer.loaded) return;
  if (document.hidden) viewer.pause(); else if (animationEnabled) viewer.play();
});
