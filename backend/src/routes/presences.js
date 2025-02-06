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
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// POST /api/employes
router.post("/", auth, verificationRole(["admin", "rh"]), upload.single("photo"), async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, poste, role } = req.body

    if (!req.file) {
      return res.status(400).json({ message: "La photo est requise" })
    }

    const employeExistant = await Employe.findOne({ email })
    if (employeExistant) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" })
    }

    const employe = new Employe({
      nom,
      prenom,
      email,
      motDePasse,
      poste,
      role: role || "employe",
      photo: `/uploads/photos/${req.file.filename}`,
    })

    await employe.save()

    employe.motDePasse = undefined
    res.status(201).json(employe)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// PUT /api/employes/:id
router.put("/:id", auth, verificationRole(["admin", "rh"]), upload.single("photo"), async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.file) {
      updates.photo = `/uploads/photos/${req.file.filename}`
    }

    const employe = await Employe.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select(
      "-motDePasse",
    )

    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }

    res.json(employe)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" })
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
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router

