const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const MOSCOW_CENTER = [37.618423, 55.751244]; // Яндекс API использует [долгота, широта]
const mapStatus = document.getElementById('mapStatus');
let map = null;
let userMarker = null;

function setStatus(message, visible = true) {
  mapStatus.textContent = message;
  mapStatus.classList.toggle('hidden', !visible);
}

function pop(title, message) {
  if (tg?.showPopup) tg.showPopup({ title, message, buttons: [{ type: 'ok' }] });
  else window.alert(`${title}\n\n${message}`);
}

async function initMap() {
  try {
    if (!window.ymaps3) throw new Error('Не загрузился JavaScript API Яндекс Карт. Проверь ключ и интернет.');
    await ymaps3.ready;
    const { YMap, YMapDefaultSchemeLayer, YMapMarker } = ymaps3;
    map = new YMap(document.getElementById('map'), {
      location: { center: MOSCOW_CENTER, zoom: 11 }
    });
    map.addChild(new YMapDefaultSchemeLayer({}));
    setStatus('Москва · Яндекс Карты загружены');
    setTimeout(() => mapStatus.classList.add('hidden'), 3000);
    // Keep the marker constructor available for the location button if supported by this API build.
    map._YMapMarker = YMapMarker;
  } catch (error) {
    console.error(error);
    setStatus('Не удалось загрузить Яндекс Карту. Проверь API-ключ, его HTTP Referer и интернет.');
  }
}
initMap();

document.getElementById('route').onclick = () => pop(
  'Безопасный маршрут',
  'Яндекс Карта подключается отдельно от расчёта безопасного маршрута. На следующем этапе добавим выбор точки назначения и проверенные данные о рисках.'
);

document.getElementById('location').onclick = () => {
  if (!navigator.geolocation) {
    pop('Местоположение', 'Этот браузер не поддерживает определение геопозиции.');
    return;
  }
  setStatus('Запрашиваем разрешение на геопозицию…');
  navigator.geolocation.getCurrentPosition(position => {
    if (!map) { setStatus('Карта ещё загружается. Попробуй снова через несколько секунд.'); return; }
    const coordinates = [position.coords.longitude, position.coords.latitude];
    map.setLocation({ center: coordinates, zoom: 15, duration: 500 });
    setStatus('Карта перемещена к вашему местоположению');
  }, error => {
    const msg = error.code === 1 ? 'Вы не разрешили доступ к геопозиции.' : 'Не удалось определить местоположение. Проверь настройки устройства и попробуй ещё раз.';
    setStatus(msg);
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
};

document.getElementById('report').onclick = () => pop(
  'Сообщить о проблеме',
  'Пока сообщения не отправляются на сервер. Следующим этапом можно добавить форму с категорией проблемы, точкой на карте, описанием и отправкой на проверку.'
);
document.getElementById('navRoute').onclick = () => document.getElementById('route').click();
document.getElementById('navReport').onclick = () => document.getElementById('report').click();
document.getElementById('navMap').onclick = () => { if (map) map.setLocation({ center: MOSCOW_CENTER, zoom: 11, duration: 500 }); };
document.getElementById('navInfo').onclick = () => pop('Обстановка', 'Проверенные данные об экологической и оперативной обстановке пока не подключены. Мы не показываем вымышленные зоны риска.');
