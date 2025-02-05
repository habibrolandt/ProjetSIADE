const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs").promises
const { v4: uuidv4 } = require("uuid")
const auth = require("../middleware/auth")
const Employe = require("../modeles/Employe")
const Presence = require("../modeles/Presence")
// const { faceapi } = require("../utils/faceRecognition")

// POST /api/reconnaissance-faciale
router.post("/", auth, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ message: "Image requise" })
    }

    // Sauvegarder l'image temporairement
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const tempImagePath = path.join("uploads", "temp", `${uuidv4()}.jpg`)
    await fs.writeFile(tempImagePath, buffer)

    // Reconnaissance faciale
    const employes = await Employe.find()
    const resultat = await faceapi.compareWithDatabase(tempImagePath, employes)

    // Supprimer l'image temporaire
    await fs.unlink(tempImagePath)

    if (!resultat.match) {
      return res.status(404).json({ message: "Personne non reconnue" })
    }

    // Enregistrer la présence
    const presence = new Presence({
      employe: resultat.employe._id,
      type: "entree",
      methode: "reconnaissance_faciale",
    })
    await presence.save()

    res.json({
      success: true,
      message: "Présence enregistrée avec succès",
      ...resultat,
    })
  } catch (error) {
    console.error("Erreur reconnaissance faciale:", error)
    res.status(500).json({ message: "Erreur lors de la reconnaissance faciale" })
  }
})

module.exports = router

