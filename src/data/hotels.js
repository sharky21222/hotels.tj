// src/data/hotels.js
import firuz1 from '../assets/hotel-firuz-1.jpg';
import firuz2 from '../assets/hotel-firuz-2.jpg';
import heson from '../assets/heson.jpg';

export const hotels = [
  {
    id: 1,
    name: 'Firuz Hotel',
    description: 'Уютный отель в центре Душанбе.',
    price: 50,
    images: [firuz1, firuz2]
  },
  {
    id: 2,
    name: 'Firuz Hotel (новый корпус)',
    description: 'Те же условия, но другой этаж.',
    price: 50,
    images: [firuz1, firuz2]
  },
  {
    id: 3,
    name: 'Firuz Hotel (эконом)',
    description: 'Бюджетный номер в этом же здании.',
    price: 40,
    images: [firuz1, firuz2]
  },
  {
    id: 4,
    name: 'Firuz Hotel (люкс)',
    description: 'Просторный люкс с балконом.',
    price: 70,
    images: [firuz1, firuz2]
  },
  {
    id: 5,
    name: 'Firuz Hotel (панорамный)',
    description: 'Номера с видом на город.',
    price: 60,
    images: [firuz1, firuz2]
  },
  {
    id: 6,
    name: 'Firuz Hotel (семейный)',
    description: 'Идеально для проживания с детьми.',
    price: 55,
    images: [firuz1, firuz2]
  }
];
