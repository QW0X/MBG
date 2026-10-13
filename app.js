const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const MOSCOW_CENTER = [55.751244, 37.618423];
// Approximate city viewing bounds to keep the prototype focused on Moscow.
const MOSCOW_BOUNDS = L.latLngBounds([55.45, 36.85], [56.05, 37.95]);
const mapStatus = document.getElementById('mapStatus');
let userMarker = null;

const map = L.map('map', {
  center: MOSCOW_CENTER,
  zoom: 11,
  minZoom: 9,
  maxZoom: 18,
  maxBounds: MOSCOW_BOUNDS,
  maxBoundsViscosity: 0.85,
  zoomControl: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
  maxZoom: 19
}).addTo(map);

map.whenReady(() => {
  mapStatus.textContent = 'Москва · карта загружена';
  setTimeout(() => { mapStatus.classList.add('hidden'); }, 2800);
});
map.on('tileerror', () => {
  mapStatus.textContent = 'Не удалось загрузить карту. Проверьте подключение к интернету.';
  mapStatus.classList.remove('hidden');
});

function pop(title, message) {
  if (tg?.showPopup) tg.showPopup({ title, message, buttons: [{ type: 'ok' }] });
  else window.alert(`${title}\n\n${message}`);
}

document.getElementById('route').onclick = () => pop(
  'Безопасный маршрут',
  'Настоящая карта Москвы уже подключена. Для расчёта безопасного маршрута следующим шагом добавим выбор точки назначения и подключим сервис маршрутизации и проверенные данные о рисках.'
);

document.getElementById('location').onclick = () => {
  if (!navigator.geolocation) {
    pop('Местоположение', 'Этот браузер не поддерживает определение геопозиции.');
    return;
  }
  mapStatus.textContent = 'Запрашиваем разрешение на геопозицию…';
  mapStatus.classList.remove('hidden');
  navigator.geolocation.getCurrentPosition(position => {
    const latlng = [position.coords.latitude, position.coords.longitude];
    if (!MOSCOW_BOUNDS.contains(latlng)) {
      mapStatus.textContent = 'Вы находитесь за пределами отображаемой области Москвы.';
      return;
    }
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(latlng).addTo(map).bindPopup('Ваше местоположение').openPopup();
    map.setView(latlng, 15);
    mapStatus.textContent = 'Ваше местоположение отмечено на карте';
  }, error => {
    const msg = error.code === 1 ? 'Вы не разрешили доступ к геопозиции.' : 'Не удалось определить местоположение. Проверьте настройки устройства и попробуйте ещё раз.';
    mapStatus.textContent = msg;
    mapStatus.classList.remove('hidden');
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
};

document.getElementById('report').onclick = () => pop(
  'Сообщить о проблеме',
  'Пока сообщения не отправляются на сервер. Следующим этапом можно добавить форму с категорией проблемы, точкой на карте, описанием и отправкой на проверку.'
);
document.getElementById('navRoute').onclick = () => document.getElementById('route').click();
document.getElementById('navReport').onclick = () => document.getElementById('report').click();
document.getElementById('navMap').onclick = () => map.setView(MOSCOW_CENTER, 11);
document.getElementById('navInfo').onclick = () => pop('Обстановка', 'Проверенные данные об экологической и оперативной обстановке пока не подключены. Мы не показываем вымышленные зоны риска.');
