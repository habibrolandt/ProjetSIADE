const fs = require("fs")
const path = require("path")
const https = require("https")

const MODELS_DIR = path.join(__dirname, "models")

const MODEL_URLS = {
  "ssd_mobilenetv1_model-weights_manifest.json":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard2",
  "face_landmark_68_model-weights_manifest.json":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1",
  "face_recognition_model-shard2":
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2",
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Échec du téléchargement de ${url}: ${response.statusCode}`))
          return
        }

        const fileStream = fs.createWriteStream(filePath)
        response.pipe(fileStream)

        fileStream.on("finish", () => {
          fileStream.close()
          console.log(`Téléchargé: ${filePath}`)
          resolve()
        })

        fileStream.on("error", (err) => {
          fs.unlink(filePath, () => reject(err))
        })
      })
      .on("error", reject)
  })
}

async function main() {
  try {
    if (!fs.existsSync(MODELS_DIR)) {
      fs.mkdirSync(MODELS_DIR, { recursive: true })
    }

    for (const [fileName, url] of Object.entries(MODEL_URLS)) {
      const filePath = path.join(MODELS_DIR, fileName)
      await downloadFile(url, filePath)
    }

    console.log("Tous les modèles ont été téléchargés avec succès!")
  } catch (error) {
    console.error("Erreur lors du téléchargement des modèles:", error)
    process.exit(1)
  }
}

main()

