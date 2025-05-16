// src/index.js
import './index.css';  // можно оставить по необходимости 
import './App.css';  
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
// можно оставить по необходимости    // глобальные стили приложения


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
