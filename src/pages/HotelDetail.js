// src/pages/HotelDetail.js
import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hotels } from '../data/hotels';
import BookingModal from '../components/BookingModal';

// Копирование адреса
function copyToClipboard(str) {
  navigator.clipboard.writeText(str).then(() => alert('Адрес скопирован!'));
}

const featuresList = [
  { key: 'wifi',      label: 'Бесплатный Wi-Fi',    icon: '📶' },
  { key: 'breakfast', label: 'Завтрак включён',     icon: '🍳' },
  { key: 'parking',   label: 'Бесплатная парковка',  icon: '🅿️' },
  { key: 'bar',       label: 'Бар',                 icon: '🍸' },
  { key: 'restaurant',label: 'Ресторан',            icon: '🍽️' },
  { key: 'fitness',   label: 'Фитнес-центр',        icon: '🏋️' },
  { key: 'spa',       label: 'Спа',                 icon: '💆' },
  { key: 'pool',      label: 'Бассейн',             icon: '🏊' },
];

export default function HotelDetail() {
  const { id } = useParams();
  const hotel = hotels.find(h => h.id === +id);
  const navigate = useNavigate();
  const roomsRef = useRef();

  // Модалка бронирования
  const [modal, setModal] = useState({ open: false, roomType: '', total: 0 });

  const [imgIdx, setImgIdx] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tmr.toISOString().slice(0, 10));
  const [guests, setGuests] = useState(1);

  // Количество ночей
  const nights = useMemo(() => {
    const d1 = new Date(start), d2 = new Date(end);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [start, end]);

  // Функция бронирования
  async function handleBook(data) {
    try {
      alert(
        `Бронирование подтверждено!\n\n` +
        `Отель: ${hotel.name}\n` +
        `Тип номера: ${modal.roomType}\n` +
        `Сумма: ${modal.total}$\n` +
        `Даты: ${start} — ${end}\n` +
        `Гостей: ${guests}\n` +
        `Имя: ${data.name}\n` +
        `Тел: ${data.phone}`
      );
      setModal({ open: false, roomType: '', total: 0 });
    } catch (e) {
      alert("Ошибка бронирования: " + e.message);
    }
  }

  if (!hotel) return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-900 text-2xl text-white font-bold">
      Отель не найден
    </div>
  );

  const actualFeatures = featuresList.filter(f => hotel[f.key]);

  function scrollToRooms() {
    setTimeout(() => {
      roomsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  // Средний рейтинг
  const avgRating = hotel.reviewsList?.length
    ? (hotel.reviewsList.reduce((sum, r) => sum + r.rating, 0) / hotel.reviewsList.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white flex flex-col font-sans">

      {/* Фиксированная кнопка Назад только на планшетах и десктопе */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex fixed top-4 left-4 z-50 bg-yellow-400/90 hover:bg-yellow-300 hover:-translate-x-1 active:scale-90 transition-all text-black font-bold px-4 py-2 rounded-full shadow-2xl text-lg"
      >
        ← Назад
      </button>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 w-full">

        {/* Вставка кнопки Назад для мобильных */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-yellow-400 font-bold text-lg"
          >
            ← Назад
          </button>
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">{hotel.name}</h1>

        {/* Средний рейтинг */}
        {avgRating && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {Array.from({ length: Math.round(avgRating) }).map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            <span className="ml-2">({avgRating})</span>
            <span className="ml-2 text-white/80">{hotel.reviewsList.length} отзывов</span>
          </div>
        )}

        {/* Кнопка скролла к номерам */}
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-yellow-400/90 hover:bg-yellow-500 active:scale-95 rounded-xl font-bold shadow-lg transition-all text-black text-sm sm:text-base"
            onClick={scrollToRooms}
          >
            Посмотреть номера ↓
          </button>
        </div>

        {/* Фото-слайдер */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-48 sm:h-64 md:h-80 lg:h-[420px] mb-6 flex items-end select-none">
          <img
            src={hotel.images?.[imgIdx] || hotel.images?.[0]}
            alt={hotel.name}
            className="absolute w-full h-full object-cover object-center transition-all duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {hotel.images?.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => i === 0 ? hotel.images.length - 1 : i - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xl transition-all duration-200 active:scale-90"
                aria-label="Назад"
              >‹</button>
              <button
                onClick={() => setImgIdx(i => i === hotel.images.length - 1 ? 0 : i + 1)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xl transition-all duration-200 active:scale-90"
                aria-label="Вперёд"
              >›</button>
            </>
          )}

          {hotel.images?.length > 1 && (
            <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 flex gap-2 sm:gap-3 z-20">
              {hotel.images.map((src, idx) => (
                <button
                  key={src}
                  className={`w-12 sm:w-16 h-8 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 
                    ${imgIdx === idx
                      ? 'border-yellow-400 scale-110 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                  onClick={() => setImgIdx(idx)}
                  aria-label={`Фотография ${idx + 1}`}
                >
                  <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {hotel.label && (
            <span className="absolute top-4 sm:top-5 left-4 sm:left-5 px-3 sm:px-5 py-1 sm:py-2 bg-pink-600/90 rounded-full font-bold text-xs uppercase shadow-lg">
              {hotel.label}
            </span>
          )}
        </div>

        {/* Описание и инфо */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-yellow-400">Описание</h2>
            <p className="text-base sm:text-lg leading-relaxed">{hotel.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {actualFeatures.map(f => (
                <span key={f.key}
                      className="flex items-center gap-1 bg-white/15 px-3 py-1 rounded-lg text-sm font-semibold">
                  <span className="text-lg">{f.icon}</span>{f.label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center gap-2 text-sm"><span>🕑</span> Заселение: <b>с 14:00</b></div>
            <div className="flex items-center gap-2 text-sm"><span>🚪</span> Выселение: <b>до 12:00</b></div>
            <div className="flex items-center gap-2 text-sm"><span>📍</span> Адрес:
              <span className="truncate max-w-[160px] ml-1">{hotel.address || 'Не указан'}</span>
              <button
                className="ml-1 text-yellow-400 underline text-xs"
                onClick={() => copyToClipboard(hotel.address || '')}
              >скопировать</button>
            </div>
            <div className="flex items-center gap-2 text-sm"><span>👥</span> {hotel.reviews || 0} отзывов</div>
          </div>
        </section>

        {/* Даты и гости */}
        <section className="rounded-2xl bg-white/5 p-4 flex flex-wrap gap-3 items-center mb-4 shadow-lg">
          <h2 className="w-full text-lg font-semibold text-yellow-400 mb-2">Выберите даты и гостей</h2>
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="px-3 py-1 rounded-lg bg-white/15 text-white text-sm focus:outline-yellow-400"
          />
          <span className="text-lg">→</span>
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="px-3 py-1 rounded-lg bg-white/15 text-white text-sm focus:outline-yellow-400"
          />
          <select
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            className="px-3 py-1 rounded-lg bg-white/15 text-white text-sm focus:outline-yellow-400"
          >
            <option value={1}>1 взрослый</option>
            <option value={2}>2 взрослых</option>
            <option value={3}>3 взрослых</option>
            <option value={4}>4 взрослых</option>
          </select>
          <div className="w-full text-white text-sm mt-2">
            Вы выбрали <b>{nights}</b> ночей × <b>{guests}</b> чел.
          </div>
        </section>

        {/* Список номеров */}
        <section ref={roomsRef}>
          <h2 className="text-xl sm:text-2xl font-extrabold text-yellow-400 mb-4">Номера</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Сингл', 'Дабл'].map((type, i) => {
              const price = type === 'Сингл' ? 50 : 80;
              const total = price * nights * guests;
              return (
                <div key={type}
                     className="rounded-2xl bg-white/10 shadow-xl flex flex-col overflow-hidden group hover:-translate-y-1 transition-transform">
                  <img
                    src={hotel.images?.[(i + 1) % hotel.images.length] || hotel.images[0]}
                    alt={type}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <h3 className="text-lg font-bold">{type} Room</h3>
                    <p className="text-sm">Цена: <b>{price}$</b> / ночь</p>
                    <p className="text-sm">
                      Итого: <b className="text-yellow-400">{total}$</b>
                    </p>
                    <button
                      onClick={() => setModal({ open: true, roomType: type, total })}
                      className="mt-2 bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:scale-105 transition-all text-sm"
                    >
                      Забронировать за {total}$
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Раздел отзывов */}
        {hotel.reviewsList && hotel.reviewsList.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-yellow-400 mb-4">Отзывы гостей</h2>
            <div className="flex flex-col gap-4">
              {hotel.reviewsList.map((r, idx) => (
                <div key={idx}
                     className="bg-white/5 rounded-xl p-4 flex gap-3 items-start shadow">
                  <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {r.user[0]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{r.user}</span>
                      <span className="text-yellow-400">★{r.rating}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/80">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Модальное окно бронирования */}
      <BookingModal
        open={modal.open}
        onClose={() => setModal({ open: false, roomType: '', total: 0 })}
        hotel={hotel}
        roomType={modal.roomType}
        total={modal.total}
        nights={nights}
        guests={guests}
        start={start}
        end={end}
        onBook={handleBook}
      />
    </div>
  );
}
