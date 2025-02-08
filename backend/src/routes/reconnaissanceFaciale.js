const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs").promises
const { v4: uuidv4 } = require("uuid")
const auth = require("../middleware/auth")
const Employe = require("../modeles/Employe")
const Presence = require("../modeles/Presence")
const faceapi = require("face-api.js")
const canvas = require("canvas")
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

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
    const tempImagePath = path.join(__dirname, "../../uploads/temp", `${uuidv4()}.jpg`)
    await fs.writeFile(tempImagePath, buffer)

    // Reconnaissance faciale
    const img = await canvas.loadImage(tempImagePath)
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()

    if (detections.length === 0) {
      await fs.unlink(tempImagePath)
      return res.status(404).json({ message: "Aucun visage détecté" })
    }

    const employes = await Employe.find()
    const labeledDescriptors = await Promise.all(
      employes.map(async (employe) => {
        const img = await canvas.loadImage(path.join(__dirname, "../..", employe.photo))
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        return new faceapi.LabeledFaceDescriptors(employe._id.toString(), [detection.descriptor])
      }),
    )

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
    const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor)

    // Supprimer l'image temporaire
    await fs.unlink(tempImagePath)

    if (bestMatch.distance < 0.6) {
      const matchedEmploye = employes.find((e) => e._id.toString() === bestMatch.label)

      // Enregistrer la présence
      const presence = new Presence({
        employe: matchedEmploye._id,
        type: "entree",
        methode: "reconnaissance_faciale",
      })
      await presence.save()

      res.json({
        success: true,
        message: "Présence enregistrée avec succès",
        employe: {
          _id: matchedEmploye._id,
          nom: matchedEmploye.nom,
          prenom: matchedEmploye.prenom,
          photo: matchedEmploye.photo,
        },
      })
    } else {
      res.status(404).json({ message: "Personne non reconnue" })
    }
  } catch (error) {
    console.error("Erreur détaillée lors de la reconnaissance faciale:", error)
    res.status(500).json({ message: "Erreur lors de la reconnaissance faciale", error: error.message })
  }
})

module.exports = router

