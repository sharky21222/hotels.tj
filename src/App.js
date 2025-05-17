// src/App.js
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DateRange } from 'react-date-range';
import { ru } from 'date-fns/locale';

import { hotels } from './data/hotels';
import HotelDetail from './pages/HotelDetail';
import './index.css';

// Константы
const title = 'HOTELS.TJ'.split('');
const cities = ['Душанбе', 'Пенджикент'];
const sortVariants = [
  { value: '', label: 'Без сортировки' },
  { value: 'price-asc', label: 'По цене (дешевле)' },
  { value: 'price-desc', label: 'По цене (дороже)' },
  { value: 'stars', label: 'По рейтингу' },
];
const tips = [
  'Проверяйте отзывы перед бронированием!',
  'Бронируйте заранее и экономьте.',
  'Обратите внимание на удобства Wi-Fi.',
  'Используйте фильтры для точного поиска.',
  'Для экономии выбирайте будние дни.',
  'Уточняйте наличие бесплатной парковки.',
  'Обращайте внимание на рейтинг отеля.',
  'Больше гостей — выгоднее бронирование.',
];

export default function App() {
  // ================== Тема ==================
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ================== Даты ==================
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // ================== Состояния фильтров ==================
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
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollUp, setScrollUp] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const [tip, setTip] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  // ================== Инициализация ==================
  useEffect(() => {
    setTimeout(() => setLoading(false), 700);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // ================== Скролл кнопка наверх ==================
  useEffect(() => {
    const onScroll = () => setScrollUp(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ================== Pull-to-refresh для мобилок ==================
  const touchStart = useRef(0);
  const touchMove = useRef(0);
  useEffect(() => {
    function onStart(e) {
      if (window.scrollY === 0) touchStart.current = e.touches[0].clientY;
    }
    function onMove(e) {
      touchMove.current = e.touches[0].clientY;
      if (touchMove.current - touchStart.current > 70 && window.scrollY === 0) {
        setShowRefresh(true);
      }
    }
    function onEnd() {
      setShowRefresh(false);
    }
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  // ================== Сброс фильтров ==================
  const resetFilters = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyWifi(false);
    setOnlyBreakfast(false);
    setStars('');
    setSort('');
  };

  // ================== Количество ночей ==================
  const nights = useMemo(() => {
    const { startDate, endDate } = dateRange[0];
    const diff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [dateRange]);

  // ================== Фильтрация ==================
  const filteredHotels = useMemo(() => {
    let data = hotels.filter(h =>
      (!city || h.city === city) &&
      (!minPrice || h.price >= +minPrice) &&
      (!maxPrice || h.price <= +maxPrice) &&
      (!onlyWifi || h.wifi) &&
      (!onlyBreakfast || h.breakfast) &&
      (!stars || h.stars === +stars)
    );
    if (sort === 'price-asc') data.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') data.sort((a, b) => b.price - a.price);
    if (sort === 'stars') data.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    return data;
  }, [city, minPrice, maxPrice, onlyWifi, onlyBreakfast, stars, sort]);

  // ================== Формат даты ==================
  const fmt = d => d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateDisplay = `${fmt(dateRange[0].startDate)} — ${fmt(dateRange[0].endDate)}`;

  // ================== Копирование сообщения ==================
  function handleCopy(txt) {
    navigator.clipboard.writeText(txt);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1300);
  }

  return (
    <div className={`min-h-screen font-sans relative pb-24 transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 text-white'
        : 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white'
    }`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-white/10' : 'bg-black/80'
      } backdrop-blur-xl shadow-2xl`}>
        <div className="flex items-center justify-between mx-auto px-4 md:px-8 h-20 md:h-28">
          <Link to="/" className="flex items-center gap-2">
            {title.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 350 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-yellow-400 tracking-widest"
              >
                {c}
              </motion.span>
            ))}
          </Link>
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="p-2 bg-yellow-400 rounded-full shadow hover:scale-110 transition"
            title={theme === 'dark' ? "Включить светлую тему" : "Включить тёмную тему"}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Совет дня */}
      <div className="max-w-7xl mx-auto mt-6 px-4 md:px-8 lg:px-12">
        <div className="bg-yellow-400/80 text-black font-medium rounded-xl p-4 md:p-6 lg:p-8 text-center text-base md:text-lg lg:text-xl animate-pulse">
          💡 Совет дня: {tip}
        </div>
      </div>

      {/* Уведомление о копировании */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[1200] bg-yellow-400 text-black px-8 py-3 rounded-2xl shadow-lg font-semibold text-base"
          >
            Скопировано!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull-to-refresh */}
      {showRefresh && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black rounded-2xl px-6 py-2 z-[1100]">
          Обнови страницу для новых данных ⭮
        </div>
      )}

      {/* Календарь */}
      {showCalendar && <div className="fixed inset-0 z-[999] bg-black/60" onClick={() => setShowCalendar(false)} />}
      {showCalendar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-zinc-900 dark:bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 w-[90%] md:w-[80%] lg:w-[60%] max-w-[800px]">
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
              className="mt-4 w-full px-6 py-3 md:px-8 md:py-4 bg-yellow-400 text-black rounded-xl font-bold shadow hover:bg-yellow-300 text-base md:text-lg lg:text-xl transition"
            >
              ОК
            </button>
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
                className="max-w-7xl mx-auto flex flex-wrap gap-4 md:gap-6 bg-white/10 dark:bg-zinc-800/70 rounded-2xl p-6 md:p-8 mt-8 mb-8 border border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-white text-black dark:bg-zinc-700 dark:text-white rounded-lg px-4 py-3 md:px-6 md:py-4 border border-yellow-400 hover:bg-yellow-300 transition w-full sm:w-auto text-sm md:text-base"
                >
                  <option value="">📍 Все города</option>
                  {cities.map(c => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCalendar(true)}
                  className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl bg-white/10 border border-yellow-400/40 font-semibold text-white flex items-center gap-3 text-sm md:text-base lg:text-lg transition"
                  style={{ minWidth: 200 }}
                >
                  📅 {dateDisplay}
                </button>
                <select
                  value={guests}
                  onChange={e => setGuests(+e.target.value)}
                  className="bg-white text-black dark:bg-zinc-700 dark:text-white rounded-lg px-4 py-3 md:px-6 md:py-4 border border-yellow-400 hover:bg-yellow-300 transition w-full sm:w-auto text-sm md:text-base"
                >
                  {[1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>
                      👤 {n} взросл{n > 1 ? 'ых' : 'ый'}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="bg-white text-black dark:bg-zinc-700 dark:text-white rounded-lg px-4 py-3 md:px-6 md:py-4 border border-yellow-400 hover:bg-yellow-300 transition w-full sm:w-auto text-sm md:text-base"
                >
                  <option value="">Без сортировки</option>
                  {sortVariants.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFilterOpen(true)}
                  className="xl:hidden ml-auto bg-yellow-400/90 hover:bg-yellow-300 text-black rounded-lg font-bold px-6 py-3 md:px-8 md:py-4 transition text-sm md:text-base"
                >
                  Фильтры
                </button>
              </motion.div>

              <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 px-4 md:px-8 xl:px-0">
                {/* Sidebar */}
                <aside className="hidden xl:block sticky top-32 self-start">
                  <div className="bg-white/10 dark:bg-zinc-800 border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-5">Фильтры</h3>
                    <label className="block mb-4 text-white/90">
                      Цена от:
                      <input
                        type="number"
                        placeholder="Мин"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-full bg-white/15 px-4 py-3 rounded mt-2 mb-3"
                      />
                    </label>
                    <label className="block mb-4 text-white/90">
                      Цена до:
                      <input
                        type="number"
                        placeholder="Макс"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-full bg-white/15 px-4 py-3 rounded mt-2 mb-3"
                      />
                    </label>
                    <label className="block mb-4 text-white/90">
                      Звезды:
                      <select
                        value={stars}
                        onChange={e => setStars(e.target.value)}
                        className="w-full bg-white/15 px-4 py-3 rounded mt-2"
                      >
                        <option value="">Любые</option>
                        <option value="3">★★★</option>
                        <option value="4">★★★★</option>
                        <option value="5">★★★★★</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-3 text-white/90 mb-4">
                      <input
                        type="checkbox"
                        checked={onlyWifi}
                        onChange={e => setOnlyWifi(e.target.checked)}
                        className="accent-yellow-400 w-5 h-5"
                      />
                      Wi-Fi
                    </label>
                    <label className="flex items-center gap-3 text-white/90 mb-6">
                      <input
                        type="checkbox"
                        checked={onlyBreakfast}
                        onChange={e => setOnlyBreakfast(e.target.checked)}
                        className="accent-yellow-400 w-5 h-5"
                      />
                      Завтрак
                    </label>
                    <button
                      onClick={resetFilters}
                      className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold shadow hover:bg-yellow-300 transition text-base"
                    >
                      Сбросить
                    </button>
                  </div>
                </aside>

                {/* Mobile Drawer */}
                <AnimatePresence>
                  {filterOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFilterOpen(false)}
                        className="fixed inset-0 bg-black z-30 xl:hidden"
                      />
                      <motion.aside
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 330, damping: 32 }}
                        className="fixed top-0 left-0 z-40 w-80 h-full bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl border-r border-yellow-300/20 rounded-tr-3xl rounded-br-3xl xl:hidden overflow-y-auto"
                      >
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-yellow-400">Фильтры</h3>
                          <button
                            onClick={() => setFilterOpen(false)}
                            className="bg-red-500 hover:bg-red-400 text-white rounded-lg px-3 py-1 font-bold"
                          >
                            Закрыть ✕
                          </button>
                        </div>
                        {/* Контент фильтра как в сайдбаре */}
                        <label className="block mb-4 text-white/90">
                          Цена от:
                          <input
                            type="number"
                            placeholder="Мин"
                            value={minPrice}
                            onChange={e => setMinPrice(e.target.value)}
                            className="w-full bg-white/15 px-4 py-3 rounded mt-2 mb-3"
                          />
                        </label>
                        <label className="block mb-4 text-white/90">
                          Цена до:
                          <input
                            type="number"
                            placeholder="Макс"
                            value={maxPrice}
                            onChange={e => setMaxPrice(e.target.value)}
                            className="w-full bg-white/15 px-4 py-3 rounded mt-2 mb-3"
                          />
                        </label>
                        <label className="block mb-4 text-white/90">
                          Звезды:
                          <select
                            value={stars}
                            onChange={e => setStars(e.target.value)}
                            className="w-full bg-white/15 px-4 py-3 rounded mt-2"
                          >
                            <option value="">Любые</option>
                            <option value="3">★★★</option>
                            <option value="4">★★★★</option>
                            <option value="5">★★★★★</option>
                          </select>
                        </label>
                        <label className="flex items-center gap-3 text-white/90 mb-4">
                          <input
                            type="checkbox"
                            checked={onlyWifi}
                            onChange={e => setOnlyWifi(e.target.checked)}
                            className="accent-yellow-400 w-5 h-5"
                          />
                          Wi-Fi
                        </label>
                        <label className="flex items-center gap-3 text-white/90 mb-6">
                          <input
                            type="checkbox"
                            checked={onlyBreakfast}
                            onChange={e => setOnlyBreakfast(e.target.checked)}
                            className="accent-yellow-400 w-5 h-5"
                          />
                          Завтрак
                        </label>
                        <button
                          onClick={resetFilters}
                          className="w-full bg-yellow-400 text-black py-3 rounded-xl font-semibold shadow hover:bg-yellow-300 transition text-base"
                        >
                          Сбросить
                        </button>
                      </motion.aside>
                    </>
                  )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="w-full xl:pl-6">
                  <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl text-yellow-400 font-bold text-center mb-8"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, delay: 0.16 }}
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
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                      >
                        {filteredHotels.length === 0 ? (
                          <div className="col-span-full text-center text-gray-300 text-lg py-12">
                            Нет подходящих отелей.
                          </div>
                        ) : (
                          filteredHotels.map((h, i) => (
                            <motion.div
                              key={h.id}
                              initial={{ opacity: 0, y: 35, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ y: -12, scale: 1.05, boxShadow: '0 20px 60px #ffbb3355' }}
                              className="hotel-card bg-white/10 dark:bg-zinc-900 border border-yellow-400/10 rounded-3xl shadow-2xl overflow-hidden hover:border-yellow-400 transition-all"
                            >
                              <Link to={`/hotel/${h.id}`}>
                                <img
                                  src={h.images[0]}
                                  alt={h.name}
                                  className="rounded-t-3xl h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="p-6">
                                  <div className="flex gap-1 mb-2">
                                    {[...Array(h.stars || 4)].map((_, j) => (
                                      <span key={j} className="text-yellow-400 text-xl">★</span>
                                    ))}
                                    {[...Array(5 - (h.stars || 4))].map((_, j) => (
                                      <span key={j} className="text-gray-600 text-xl">★</span>
                                    ))}
                                  </div>
                                  <h3 className="text-lg md:text-xl font-semibold mb-2">{h.name}</h3>
                                  <p className="text-gray-200 text-base mb-4 line-clamp-2">{h.description}</p>
                                  <div className="flex gap-2 mb-4">
                                    {h.wifi && <span className="bg-blue-600/30 px-3 rounded text-white">📶 Wi-Fi</span>}
                                    {h.breakfast && <span className="bg-orange-500/30 px-3 rounded text-white">🍳 Завтрак</span>}
                                  </div>
                                  <span className="block text-lg md:text-xl bg-gradient-to-r from-yellow-400 to-orange-400/90 px-5 py-2 rounded-lg font-extrabold shadow-lg w-fit">
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

              {/* Mobile Bottom Nav */}
              <div className="fixed bottom-0 left-0 w-full z-[100] sm:hidden">
                <div className="flex bg-zinc-900/95 border-t border-yellow-400/20 justify-around items-center py-3 px-4 shadow-2xl">
                  <Link to="/" className="flex flex-col items-center text-yellow-400 font-bold">
                    <span className="text-2xl">🏠</span>
                    <span className="text-xs">Главная</span>
                  </Link>
                  <button onClick={() => setFilterOpen(true)} className="flex flex-col items-center text-yellow-400 font-bold">
                    <span className="text-2xl">🔍</span>
                    <span className="text-xs">Фильтр</span>
                  </button>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center text-yellow-400 font-bold">
                    <span className="text-2xl">⬆️</span>
                    <span className="text-xs">Наверх</span>
                  </button>
                </div>
              </div>
            </>
          }
        />
        {/* Детальная страница */}
        <Route path="/hotel/:id" element={<HotelDetail onCopy={handleCopy} />} />
      </Routes>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-400 mt-12">
        © 2025 Ниязов Амир — Лучшие отели Таджикистана
      </footer>

      {/* Scroll Up Button */}
      <AnimatePresence>
        {scrollUp && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-[99] w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl shadow-xl flex items-center justify-center transition-all hidden sm:flex"
            initial={{ opacity: 0, scale: 0.7 }}
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
