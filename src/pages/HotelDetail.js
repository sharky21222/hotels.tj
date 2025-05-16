import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hotels } from '../data/hotels';
import BookingModal from '../components/BookingModal';

// Копирование адреса
function copyToClipboard(str) {
  navigator.clipboard.writeText(str).then(() => alert('Адрес скопирован!'));
}

const featuresList = [
  { key: 'wifi',        label: 'Бесплатный Wi-Fi',       icon: '📶' },
  { key: 'breakfast',   label: 'Завтрак включён',        icon: '🍳' },
  { key: 'parking',     label: 'Бесплатная парковка',    icon: '🅿️' },
  { key: 'bar',         label: 'Бар',                    icon: '🍸' },
  { key: 'restaurant',  label: 'Ресторан',               icon: '🍽️' },
  { key: 'fitness',     label: 'Фитнес-центр',           icon: '🏋️' },
  { key: 'spa',         label: 'Спа',                    icon: '💆' },
  { key: 'pool',        label: 'Бассейн',                icon: '🏊' },
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
  const tmr = new Date(); 
  tmr.setDate(tmr.getDate() + 1);

  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tmr.toISOString().slice(0, 10));
  const [guests, setGuests] = useState(1);

  // nights — вынесен из функции handleBook
  const nights = useMemo(() => {
    const d1 = new Date(start), d2 = new Date(end);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [start, end]);

  // handleBook — ФУНКЦИЯ бронирования
  async function handleBook(data) {
    try {
      alert(
        `Бронирование подтверждено!\n` +
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

  // ✅ Скроллим вверх при загрузке страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white flex flex-col font-sans">
      {/* Кнопка "Назад" */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 z-50 bg-yellow-400/90 hover:bg-yellow-300 active:scale-90 transition-all text-black font-bold px-6 py-2 rounded-full shadow-2xl text-xl"
        style={{ minWidth: 100, boxShadow: '0 2px 24px 2px #ffbb3366', letterSpacing: 2 }}
      >
        <span className="inline-block text-2xl">←</span>
        <span className="ml-3 font-bold text-lg">Назад</span>
      </button>

      <div className="flex flex-col gap-8 max-w-5xl mx-auto px-4 py-10 md:py-16 w-full">
        {/* Кнопка скролла к номерам */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="md:hidden text-yellow-400 hover:underline text-base transition-colors">← На главную</Link>
          <button
            className="ml-auto px-7 py-2 bg-yellow-400/90 hover:bg-yellow-500 active:scale-95 rounded-xl font-bold shadow-lg transition-all text-black"
            onClick={scrollToRooms}
            style={{ fontSize: 18, letterSpacing: 1, boxShadow: '0 3px 18px 2px #ffbb3380' }}
          >
            Посмотреть номера ↓
          </button>
        </div>

        {/* Фото-слайдер */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[420px] mb-8 flex items-end select-none">
          <img
            src={hotel.images?.[imgIdx] || hotel.images?.[0]}
            alt={hotel.name}
            className="absolute w-full h-full object-cover object-center transition-all duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Навигация по фото */}
          {hotel.images && hotel.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => i === 0 ? hotel.images.length - 1 : i - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 hover:text-black text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl shadow transition-all duration-200 active:scale-90"
                aria-label="Назад"
              >‹</button>
              <button
                onClick={() => setImgIdx(i => i === hotel.images.length - 1 ? 0 : i + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-400/80 hover:text-black text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl shadow transition-all duration-200 active:scale-90"
                aria-label="Вперёд"
              >›</button>
            </>
          )}

          {/* Превью фото */}
          {hotel.images && hotel.images.length > 1 && (
            <div className="absolute left-6 bottom-6 flex gap-3 z-20">
              {hotel.images.map((src, idx) => (
                <button
                  key={src}
                  className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 
                    ${imgIdx === idx
                      ? 'border-yellow-400 scale-110 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                  onClick={() => setImgIdx(idx)}
                  tabIndex={0}
                  aria-label={`Фотография ${idx + 1}`}
                >
                  <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Лейбл отеля */}
          {hotel.label && (
            <span className="absolute top-5 left-5 px-5 py-1 bg-pink-600/90 rounded-full font-bold text-sm uppercase shadow-lg">
              {hotel.label}
            </span>
          )}
        </div>

        {/* Блок описание и инфо */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 flex flex-col gap-6">
            <h2 className="text-2xl font-extrabold text-yellow-400 mb-1">Описание</h2>
            <p className="text-white text-lg leading-relaxed">{hotel.description}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {actualFeatures.map(f => (
                <span key={f.key} className="inline-flex items-center gap-2 px-4 py-1 bg-white/15 rounded-xl text-base text-white/90 font-semibold shadow hover:bg-yellow-400/20 transition-all">
                  <span className="text-xl">{f.icon}</span>{f.label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-7 flex flex-col gap-4 shadow-xl min-h-[230px]">
            <div className="flex items-center gap-4 text-white/90"><span>🕑</span> Заселение: <b>с 14:00</b></div>
            <div className="flex items-center gap-4 text-white/90"><span>🚪</span> Выселение: <b>до 12:00</b></div>
            <div className="flex items-center gap-4 text-white/90"><span>📍</span> Адрес: 
              <span className="truncate max-w-[180px] inline-block">{hotel.address || 'Не указан'}</span>
              <button
                className="ml-2 text-yellow-400 underline underline-offset-2 text-sm hover:text-yellow-300 transition"
                onClick={() => copyToClipboard(hotel.address || '')}
                type="button"
              >скопировать</button>
            </div>
            <div className="flex items-center gap-4 text-white/90"><span>👥</span> {hotel.reviews || 34} отзывов</div>
          </div>
        </section>

        {/* Даты и гости */}
        <section className="rounded-2xl bg-white/5 p-8 flex flex-wrap gap-6 items-center mb-2 shadow-lg">
          <h2 className="text-xl font-semibold text-yellow-400 w-full mb-2">Выберите даты и гостей</h2>
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="px-6 py-2 rounded-lg bg-white/15 text-white focus:outline-yellow-400 transition-all"
          />
          <span className="text-2xl text-white">→</span>
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="px-6 py-2 rounded-lg bg-white/15 text-white focus:outline-yellow-400 transition-all"
          />
          <select
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            className="px-6 py-2 rounded-lg bg-white/15 text-white focus:outline-yellow-400 transition-all"
          >
            <option value={1}>1 взрослый</option>
            <option value={2}>2 взрослых</option>
            <option value={3}>3 взрослых</option>
            <option value={4}>4 взрослых</option>
          </select>
          <div className="w-full text-white text-base mt-2">
            Вы выбрали <b>{nights}</b> ночей × <b>{guests}</b> чел.
          </div>
        </section>

        {/* Список номеров */}
        <section ref={roomsRef}>
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-4">Номера</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {['Сингл', 'Дабл'].map((type, i) => {
              const price = type === 'Сингл' ? 50 : 80;
              const total = price * nights * guests;
              return (
                <div
                  key={type}
                  className="rounded-2xl bg-white/10 shadow-xl flex flex-col overflow-hidden group hover:-translate-y-2 hover:shadow-yellow-300/50 transition-transform duration-300"
                  style={{
                    minHeight: 330,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <img
                    src={hotel.images?.[(i + 1) % hotel.images.length] || hotel.images[0]}
                    alt={type}
                    className="w-full h-40 object-cover object-center"
                  />
                  <div className="flex flex-col gap-3 p-6 flex-1 justify-between">
                    <h3 className="text-xl font-bold text-white mb-1">{type} Room</h3>
                    <p className="text-white/90">Цена: <span className="font-bold text-yellow-400">{price}$</span> / ночь</p>
                    <p className="text-white/90">
                      Итого за <b>{nights}</b> ночей × {guests} чел = <span className="text-yellow-400 font-extrabold">{total}$</span>
                    </p>
                    <div className="mt-3 flex flex-col items-end">
                      <button
                        className="bg-yellow-400 text-black font-semibold px-7 py-3 rounded-xl hover:bg-yellow-500 shadow transition-all hover:scale-105 active:scale-95"
                        style={{ fontSize: 19, letterSpacing: 1.5, minWidth: 170 }}
                        onClick={() => setModal({ open: true, roomType: type, total })}
                      >
                        Забронировать за {total}$
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Отзывы */}
        {hotel.reviewsList && hotel.reviewsList.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold text-yellow-400 mb-4">Отзывы гостей</h2>
            <div className="flex flex-col gap-6">
              {hotel.reviewsList.map((r, idx) => (
                <div key={idx} className="bg-white/5 rounded-xl p-5 flex gap-5 items-center shadow">
                  <span className="bg-yellow-400 text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">{r.user[0]}</span>
                  <div>
                    <div className="text-white font-bold">{r.user} <span className="ml-2 text-yellow-400 text-base">★{r.rating}</span></div>
                    <div className="text-white/80 text-sm">{r.text}</div>
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