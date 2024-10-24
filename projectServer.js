const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'projectMain')));

// Serve node_modules as a static directory
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'projectMain', 'loadmap.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `CERI-SN IMT M-planner server is running on http://localhost:${PORT}`
  );
});
