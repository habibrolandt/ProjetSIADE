const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const auth = require("../middleware/auth")
const Employe = require("../modeles/Employe")
const Presence = require("../modeles/Presence")
const faceapi = require("face-api.js")
const canvas = require("canvas")

// Load face-api models
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

let modelsLoaded = false

const loadModels = async () => {
  try {
    const modelPath = path.resolve(__dirname, "../../models")
    console.log("📂 Chemin des modèles:", modelPath)

    // Vérifier si le dossier existe
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Le dossier models n'existe pas: ${modelPath}`)
    }

    // Liste de tous les fichiers de modèle attendus
    const requiredFiles = [
      "ssd_mobilenetv1_model-weights_manifest.json",
      "ssd_mobilenetv1_model-shard1",
      "ssd_mobilenetv1_model-shard2",
      "face_landmark_68_model-weights_manifest.json",
      "face_landmark_68_model-shard1",
      "face_recognition_model-weights_manifest.json",
      "face_recognition_model-shard1",
      "face_recognition_model-shard2",
    ]

    // Vérifier si tous les fichiers existent
    for (const file of requiredFiles) {
      const filePath = path.join(modelPath, file)
      if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier manquant: ${file}`)
      }
      console.log(`✅ Fichier trouvé: ${file}`)
    }

    // Charger tous les modèles
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)

    modelsLoaded = true
    console.log("✅ Modèles de reconnaissance faciale chargés avec succès")
  } catch (error) {
    console.error("❌ Échec du chargement des modèles:", error)
    throw error
  }
}

// Tentative de chargement des modèles au démarrage
loadModels().catch((error) => {
  console.error("❌ Erreur fatale lors du chargement des modèles:", error)
})

// POST /api/reconnaissance-faciale
router.post("/", auth, async (req, res) => {
  if (!modelsLoaded) {
    return res.status(503).json({
      message: "Le service de reconnaissance faciale n'est pas encore prêt. Veuillez réessayer dans quelques instants.",
    })
  }

  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ message: "Image requise" })
    }

  
    const tempDir = path.join(__dirname, "../../uploads/temp")
    await fs.promises.mkdir(tempDir, { recursive: true })

    // Sauvegarder l'image temporairement
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const tempImagePath = path.join(tempDir, `${uuidv4()}.jpg`)
    await fs.promises.writeFile(tempImagePath, buffer)

    // Reconnaissance faciale
    const img = await canvas.loadImage(tempImagePath)
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()

    // Nettoyage du fichier temporaire
    await fs.promises.unlink(tempImagePath).catch(console.error)

    if (detections.length === 0) {
      return res.status(404).json({ message: "Aucun visage détecté dans l'image" })
    }

    const employes = await Employe.find()
    const labeledDescriptors = await Promise.all(
      employes.map(async (employe) => {
        try {
          const employeImagePath = path.join(__dirname, "../..", employe.photo)
          const img = await canvas.loadImage(employeImagePath)
          const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()

          if (!detection) {
            console.warn(`Pas de visage détecté pour l'employé ${employe._id}`)
            return null
          }

          return new faceapi.LabeledFaceDescriptors(employe._id.toString(), [detection.descriptor])
        } catch (error) {
          console.error(`Erreur lors du traitement de l'image de l'employé ${employe._id}:`, error)
          return null
        }
      }),
    )

    const validDescriptors = labeledDescriptors.filter((desc) => desc !== null)

    if (validDescriptors.length === 0) {
      return res.status(500).json({ message: "Erreur lors de la comparaison des visages" })
    }

    const faceMatcher = new faceapi.FaceMatcher(validDescriptors)
    const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor)

    if (bestMatch.distance < 0.6) {
      const matchedEmploye = employes.find((e) => e._id.toString() === bestMatch.label)

      const presence = new Presence({
        employe: matchedEmploye._id,
        type: "entree",
        methode: "reconnaissance_faciale",
        date: new Date(),
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
    res.status(500).json({
      message: "Erreur lors de la reconnaissance faciale",
      error: error.message,
    })
  }
})

module.exports = router

