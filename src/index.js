require('dotenv').config()
const connectDB = require("./config/db")
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const app = express()

connectDB();

app.use(cors());
app.use(express.json());

// routes
const routesPath = path.join(__dirname, "./routes")
if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".js")) {
      try {
        const routeName = file.replace(".js", "");
        const route = require(path.join(routesPath, file));

        app.use(`/api/${routeName}`, route);

        console.log(`✅ Route /api/${routeName} chargée`);
      } catch (error) {
        console.error(`❌ Erreur chargement ${file}:`, error.message);
      }
    }
  });
} else {
  console.error("❌ Dossier routes introuvable");
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Serveur lancé sur port ${PORT}`));