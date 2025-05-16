import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';

export default function BookingModal({ open, onClose, hotel, roomType, total, nights, guests, start, end }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function saveBooking() {
    if (!name || !phone) return alert("Заполни все поля");

    setLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        hotel: hotel?.name,
        hotelId: hotel?.id,
        roomType,
        total,
        nights,
        guests,
        start,
        end,
        name,
        phone,
        createdAt: new Date()
      });
      alert("Бронирование успешно отправлено!");
      setName('');
      setPhone('');
      onClose();
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-12 rounded-3xl shadow-2xl max-w-2xl w-[97vw] relative border-4 border-yellow-400/20 min-h-[400px]">
        <button onClick={onClose} className="absolute top-6 right-7 text-3xl text-gray-300 hover:text-yellow-400 font-black transition" style={{ zIndex: 10 }}>✕</button>
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-4 text-center drop-shadow">Бронирование</h2>
        <div className="mb-2 text-2xl text-white text-center font-bold">{hotel?.name}</div>
        <div className="mb-4 text-base text-white/70 text-center">
          <span className="font-semibold">{roomType}</span> • {start} — {end} • {nights} ночей • {guests} чел
        </div>
        <div className="mb-6 text-2xl font-black text-yellow-400 text-center">Итог: {total}$</div>
        <div className="flex flex-col items-center gap-3">
          <input className="w-full max-w-xl mb-2 px-5 py-3 rounded-xl bg-white/10 text-white text-lg focus:outline-yellow-400" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} autoFocus />
          <input className="w-full max-w-xl mb-3 px-5 py-3 rounded-xl bg-white/10 text-white text-lg focus:outline-yellow-400" placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} />
          <button
            className="w-full max-w-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-2xl py-4 text-xl mt-2 shadow-lg transition-all active:scale-95"
            onClick={saveBooking}
            disabled={loading}
          >
            {loading ? 'Сохраняем...' : 'Сохраняем'}
          </button>
        </div>
      </div>
    </div>
  );
}
