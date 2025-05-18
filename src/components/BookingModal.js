import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import jsPDF from 'jspdf'; // не забудь: npm i jspdf

export default function BookingModal({
  open, onClose, hotel, roomType, total, nights, guests, start, end, generatePDF // generatePDF можно не передавать, оно тут свое
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // успех брони
  const [showPDF, setShowPDF] = useState(false); // показывать ли кнопку PDF

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
      setSuccess(true);
      setShowPDF(true); // показываем кнопку PDF
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
    setLoading(false);
  }

  function handlePDF() {
    // PDF-генерация по аналогии с твоим кодом
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Подтверждение бронирования", 20, 20);
    doc.setFontSize(12);
    doc.text(`Отель: ${hotel.name}`, 20, 40);
    doc.text(`Адрес: ${hotel.address}`, 20, 50);
    doc.text(`Тип номера: ${roomType}`, 20, 60);
    doc.text(`Даты: ${start} — ${end}`, 20, 70);
    doc.text(`Гостей: ${guests}`, 20, 80);
    doc.text(`Сумма: ${total}$`, 20, 90);
    doc.text(`Имя: ${name}`, 20, 100);
    doc.text(`Телефон: ${phone}`, 20, 110);
    doc.text(`Дата оформления: ${new Date().toLocaleString()}`, 20, 120);
    doc.save("booking-confirmation.pdf");
  }

  function resetModal() {
    setName('');
    setPhone('');
    setSuccess(false);
    setShowPDF(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 p-12 rounded-3xl shadow-2xl max-w-2xl w-[97vw] relative border-4 border-yellow-400/20 min-h-[400px]">
        <button onClick={resetModal} className="absolute top-6 right-7 text-3xl text-gray-300 hover:text-yellow-400 font-black transition" style={{ zIndex: 10 }}>✕</button>
        <h2 className="text-3xl font-extrabold text-yellow-400 mb-4 text-center drop-shadow">Бронирование</h2>
        <div className="mb-2 text-2xl text-white text-center font-bold">{hotel?.name}</div>
        <div className="mb-4 text-base text-white/70 text-center">
          <span className="font-semibold">{roomType}</span> • {start} — {end} • {nights} ночей • {guests} чел
        </div>
        <div className="mb-6 text-2xl font-black text-yellow-400 text-center">Итог: {total}$</div>

        {!success ? (
          <div className="flex flex-col items-center gap-3">
            <input
              className="w-full max-w-xl mb-2 px-5 py-3 rounded-xl bg-white/10 text-white text-lg focus:outline-yellow-400"
              placeholder="Ваше имя"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <input
              className="w-full max-w-xl mb-3 px-5 py-3 rounded-xl bg-white/10 text-white text-lg focus:outline-yellow-400"
              placeholder="Телефон"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button
              className="w-full max-w-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-2xl py-4 text-xl mt-2 shadow-lg transition-all active:scale-95"
              onClick={saveBooking}
              disabled={loading}
            >
              {loading ? 'Сохраняем...' : 'Сохраняем'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="text-green-400 text-xl font-bold text-center mt-3">
              Бронирование успешно отправлено!
            </div>
            {showPDF && (
              <button
                className="w-full max-w-xs bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold rounded-2xl py-3 text-lg shadow-lg transition-all active:scale-95 mb-2"
                onClick={handlePDF}
              >
                Скачать подтверждение в PDF
              </button>
            )}
            <button
              className="w-full max-w-xs bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl py-3 text-lg shadow transition mt-2"
              onClick={resetModal}
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
