import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DateRange } from 'react-date-range';
import { ru } from 'date-fns/locale';
import { hotels } from './data/hotels';
import HotelDetail from './pages/HotelDetail';
import Dropdown from './components/Dropdown'; // <-- наш кастомный дропдаун
import './index.css';

// Опции для гостей
const guestOptions = [
  { value: 1, label: '👤 1 взрослый' },
  { value: 2, label: '👤 2 взрослых' },
  { value: 3, label: '👤 3 взрослых' },
  { value: 4, label: '👤 4 взрослых' }
];

const title = 'HOTELS.TJ'.split('');
const cities = ['Душанбе', 'Пенджикент'];
const sortVariants = [
  { value: '', label: 'Без сортировки' },
  { value: 'fav', label: 'Сначала любимые' },
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'price-asc', label: 'По цене (дешевле)' },
  { value: 'price-desc', label: 'По цене (дороже)' },
  { value: 'stars', label: 'По рейтингу' },
];
const tips = [
  'Проверяйте отзывы перед бронированием!',
  'Бронируйте заранее и экономьте.',
  'Обратите внимание на удобства Wi-Fi.',
  'Используйте фильтры для точного поиска.',
  'Секрет: ищите отели с подарками для гостей!',
];

export default function App() {
  // --- Тема ---
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const isDark = theme === 'dark';

  // --- Даты ---
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // --- Состояния ---
  const [dateRange, setDateRange] = useState([{ startDate: today, endDate: tomorrow, key: 'selection' }]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [city, setCity] = useState('');
  const [guests, setGuests] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyWifi, setOnlyWifi] = useState(false);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [stars, setStars] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [scrollUp, setScrollUp] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const [tip, setTip] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  // --- Избранное ---
  const [favs, setFavs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favs_hotels') || '[]');
    } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('favs_hotels', JSON.stringify(favs)); }, [favs]);

  // --- Поиск ---
  const [search, setSearch] = useState('');
  const searchRef = useRef();

  // --- Инициализация ---
  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // --- Скролл ---
  useEffect(() => {
    const onScroll = () => setScrollUp(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Pull-to-refresh ---
  const touchStart = useRef(0);
  const touchMove = useRef(0);
  useEffect(() => {
    function onStart(e) { if (window.scrollY === 0) touchStart.current = e.touches[0].clientY; }
    function onMove(e) {
      touchMove.current = e.touches[0].clientY;
      if (touchMove.current - touchStart.current > 70 && window.scrollY === 0) setShowRefresh(true);
    }
    function onEnd() { setShowRefresh(false); }
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  // --- Сброс фильтров ---
  const resetFilters = () => {
    setCity(''); setMinPrice(''); setMaxPrice(''); setOnlyWifi(false); setOnlyBreakfast(false); setStars(''); setSort('');
  };

  // --- Количество ночей ---
  const nights = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [dateRange]);

  // --- Сравнение отелей ---
  const [compare, setCompare] = useState([]);
  function toggleCompare(id) {
    setCompare(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  }
  function clearCompare() { setCompare([]); }
  const compareHotels = hotels.filter(h => compare.includes(h.id));

  // --- Фильтрация и поиск ---
  const filteredHotels = useMemo(() => {
    let data = hotels.filter(h =>
      (!city || h.city === city) &&
      (!minPrice || h.price >= +minPrice) &&
      (!maxPrice || h.price <= +maxPrice) &&
      (!onlyWifi || h.wifi) &&
      (!onlyBreakfast || h.breakfast) &&
      (!stars || h.stars === +stars)
    );
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      );
    }
    if (sort === 'fav') data = [...data].sort((a, b) => (favs.includes(b.id) ? 1 : 0) - (favs.includes(a.id) ? 1 : 0));
    if (sort === 'popular') data = [...data].sort(() => Math.random() - 0.5);
    if (sort === 'price-asc') data.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') data.sort((a, b) => b.price - a.price);
    if (sort === 'stars') data.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    return data;
  }, [city, minPrice, maxPrice, onlyWifi, onlyBreakfast, stars, sort, search, favs]);

  // --- Формат даты ---
  const fmt = d => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateDisplay = `${fmt(dateRange[0].startDate)} — ${fmt(dateRange[0].endDate)}`;

  // --- Копирование ---
  function handleCopy(txt) {
    navigator.clipboard.writeText(txt);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1300);
  }

  // --- Быстрая навигация ---
  const navigate = useNavigate();
  function goToRandomHotel() {
    const ids = filteredHotels.map(h => h.id);
    if (ids.length === 0) return;
    const randId = ids[Math.floor(Math.random() * ids.length)];
    navigate(`/hotel/${randId}`);
  }

  // --- Секретное предложение ---
  const showSecret = city === "Душанбе";

  // --- Цвета и шрифт ---
  const mainBg = isDark ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 text-white' : 'bg-white text-black';
  const cardBg = isDark ? 'bg-zinc-900 border-yellow-400/10' : 'bg-white border-yellow-200';
  const sidebarBg = isDark ? 'bg-zinc-800' : 'bg-yellow-50';
  const filterText = isDark ? 'text-white/90' : 'text-black/90';
  const descText = isDark ? 'text-gray-200' : 'text-gray-700';
  const starsGray = isDark ? 'text-gray-600' : 'text-gray-300';

  // --- Motion variants для карточек и кнопок ---
  const cardVariants = {
    initial: { opacity: 0, y: 35, scale: 0.97, boxShadow: '0 2px 16px #0003' },
    animate: { opacity: 1, y: 0, scale: 1, boxShadow: '0 2px 16px #0003' },
    whileHover: {
      y: -15, scale: 1.06,
      boxShadow: '0 18px 48px 0 #ffd70066,0 4px 40px #ffa50022',
      transition: { type: 'spring', stiffness: 380, damping: 18, duration: 0.13 }
    },
    whileTap: {
      scale: 0.99,
      boxShadow: '0 3px 12px #ffd70033'
    }
  };
  const btnVariants = {
    rest: { scale: 1, boxShadow: '0 4px 16px #ffe08e44' },
    hover: { scale: 1.045, boxShadow: '0 7px 28px #ffd70060', transition: { duration: 0.18 } },
    tap: { scale: 0.98, boxShadow: '0 1px 6px #ffd70033', transition: { duration: 0.09 } }
  };

  return (
    <div className={`min-h-screen font-sans relative pb-24 transition-colors duration-500 ${mainBg}`} style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-white/10' : 'bg-white/90'} backdrop-blur-xl shadow-2xl`}>
        <div className="flex items-center justify-between mx-auto px-4 md:px-8 h-20 md:h-28">
          <Link to="/" className="flex items-center gap-2 select-none">
            {title.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 350 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-yellow-400 tracking-widest"
                style={{ fontFamily: "'Montserrat', Arial, sans-serif", letterSpacing: ".08em" }}
              >
                {c}
              </motion.span>
            ))}
          </Link>
          <div className="flex items-center gap-3">
            <motion.button
              variants={btnVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-yellow-400 rounded-full shadow text-xl font-bold"
              title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
              style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>
            <motion.button
              variants={btnVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={goToRandomHotel}
              className="p-2 bg-pink-500 text-white rounded-full shadow font-bold text-xl"
              title="Случайный отель"
              style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
            >🎲</motion.button>
          </div>
        </div>
      </header>

      {/* Совет дня */}
      <div className="max-w-7xl mx-auto mt-6 px-4 md:px-8 lg:px-12">
        <div className={`bg-yellow-400/90 font-semibold rounded-xl p-4 md:p-6 lg:p-8 text-center text-base md:text-lg lg:text-xl animate-pulse`} style={{ color: '#222', fontFamily: "'Montserrat', Arial, sans-serif" }}>
          💡 Совет дня: {tip}
        </div>
      </div>

      {/* Секретное предложение */}
      <AnimatePresence>
        {showSecret && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-[120px] left-1/2 -translate-x-1/2 z-[1200] bg-black/90 text-yellow-400 px-7 py-2 rounded-xl shadow-2xl font-bold animate-pulse border border-yellow-400"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
          >
            🏆 Секретное предложение для Душанбе: бесплатный апгрейд номера!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Уведомление о копировании */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[1200] bg-yellow-400 text-black px-8 py-3 rounded-2xl shadow-lg font-semibold text-base"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
          >
            Скопировано!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull-to-refresh */}
      {showRefresh && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black rounded-2xl px-6 py-2 z-[1100]" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
          Обнови страницу для новых данных ⭮
        </div>
      )}

      {/* Календарь */}
      {showCalendar && <div className="fixed inset-0 z-[999] bg-black/60" onClick={() => setShowCalendar(false)} />}
      {showCalendar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-auto ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-black'} rounded-2xl shadow-2xl p-6 md:p-8 w-[90%] md:w-[80%] lg:w-[60%] max-w-[800px]`} style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
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
            <motion.button
              variants={btnVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowCalendar(false)}
              className="mt-4 w-full px-6 py-3 md:px-8 md:py-4 bg-yellow-400 text-black rounded-xl font-bold shadow text-base md:text-lg lg:text-xl"
              style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
            >
              ОК
            </motion.button>
          </div>
        </div>
      )}

      {/* Сравнение отелей */}
      {compare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1100] w-[97vw] max-w-2xl" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
          <div className="bg-yellow-100 border border-yellow-400 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
            <div className="flex-1 text-black text-base font-bold">Сравнение отелей:</div>
            <div className="flex gap-3">
              {compareHotels.map(h => (
                <div key={h.id} className="flex flex-col items-center bg-white rounded-xl border px-3 py-2">
                  <img src={h.images[0]} alt={h.name} className="w-14 h-14 object-cover rounded-lg mb-1" />
                  <span className="text-sm font-bold">{h.name}</span>
                  <button
                    onClick={() => toggleCompare(h.id)}
                    className="text-xs text-red-500 underline mt-1"
                  >Убрать</button>
                </div>
              ))}
            </div>
            <motion.button
              variants={btnVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              onClick={clearCompare}
              className="ml-2 bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition"
              style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
            >
              Очистить
            </motion.button>
          </div>
          <div className="bg-white border border-yellow-200 rounded-xl mt-3 p-3 overflow-x-auto">
            <table className="min-w-full text-sm text-black" style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
              <thead>
                <tr>
                  <th className="font-bold p-2">Параметр</th>
                  {compareHotels.map(h => (
                    <th className="font-bold p-2" key={h.id}>{h.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Город</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.city}</td>)}
                </tr>
                <tr>
                  <td className="p-2">Цена</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.price}$</td>)}
                </tr>
                <tr>
                  <td className="p-2">Звезды</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.stars || 4}★</td>)}
                </tr>
                <tr>
                  <td className="p-2">Wi-Fi</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.wifi ? 'Да' : 'Нет'}</td>)}
                </tr>
                <tr>
                  <td className="p-2">Завтрак</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.breakfast ? 'Да' : 'Нет'}</td>)}
                </tr>
                <tr>
                  <td className="p-2">Описание</td>
                  {compareHotels.map(h => <td className="p-2" key={h.id}>{h.description.slice(0, 45)}...</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Routes>
        {/* Главная */}
        <Route
          path="/"
          element={
            <>
              {/* Filter Bar */}
              <motion.div
                className={`max-w-7xl mx-auto flex flex-wrap gap-4 md:gap-6 ${isDark ? 'bg-white/10' : 'bg-yellow-50'} rounded-2xl p-6 md:p-8 mt-8 mb-8 border border-white/10`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
              >
                <Dropdown
                  value={city}
                  options={[{ value: '', label: '📍 Все города' }, ...cities.map(c => ({ value: c, label: `📍 ${c}` }))]}
                  onChange={setCity}
                  label="Город"
                  dark={isDark}
                  className="w-full sm:w-auto"
                />
                <motion.button
                  variants={btnVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowCalendar(true)}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white/10 border border-yellow-400/40 font-bold text-black flex items-center gap-3 text-sm md:text-base lg:text-lg"
                  style={{ minWidth: 200, fontFamily: "'Montserrat', Arial, sans-serif" }}
                >
                  📅 {dateDisplay}
                </motion.button>
                <Dropdown
                  value={guests}
                  options={guestOptions}
                  onChange={v => setGuests(Number(v))}
                  label="👤 Гости"
                  dark={isDark}
                  className="w-full sm:w-auto"
                />
                <Dropdown
                  value={sort}
                  options={sortVariants}
                  onChange={setSort}
                  label="Сортировка"
                  dark={isDark}
                  className="w-full sm:w-auto"
                />
                {/* Быстрый поиск */}
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск по названию или описанию..."
                  className="flex-1 min-w-[150px] max-w-xs rounded-lg px-4 py-3 border border-yellow-400 bg-white text-black text-sm md:text-base font-semibold"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                />
                <motion.button
                  variants={btnVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={resetFilters}
                  className="ml-auto bg-yellow-400/90 hover:bg-yellow-300 text-black rounded-lg font-bold px-6 py-3 md:px-8 md:py-4 transition text-sm md:text-base"
                  style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                >
                  Сбросить
                </motion.button>
              </motion.div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 px-4 md:px-8 xl:px-0">
                {/* Sidebar */}
                <aside className="hidden xl:block sticky top-32 self-start">
                  <div className={`${sidebarBg} border border-yellow-100 p-8 rounded-2xl shadow-2xl`} style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-5">Фильтры</h3>
                    <label className={`block mb-4 ${filterText}`}>
                      Цена от:
                      <input
                        type="number"
                        placeholder="Мин"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded mt-2 mb-3 border font-semibold"
                        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                      />
                    </label>
                    <label className={`block mb-4 ${filterText}`}>
                      Цена до:
                      <input
                        type="number"
                        placeholder="Макс"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded mt-2 mb-3 border font-semibold"
                        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                      />
                    </label>
                    <label className={`block mb-4 ${filterText}`}>
                      Звезды:
                      <select
                        value={stars}
                        onChange={e => setStars(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded mt-2 border font-semibold"
                        style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                      >
                        <option value="">Любые</option>
                        <option value="3">★★★</option>
                        <option value="4">★★★★</option>
                        <option value="5">★★★★★</option>
                      </select>
                    </label>
                    <label className={`flex items-center gap-3 ${filterText} mb-4`}>
                      <input
                        type="checkbox"
                        checked={onlyWifi}
                        onChange={e => setOnlyWifi(e.target.checked)}
                        className="accent-yellow-400 w-5 h-5"
                      />
                      Wi-Fi
                    </label>
                    <label className={`flex items-center gap-3 ${filterText} mb-6`}>
                      <input
                        type="checkbox"
                        checked={onlyBreakfast}
                        onChange={e => setOnlyBreakfast(e.target.checked)}
                        className="accent-yellow-400 w-5 h-5"
                      />
                      Завтрак
                    </label>
                  </div>
                </aside>

                {/* Main Content */}
                <main className="w-full xl:pl-6">
                  <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl text-yellow-400 font-bold text-center mb-8"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, delay: 0.16 }}
                    style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                  >
                    Наши отели
                  </motion.h2>
                  <AnimatePresence>
                    {loading ? (
                      <motion.div
                        key="loader"
                        className="h-80 flex items-center justify-center loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="w-16 h-16 rounded-full border-8 border-yellow-400 border-t-transparent animate-spin inline-block" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cards"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                      >
                        {filteredHotels.length === 0 ? (
                          <div className="col-span-full text-center text-gray-500 text-lg py-12">
                            Нет подходящих отелей.
                          </div>
                        ) : (
                          filteredHotels.map((h, i) => (
                            <motion.div
                              key={h.id}
                              variants={cardVariants}
                              initial="initial"
                              animate="animate"
                              whileHover="whileHover"
                              whileTap="whileTap"
                              className={`hotel-card flex flex-col justify-between ${cardBg} rounded-3xl shadow-2xl overflow-hidden hover:border-yellow-400 transition-all relative min-h-[500px]`}
                              style={{ height: '500px', cursor: 'pointer', fontFamily: "'Montserrat', Arial, sans-serif" }}
                            >
                              {/* ИЗБРАННОЕ */}
                              <motion.button
                                variants={btnVariants}
                                initial="rest"
                                whileHover="hover"
                                whileTap="tap"
                                onClick={e => { e.preventDefault(); setFavs(favs.includes(h.id) ? favs.filter(x => x !== h.id) : [...favs, h.id]); }}
                                className={`absolute top-3 right-4 z-10 text-xl rounded-full p-1 shadow-xl
                                  ${favs.includes(h.id) ? 'text-pink-400 bg-yellow-200' : 'text-gray-400 bg-black/10 hover:text-yellow-400'}
                                `}
                                title={favs.includes(h.id) ? "Убрать из любимых" : "В любимые"}
                                style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                              >
                                {favs.includes(h.id) ? '❤️' : '🤍'}
                              </motion.button>
                              {/* СРАВНЕНИЕ */}
                              <motion.button
                                variants={btnVariants}
                                initial="rest"
                                whileHover="hover"
                                whileTap="tap"
                                onClick={e => { e.preventDefault(); toggleCompare(h.id); }}
                                className={`absolute top-3 left-4 z-10 text-lg rounded-full p-1 shadow
                                  ${compare.includes(h.id) ? 'bg-yellow-400 text-black font-bold' : 'bg-yellow-100 text-yellow-500'}
                                `}
                                title={compare.includes(h.id) ? "Убрать из сравнения" : "В сравнение"}
                                style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                              >
                                {compare.includes(h.id) ? '✔' : '≡'}
                              </motion.button>
                              <Link to={`/hotel/${h.id}`} className="flex-1 flex flex-col">
                                <img
                                  src={h.images[0]}
                                  alt={h.name}
                                  className="rounded-t-3xl h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex gap-1 mb-2">
                                      {[...Array(h.stars || 4)].map((_, j) => (
                                        <span key={j} className="text-yellow-400 text-xl">★</span>
                                      ))}
                                      {[...Array(5 - (h.stars || 4))].map((_, j) => (
                                        <span key={j} className={`${starsGray} text-xl`}>★</span>
                                      ))}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold mb-2">{h.name}</h3>
                                    <p className={`${descText} text-base mb-4 line-clamp-2`}>{h.description}</p>
                                    <div className="flex gap-2 mb-4">
                                      {h.wifi && <span className="bg-blue-600/10 px-3 rounded text-blue-600 font-semibold">📶 Wi-Fi</span>}
                                      {h.breakfast && <span className="bg-orange-500/10 px-3 rounded text-orange-500 font-semibold">🍳 Завтрак</span>}
                                    </div>
                                  </div>
                                  <span className="block text-lg md:text-xl bg-gradient-to-r from-yellow-400 to-orange-400/90 px-5 py-2 rounded-lg font-extrabold shadow-lg w-fit text-black mt-auto">
                                    {h.price}$ × {guests} × {nights} = <b>{h.price * guests * nights}$</b>
                                  </span>
                                </div>
                              </Link>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>

              {/* Мобильная навигация: только НАВЕРХ! */}
              <div className={`fixed bottom-0 left-0 w-full z-[100] sm:hidden`}>
                <div className={`flex ${isDark ? 'bg-zinc-900' : 'bg-white'} border-t border-yellow-200 justify-center items-center py-3 px-4 shadow-2xl`}>
                  <motion.button
                    variants={btnVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex flex-col items-center text-yellow-400 font-bold"
                    style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
                  >
                    <span className="text-2xl">⬆️</span>
                    <span className="text-xs">Наверх</span>
                  </motion.button>
                </div>
              </div>
            </>
          }
        />
        {/* Детальная страница */}
        <Route path="/hotel/:id" element={<HotelDetail onCopy={handleCopy} />} />
      </Routes>

      {/* FOOTER */}
      <footer className={`py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-12`} style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
        © 2025 Ниязов Амир — Лучшие отели Таджикистана
      </footer>

      {/* Scroll Up Button (ПК) */}
      <AnimatePresence>
        {scrollUp && (
          <motion.button
            variants={btnVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-[99] w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl shadow-xl flex items-center justify-center transition-all hidden sm:flex"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
