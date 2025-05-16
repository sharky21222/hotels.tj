// src/App.js
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { hotels } from './data/hotels';
import HotelDetail from './pages/HotelDetail';
import './index.css';

const title = 'HOTELS.TJ'.split('');
const cities = ['Душанбе', 'Пенджикент'];
const sortVariants = [
  { value: '', label: 'Без сортировки' },
  { value: 'price-asc', label: 'По цене (дешевле)' },
  { value: 'price-desc', label: 'По цене (дороже)' },
  { value: 'stars', label: 'По рейтингу' }
];

export default function App() {
  const today = new Date().toISOString().slice(0, 10);
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);

  // Фильтры и параметры поиска
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tmr.toISOString().slice(0, 10));
  const [guests, setGuests] = useState(1);
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyWifi, setOnlyWifi] = useState(false);
  const [onlyBreakfast, setOnlyBreakfast] = useState(false);
  const [stars, setStars] = useState('');
  const [sort, setSort] = useState('');
  const [filterOpen, setFilterOpen] = useState(false); // Мобильное меню

  // Loader
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 900);
  }, []);

  // Scroll Up button
  const [scrollUp, setScrollUp] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrollUp(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Сбросить фильтры
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setOnlyWifi(false);
    setOnlyBreakfast(false);
    setStars('');
    setCity('');
    setSort('');
  };

  // Счётчик ночей
  const nights = useMemo(() => {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [start, end]);

  // Фильтрация + сортировка
  const filteredHotels = useMemo(() => {
    let data = hotels.filter(hotel => (
      (!city || hotel.city === city) &&
      (!minPrice || hotel.price >= +minPrice) &&
      (!maxPrice || hotel.price <= +maxPrice) &&
      (!onlyWifi || hotel.wifi) &&
      (!onlyBreakfast || hotel.breakfast) &&
      (!stars || hotel.stars === +stars)
    ));

    if (sort === 'price-asc') data = [...data].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') data = [...data].sort((a, b) => b.price - a.price);
    if (sort === 'stars') data = [...data].sort((a, b) => (b.stars || 0) - (a.stars || 0));

    return data;
  }, [city, minPrice, maxPrice, onlyWifi, onlyBreakfast, stars, sort]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white font-sans">
      {/* Fixed HEADER + анимация */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl shadow-2xl">
        <div className="h-24 flex items-center justify-center select-none">
          <Link to="/" className="flex items-center gap-2 animate__animated animate__fadeInDown">
            {title.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 350 }}
                className="text-5xl sm:text-6xl font-black text-yellow-400 tracking-widest drop-shadow-lg"
              >
                {c}
              </motion.span>
            ))}
          </Link>
        </div>
      </header>

      <Routes>
        {/* Главная страница с фильтрами */}
        <Route path="/" element={
          <>
            {/* Filter bar (вверху над сеткой) */}
            <motion.div
              className="max-w-7xl mx-auto flex flex-wrap gap-3 sm:gap-5 items-center bg-white/10 backdrop-blur-xl rounded-2xl p-5 mb-8 border border-white/10 filterbar"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <select value={city} onChange={e => setCity(e.target.value)} className="filter-select">
                <option value="">Все города</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} className="filter-input"/>
              <span className="text-xl">→</span>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="filter-input"/>
              <select value={guests} onChange={e => setGuests(+e.target.value)} className="filter-select">
                <option value={1}>1 взрослый</option>
                <option value={2}>2 взрослых</option>
                <option value={3}>3 взрослых</option>
                <option value={4}>4 взрослых</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)} className="filter-select">
                {sortVariants.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
              {/* mobile filter toggle */}
              <button
                className="xl:hidden bg-yellow-400/90 hover:bg-yellow-300 text-black rounded-lg font-bold px-4 py-2 ml-auto transition-all"
                onClick={() => setFilterOpen(v => !v)}
              >
                Фильтры
              </button>
            </motion.div>

            {/* Sidebar + Контент: сетка */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[290px_1fr] gap-7 px-2 xl:px-0 relative">
              {/* Sidebar Фильтр (desktop, слева строго) */}
              <aside className="hidden xl:block sticky top-32 self-start">
                <div className="bg-white/10 border border-white/10 p-7 rounded-2xl shadow-2xl min-w-[230px] max-w-[290px] w-full animate__animated animate__fadeInLeft">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">Фильтры</h3>
                  <label className="block mb-2 text-white/90">Цена от:
                    <input type="number" placeholder="Мин" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      className="w-full bg-white/15 px-3 py-2 rounded mt-1 mb-2 filter-input"/>
                  </label>
                  <label className="block mb-2 text-white/90">Цена до:
                    <input type="number" placeholder="Макс" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      className="w-full bg-white/15 px-3 py-2 rounded mt-1 mb-2 filter-input"/>
                  </label>
                  <label className="block mb-2 text-white/90">Звезды:
                    <select value={stars} onChange={e => setStars(e.target.value)} className="w-full bg-white/15 px-3 py-2 rounded mt-1 filter-select">
                      <option value="">Любые</option>
                      <option value="3">★★★</option>
                      <option value="4">★★★★</option>
                      <option value="5">★★★★★</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-white/90 mb-2">
                    <input type="checkbox" checked={onlyWifi} onChange={e => setOnlyWifi(e.target.checked)} className="accent-yellow-400"/>Wi-Fi
                  </label>
                  <label className="flex items-center gap-2 text-white/90 mb-2">
                    <input type="checkbox" checked={onlyBreakfast} onChange={e => setOnlyBreakfast(e.target.checked)} className="accent-yellow-400"/>Завтрак
                  </label>
                  <button onClick={resetFilters} className="mt-4 w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold btn shadow hover:bg-yellow-300 transition">Сбросить</button>
                </div>
              </aside>

              {/* Мобильный фильтр (drawer слева) */}
              <AnimatePresence>
                {filterOpen && (
                  <>
                    {/* Overlay затемнения фона */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setFilterOpen(false)}
                      className="fixed inset-0 bg-black z-[98] xl:hidden"
                    />

                    <motion.aside
                      initial={{ x: '-100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '-100%', opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 330, damping: 32 }}
                      className="fixed top-0 left-0 z-[99] w-80 max-w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-2xl border-r border-yellow-300/20 rounded-tr-3xl rounded-br-3xl xl:hidden overflow-y-auto overscroll-contain"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-yellow-400">Фильтры</h3>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="bg-red-500 hover:bg-red-400 text-white rounded-lg px-3 py-1 font-bold shadow"
                        >
                          Закрыть ✕
                        </button>
                      </div>

                      <div className="space-y-5">
                        <label className="block text-white/90">
                          Цена от:
                          <input
                            type="number"
                            placeholder="Мин"
                            value={minPrice}
                            onChange={e => setMinPrice(e.target.value)}
                            className="w-full bg-white/10 px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        </label>

                        <label className="block text-white/90">
                          Цена до:
                          <input
                            type="number"
                            placeholder="Макс"
                            value={maxPrice}
                            onChange={e => setMaxPrice(e.target.value)}
                            className="w-full bg-white/10 px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        </label>

                        <label className="block text-white/90">
                          Звезды:
                          <select
                            value={stars}
                            onChange={e => setStars(e.target.value)}
                            className="w-full bg-white/10 px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          >
                            <option value="">Любые</option>
                            <option value="3">★★★</option>
                            <option value="4">★★★★</option>
                            <option value="5">★★★★★</option>
                          </select>
                        </label>

                        <label className="flex items-center gap-2 text-white/90">
                          <input
                            type="checkbox"
                            checked={onlyWifi}
                            onChange={e => setOnlyWifi(e.target.checked)}
                            className="accent-yellow-400 w-5 h-5"
                          /> Wi-Fi
                        </label>

                        <label className="flex items-center gap-2 text-white/90">
                          <input
                            type="checkbox"
                            checked={onlyBreakfast}
                            onChange={e => setOnlyBreakfast(e.target.checked)}
                            className="accent-yellow-400 w-5 h-5"
                          /> Завтрак
                        </label>

                        <button
                          onClick={resetFilters}
                          className="mt-4 w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold shadow hover:bg-yellow-300 transition"
                        >
                          Сбросить
                        </button>
                      </div>
                    </motion.aside>
                  </>
                )}
              </AnimatePresence>

              {/* Main Content (карточки справа!) */}
              <main className="w-full xl:pl-2">
                <motion.h2
                  className="text-4xl sm:text-5xl text-yellow-400 font-bold text-center mb-7"
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
                      <span className="w-16 h-16 rounded-full border-8 border-yellow-400 border-t-transparent animate-spin inline-block"></span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cards"
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 cards"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.09 } }
                      }}
                    >
                      {filteredHotels.length === 0 && (
                        <div className="col-span-full text-center text-gray-300 text-lg py-12">
                          Нет подходящих отелей по выбранным фильтрам.
                        </div>
                      )}
                      {filteredHotels.map((hotel, i) => (
                        <motion.div
                          key={hotel.id}
                          initial={{ opacity: 0, y: 35, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.09 }}
                          whileHover={{
                            y: -12,
                            scale: 1.055,
                            boxShadow: "0 20px 60px 0 #ffbb3355"
                          }}
                          className="hotel-card card group bg-white/10 border border-yellow-400/10 rounded-3xl shadow-2xl overflow-hidden hover:border-yellow-400 transition-all"
                        >
                          <Link to={`/hotel/${hotel.id}`}>
                            <img src={hotel.images[0]} alt={hotel.name} className="rounded-t-3xl h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                            <div className="info card-content p-6">
                              <div className="stars flex gap-0.5 mb-1">
                                {[...Array(hotel.stars || 4)].map((_, j) => (
                                  <span key={j} className="text-yellow-400 text-lg">★</span>
                                ))}
                                {[...Array(5 - (hotel.stars || 4))].map((_, j) => (
                                  <span key={j} className="empty text-gray-600 text-lg">★</span>
                                ))}
                              </div>
                              <h3 className="text-xl font-semibold mb-1">{hotel.name}</h3>
                              <p className="text-gray-200 text-base mb-2 line-clamp-2">{hotel.description}</p>
                              <div className="features mt-1 flex gap-2">
                                {hotel.wifi && <span className="bg-blue-600/30 px-2 rounded text-white/90">📶 Wi-Fi</span>}
                                {hotel.breakfast && <span className="bg-orange-500/30 px-2 rounded text-white/90">🍳 Завтрак</span>}
                              </div>
                              <span className="price mt-2 block text-lg bg-gradient-to-r from-yellow-400 to-orange-400/90 px-4 py-1.5 rounded-lg font-extrabold shadow-lg w-fit">
                                {hotel.price}$ × {guests} чел × {nights} ночей = <b>{hotel.price * nights * guests}$</b>
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </>
        }/>

        {/* Детальная страница — aside и фильтр не выводится */}
        <Route path="/hotel/:id" element={<HotelDetail />} />
      </Routes>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-400 footer mt-10">
        © 2025 Ниязов Амир — Лучшие отели Таджикистана
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {scrollUp && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="scroll-up-btn fixed bottom-7 right-8 z-[99] w-14 h-14 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl shadow-xl flex items-center justify-center transition-all border-2 border-white"
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}