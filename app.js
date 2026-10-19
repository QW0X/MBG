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
  const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker
} = ymaps3;

map = new YMap(document.getElementById('map'), {
  location: { center: MOSCOW_CENTER, zoom: 11 }
});

map.addChild(new YMapDefaultSchemeLayer({}));
map.addChild(new YMapDefaultFeaturesLayer({}));
// Режим добавления пользовательских точек
let addingPoint = false;

const addPointButton = document.createElement('button');
addPointButton.textContent = '📍 Добавить точку';
addPointButton.style.cssText = `
  position: absolute;
  top: 80px;
  left: 12px;
  z-index: 1000;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  cursor: pointer;
`;

document.body.appendChild(addPointButton);
addPointButton.style.position = 'fixed';

addPointButton.onclick = () => {
  addingPoint = !addingPoint;
  addPointButton.textContent = addingPoint
    ? '✖ Отменить добавление'
    : '📍 Добавить точку';
};
map.addChild(
  new ymaps3.YMapListener({
    onClick: (object, event) => {
      if (!addingPoint) return;

      const coordinates = event.coordinates;
      if (!coordinates) return;

      const name = prompt('Название новой точки:');
if (!name) return;

const category = prompt(
  'Выбери категорию, введя номер:\n' +
  '1 — Благоприятная зона\n' +
  '2 — Повышенный шум\n' +
  '3 — Экологическая проблема\n' +
  '4 — Потенциально опасный участок'
);

const categories = {
  '1': { name: 'Благоприятная зона', color: '#22c55e' },
  '2': { name: 'Повышенный шум', color: '#f59e0b' },
  '3': { name: 'Экологическая проблема', color: '#ef4444' },
  '4': { name: 'Потенциально опасный участок', color: '#7c3aed' }
};

const selectedCategory = categories[category];
if (!selectedCategory) {
  alert('Введи число от 1 до 4.');
  return;
}

const description = prompt('Добавь описание точки:') || 'Описание не указано.';

      const markerElement = document.createElement('button');
      markerElement.type = 'button';
      markerElement.title = name;
      markerElement.setAttribute(
  'aria-label',
  `${name} — ${selectedCategory.name}`
);
      markerElement.style.cssText = `
        width: 24px;
        height: 24px;
        border: 3px solid white;
        border-radius: 50%;
        background: ${selectedCategory.color};
        box-shadow: 0 2px 8px #0005;
        cursor: pointer;
      `;

    markerElement.onclick = () => {
  pop(
    name + ' — ' + selectedCategory.name,
    description + ' Координаты: ' +
      coordinates[0].toFixed(5) + ', ' +
      coordinates[1].toFixed(5)
  );
};

map.addChild(
  new ymaps3.YMapMarker(
    { coordinates },
    markerElement
  )
);

addingPoint = false;
addPointButton.textContent = '📍 Добавить точку';    
    }
  })
);
// Демонстрационные экологические зоны.
// Это НЕ реальные измерения загрязнения.
const demoZones = [
  {
    name: 'Пример благоприятной зоны',
    coordinates: [37.62, 55.75],
    color: '#22a06b'
  },
  {
    name: 'Пример зоны для проверки',
    coordinates: [37.66, 55.76],
    color: '#e99b25'
  },
  {
    name: 'Тестовая точка экологического внимания',
    coordinates: [37.59, 55.74],
    color: '#d94b4b'
  }
];

demoZones.forEach(zone => {
  const markerElement = document.createElement('button');
  markerElement.type = 'button';
  markerElement.title = zone.name;
  markerElement.setAttribute('aria-label', zone.name);
  markerElement.style.cssText = `
    width: 24px;
    height: 24px;
    border: 3px solid white;
    border-radius: 50%;
    background: ${zone.color};
    box-shadow: 0 2px 8px #0005;
    cursor: pointer;
  `;

 markerElement.onclick = () => {
  const descriptions = {
    'Чистая зона': '🟢 Условно благоприятная зона. Данные демонстрационные.',
    'Повышенный шум': '🟠 Возможен повышенный уровень шума. Данные демонстрационные.',
    'Экологический риск': '🔴 Возможный экологический риск. Данные демонстрационные.'
  };

  pop(
    zone.name,
    descriptions[zone.name] || 'Демонстрационная зона. Проверенные данные пока не подключены.'
  );
};

  const marker = new YMapMarker(
    { coordinates: zone.coordinates },
    markerElement
  );

  map.addChild(marker);
});
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
