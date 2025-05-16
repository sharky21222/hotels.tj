// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Готовую сборку React отдаём как статику
app.use(express.static(path.join(__dirname, 'build')));

// Любой другой роут отдаёт index.html (SPA)
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
