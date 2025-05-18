// src/pages/HotelDetail.js
import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotels } from '../data/hotels';
import BookingModal from '../components/BookingModal';
import { DateRange } from 'react-date-range';
import { ru } from 'date-fns/locale';
import jsPDF from 'jspdf'; // npm i jspdf
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const featuresList = [
  { key: 'wifi',      label: 'Бесплатный Wi-Fi',    icon: '📶' },
  { key: 'breakfast', label: 'Завтрак включён',     icon: '🍳' },
  { key: 'parking',   label: 'Бесплатная парковка', icon: '🅿️' },
  { key: 'bar',       label: 'Бар',                 icon: '🍸' },
  { key: 'restaurant',label: 'Ресторан',            icon: '🍽️' },
  { key: 'fitness',   label: 'Фитнес-центр',        icon: '🏋️' },
  { key: 'spa',       label: 'Спа',                 icon: '💆' },
  { key: 'pool',      label: 'Бассейн',             icon: '🏊' },
];

export default function HotelDetail({ onCopy }) {
  const { id } = useParams();
  const hotel = hotels.find(h => h.id === +id);
  const navigate = useNavigate();
  const roomsRef = useRef();
  const reviewsRef = useRef();

  const [modal, setModal] = useState({ open: false, roomType: '', total: 0 });
  const [imgIdx, setImgIdx] = useState(0);

  // DateRange календарь
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [dateRange, setDateRange] = useState([{ startDate: today, endDate: tomorrow, key: 'selection' }]);
  const [showCalendar, setShowCalendar] = useState(false);

  const [guests, setGuests] = useState(1);
  const [showCopied, setShowCopied] = useState(false);

  // Для BookingModal
  const start = useMemo(() => dateRange[0].startDate.toISOString().slice(0, 10), [dateRange]);
  const end = useMemo(() => dateRange[0].endDate.toISOString().slice(0, 10), [dateRange]);
  const nights = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [dateRange]);

  async function handleBook(data, needPDF = false) {
    try {
      if (needPDF) {
        generatePDF(hotel, modal.roomType, modal.total, dateRange, guests, data);
      }
      alert(
        `Бронирование подтверждено!\n\n` +
        `Отель: ${hotel.name}\n` +
        `Тип номера: ${modal.roomType}\n` +
        `Сумма: ${modal.total}$\n` +
        `Даты: ${start} — ${end}\n` +
        `Гостей: ${guests}\n` +
        `Имя: ${data.name}\n` +
        `Тел: ${data.phone}` +
        (needPDF ? '\n\nPDF сохранён!' : '')
      );
      setModal({ open: false, roomType: '', total: 0 });
    } catch (e) {
      alert("Ошибка бронирования: " + e.message);
    }
  }

  // PDF генератор — только на английском!
  function generatePDF(hotel, roomType, total, dateRange, guests, data = {}) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Booking Confirmation", 20, 20);
    doc.setFontSize(12);
    doc.text(`Hotel: ${hotel.name}`, 20, 40);
    doc.text(`Address: ${hotel.address}`, 20, 50);
    doc.text(`Room type: ${roomType}`, 20, 60);
    doc.text(
      `Dates: ${dateRange[0].startDate.toLocaleDateString('en-GB')} - ${dateRange[0].endDate.toLocaleDateString('en-GB')}`,
      20, 70
    );
    doc.text(`Guests: ${guests}`, 20, 80);
    doc.text(`Total: ${total}$`, 20, 90);
    doc.text(`Name: ${data.name || '-'}`, 20, 100);
    doc.text(`Phone: ${data.phone || '-'}`, 20, 110);
    doc.text(`Created: ${new Date().toLocaleString('en-GB')}`, 20, 120);
    doc.save("booking-confirmation.pdf");
  }

  if (!hotel) return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-900 text-2xl text-white font-bold">
      Отель не найден
    </div>
  );

  const actualFeatures = featuresList.filter(f => hotel[f.key]);
  const avgRating = hotel.reviewsList?.length
    ? (hotel.reviewsList.reduce((sum, r) => sum + r.rating, 0) / hotel.reviewsList.length).toFixed(1)
    : null;

  function handleCopyAddress(addr) {
    navigator.clipboard.writeText(addr || '');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1100);
    if (typeof onCopy === 'function') onCopy(addr);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `Отель: ${hotel.name}\nАдрес: ${hotel.address}\nЦена от ${hotel.price}$`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyAddress(window.location.href);
    }
  }

  function scrollToRooms() {
    setTimeout(() => {
      roomsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
  function scrollToReviews() {
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white flex flex-col font-sans">
      {/* Кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 bg-yellow-400/90 hover:bg-yellow-300 text-black font-bold px-4 py-2 rounded-full shadow-2xl text-lg transition md:flex hidden"
      >
        ← Назад
      </button>
      <div className="md:hidden mt-2 mb-2 px-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-yellow-400 font-bold text-lg"
        >
          ← Назад
        </button>
      </div>

      <div className="flex flex-col gap-5 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 w-full">
        {/* Заголовок и кнопки */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">{hotel.name}</h1>
          <div className="flex gap-2">
            <button
              className="bg-yellow-400/80 text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-400 shadow transition active:scale-95"
              onClick={handleShare}
            >Поделиться</button>
            <span className="bg-pink-600/90 text-xs font-bold rounded-xl py-2 px-3 ml-2 select-none shadow">Гарантия лучшей цены</span>
          </div>
        </div>
        {/* Средний рейтинг и отзывы */}
        {avgRating && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {Array.from({ length: Math.round(avgRating) }).map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            <span className="ml-2">({avgRating})</span>
            <button
              className="ml-2 text-yellow-400 underline text-xs hover:text-yellow-300"
              onClick={scrollToReviews}
            >
              отзывы
            </button>
            <span className="ml-2 text-white/80">{hotel.reviewsList.length} шт.</span>
          </div>
        )}

        {/* Фото-слайдер */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-48 sm:h-64 md:h-80 mb-6 flex items-end select-none">
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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xl transition active:scale-90"
                aria-label="Назад"
              >‹</button>
              <button
                onClick={() => setImgIdx(i => i === hotel.images.length - 1 ? 0 : i + 1)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-xl transition active:scale-90"
                aria-label="Вперёд"
              >›</button>
            </>
          )}
          {hotel.images?.length > 1 && (
            <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 flex gap-2 sm:gap-3 z-20">
              {hotel.images.map((src, idx) => (
                <button
                  key={src}
                  className={`w-12 sm:w-16 h-8 sm:h-12 rounded-lg overflow-hidden border-2 transition duration-300 
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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-extrabold text-yellow-400">Описание</h2>
            <p className="text-base leading-relaxed">{hotel.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {actualFeatures.map(f => (
                <span key={f.key} className="flex items-center gap-1 bg-white/15 px-3 py-1 rounded-lg text-sm font-semibold">
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
                onClick={() => handleCopyAddress(hotel.address || '')}
                type="button"
              >копировать</button>
            </div>
            <div className="flex items-center gap-2 text-sm"><span>👥</span> {hotel.reviews || 0} отзывов</div>
          </div>
        </section>

        {/* Уведомление о копировании */}
        {showCopied && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[1100] bg-yellow-400 text-black px-8 py-3 rounded-2xl shadow-lg font-semibold text-base">
            Скопировано!
          </div>
        )}

        {/* Даты и гости (с DateRange календарём) */}
        <section className="rounded-2xl bg-white/5 p-4 flex flex-wrap gap-3 items-center mb-4 shadow-lg">
          <h2 className="w-full text-lg font-semibold text-yellow-400 mb-2">Выберите даты и гостей</h2>
          <button
            onClick={() => setShowCalendar(true)}
            className="px-4 py-2 bg-yellow-400/90 hover:bg-yellow-500 rounded-xl text-black font-semibold shadow transition-all"
          >
            📅 {dateRange[0].startDate.toLocaleDateString()} — {dateRange[0].endDate.toLocaleDateString()}
          </button>
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
        {/* Календарь pop-up */}
        {showCalendar && (
          <>
            <div className="fixed inset-0 z-[999] bg-black/60" onClick={() => setShowCalendar(false)} />
            <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto bg-zinc-900 rounded-2xl shadow-2xl p-6 w-[95vw] max-w-md mx-auto">
                <DateRange
                  ranges={dateRange}
                  onChange={item => setDateRange([item.selection])}
                  minDate={today}
                  locale={ru}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  showDateDisplay={false}
                  rangeColors={['#facc15']}
                />
                <button
                  onClick={() => setShowCalendar(false)}
                  className="mt-4 w-full px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold shadow hover:bg-yellow-300 text-base transition"
                >
                  ОК
                </button>
              </div>
            </div>
          </>
        )}

        {/* Кнопка к номерам и отзывам */}
        <div className="flex gap-3 flex-wrap justify-end mb-3">
          <button
            className="px-5 py-2 bg-yellow-400/90 hover:bg-yellow-500 rounded-xl font-bold text-black text-sm shadow transition active:scale-95"
            onClick={scrollToRooms}
          >К номерам ↓</button>
          <button
            className="px-5 py-2 bg-yellow-400/60 hover:bg-yellow-400 rounded-xl font-bold text-black text-sm shadow transition active:scale-95"
            onClick={scrollToReviews}
          >К отзывам ↓</button>
        </div>

        {/* Список номеров */}
        <section ref={roomsRef}>
          <h2 className="text-xl font-extrabold text-yellow-400 mb-4">Номера</h2>
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
                    <h3 className="text-lg font-bold">{type} номер</h3>
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
          <section className="mt-8" ref={reviewsRef}>
            <h2 className="text-xl font-extrabold text-yellow-400 mb-4">Отзывы гостей</h2>
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
      {/* Модалка — прокидываем PDF-функцию */}
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
        onPDF={(data) => generatePDF(hotel, modal.roomType, modal.total, dateRange, guests, data)}
      />
    </div>
  );
}
