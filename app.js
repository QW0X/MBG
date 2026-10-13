const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand();}
const demo=document.getElementById('demo'), mapEl=document.getElementById('map');
function demoMap(){mapEl.style.display='none';demo.style.display='block'}
demo.style.display='block';
async function initMap(){const s=document.querySelector('script[src*="api-maps.yandex.ru/v3"]')?.src||'';if(s.includes('YOUR_YANDEX_API_KEY'))return;try{await ymaps3.ready;const{YMap,YMapDefaultSchemeLayer}=ymaps3;const map=new YMap(mapEl,{location:{center:[37.6176,55.7558],zoom:11}});map.addChild(new YMapDefaultSchemeLayer());demo.style.display='none'}catch(e){demoMap()}}
initMap();
function pop(title,msg){tg?.showPopup?tg.showPopup({title,message:msg,buttons:[{type:'ok'}]}):alert(title+'\n\n'+msg)}
document.getElementById('route').onclick=()=>pop('Безопасный маршрут','В следующей версии выберем точку назначения и построим маршрут с учётом факторов риска, освещения и экологической обстановки.');
document.getElementById('location').onclick=()=>pop('Местоположение','В Telegram Mini App можно запросить геопозицию пользователя с его разрешения.');
document.getElementById('report').onclick=()=>pop('Сообщить о проблеме','Добавим форму: категория → точка на карте → описание → фото → отправка.');
document.getElementById('navRoute').onclick=()=>document.getElementById('route').click();
document.getElementById('navReport').onclick=()=>document.getElementById('report').click();