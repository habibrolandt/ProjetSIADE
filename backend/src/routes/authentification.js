const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Employe = require("../modeles/Employe")
const auth = require("../middleware/auth")

// POST /api/auth/connexion
router.post("/connexion", async (req, res) => {
  try {
    console.log("Tentative de connexion avec:", req.body.email)
    const { email, motDePasse } = req.body
    const employe = await Employe.findOne({ email }).select("+motDePasse")

    if (!employe) {
      console.log("Employé non trouvé")
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    const isMatch = await bcrypt.compare(motDePasse, employe.motDePasse)
    if (!isMatch) {
      console.log("Mot de passe incorrect")
      return res.status(401).json({ message: "Email ou mot de passe incorrect" })
    }

    const token = jwt.sign({ id: employe._id, role: employe.role }, process.env.JWT_SECRET, { expiresIn: "24h" })

    // Remove password from response
    employe.motDePasse = undefined

    console.log("Connexion réussie pour:", employe.email)
    res.json({ token, utilisateur: employe })
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const employe = await Employe.findById(req.user.id).select("-motDePasse")
    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }
    res.json(employe)
  } catch (error) {
    console.error("Erreur dans /api/auth/me:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router

