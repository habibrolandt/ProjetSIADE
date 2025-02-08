const fs = require("fs")
const https = require("https")
const path = require("path")

const modelsDir = path.join(__dirname, "models")

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir)
}

const modelFiles = [
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
]

const baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"

modelFiles.forEach((file) => {
  const filePath = path.join(modelsDir, file)
  const fileStream = fs.createWriteStream(filePath)

  https
    .get(baseUrl + file, (response) => {
      response.pipe(fileStream)
      fileStream.on("finish", () => {
        fileStream.close()
        console.log(`Downloaded ${file}`)
      })
    })
    .on("error", (err) => {
      console.error(`Error downloading ${file}: ${err.message}`)
      fs.unlink(filePath, () => {}) // Delete the file if there was an error
    })
})

