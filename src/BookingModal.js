import React from 'react';

export default function BookingModal({ open, onClose, hotel, nights, guests, roomType, total, dates }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative text-black animate__animated animate__fadeInDown">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-yellow-400 transition">&times;</button>
        <h2 className="text-2xl font-bold mb-3 text-yellow-600">Бронирование</h2>
        <div className="mb-2">Отель: <b>{hotel.name}</b></div>
        <div className="mb-2">Тип номера: <b>{roomType}</b></div>
        <div className="mb-2">Гостей: <b>{guests}</b></div>
        <div className="mb-2">Даты: <b>{dates}</b></div>
        <div className="mb-4">Итого: <span className="font-extrabold text-xl">{total}$</span></div>
        <form className="flex flex-col gap-3">
          <input type="text" placeholder="Ваше имя" required className="border px-3 py-2 rounded"/>
          <input type="tel" placeholder="Телефон" required className="border px-3 py-2 rounded"/>
          <input type="email" placeholder="Email" className="border px-3 py-2 rounded"/>
          <button type="submit" className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg shadow transition">Подтвердить бронирование</button>
        </form>
      </div>
    </div>
  );
}
