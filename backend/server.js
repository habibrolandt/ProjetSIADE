const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config()
const multer = require("multer")
const sharp = require("sharp")

let tf
try {
  tf = require("@tensorflow/tfjs-node")
} catch (error) {
  console.warn(
    "⚠️ TensorFlow.js n'a pas pu être chargé. La reconnaissance faciale pourrait ne pas fonctionner correctement.",
  )
}

const app = express()

// Middleware
app.use(
  cors({
    origin: "*",
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Création des dossiers nécessaires
const uploadsDir = path.join(__dirname, "uploads")
const tempDir = path.join(__dirname, "uploads", "temp")
;[uploadsDir, tempDir].forEach((dir) => {
  if (!require("fs").existsSync(dir)) {
    require("fs").mkdirSync(dir, { recursive: true })
  }
})

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ storage: storage })

// Connexion à MongoDB avec retry
const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ProjetReconnaissanceFaciale"

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })
    console.log("✅ Connecté à MongoDB")
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB:", err)
    console.log("🔄 Nouvelle tentative dans 5 secondes...")
    setTimeout(connectWithRetry, 5000)
  }
}

// Première tentative de connexion
connectWithRetry()

// Gestion des événements MongoDB
mongoose.connection.on("error", (err) => {
  console.error("❌ Erreur de connexion MongoDB:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("🔌 MongoDB déconnecté. Tentative de reconnexion...")
  connectWithRetry()
})

// Routes
app.use("/api/auth", require("./src/routes/authentification"))
app.use("/api/employes", require("./src/routes/employes"))
app.use("/api/presences", require("./src/routes/presences"))
app.use("/api/reconnaissance-faciale", require("./src/routes/reconnaissanceFaciale"))

app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running",
    mongodbStatus: mongoose.connection.readyState === 1 ? "connecté" : "déconnecté",
    tensorflowStatus: tf ? "chargé" : "non chargé",
  })
})

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur:", err)
  res.status(500).json({
    message: "Une erreur est survenue",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesse rejetée non gérée:", promise, "raison:", reason)
})

process.on("uncaughtException", (err) => {
  console.error("❌ Exception non capturée:", err)
})

// Démarrage du serveur
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
})

