const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const Employe = require("../modeles/Employe")
const auth = require("../middleware/auth")
const verificationRole = require("../middleware/verificationRole")

// Configuration de Multer pour le stockage des photos
const storage = multer.diskStorage({
  destination: "uploads/photos/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Le fichier doit être une image"))
    }
  },
})

// GET /api/employes
router.get("/", auth, async (req, res) => {
  try {
    const employes = await Employe.find().select("-motDePasse")
    res.json(employes)
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error)
    res.status(500).json({ message: "Erreur serveur lors de la récupération des employés" })
  }
})

// POST /api/employes
router.post("/", auth, verificationRole(["admin", "rh"]), upload.array("photos", 3), async (req, res) => {
  try {
    console.log("Données reçues:", req.body)
    console.log("Fichiers reçus:", req.files)

    const { nom, prenom, email, motDePasse, poste, role } = req.body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Au moins une photo est requise" })
    }

    const employeExistant = await Employe.findOne({ email })
    if (employeExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" })
    }

    const photos = req.files.map((file) => `/uploads/photos/${file.filename}`)

    const employe = new Employe({
      nom,
      prenom,
      email,
      motDePasse,
      poste,
      role: role || "employe",
      photo: photos[0], // Use the first photo as the main photo
      photos: photos, // Store all photos
    })

    await employe.save()

    employe.motDePasse = undefined
    res.status(201).json(employe)
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un employé:", error)
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'employé", error: error.message })
  }
})

// PUT /api/employes/:id
router.put("/:id", auth, verificationRole(["admin", "rh"]), upload.array("photos", 3), async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.files && req.files.length > 0) {
      updates.photo = `/uploads/photos/${req.files[0].filename}`
      updates.photos = req.files.map((file) => `/uploads/photos/${file.filename}`)
    }

    const employe = await Employe.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
      "-motDePasse",
    )

    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }

    res.json(employe)
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un employé:", error)
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'employé", error: error.message })
  }
})

// DELETE /api/employes/:id
router.delete("/:id", auth, verificationRole(["admin"]), async (req, res) => {
  try {
    const employe = await Employe.findByIdAndDelete(req.params.id)
    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }
    res.json({ message: "Employé supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression d'un employé:", error)
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'employé", error: error.message })
  }
})

module.exports = router

