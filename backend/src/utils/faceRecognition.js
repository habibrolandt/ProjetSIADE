const faceapi = require("face-api.js")
const canvas = require("canvas")
const fs = require("fs").promises

// Load the models
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("path/to/models")
  await faceapi.nets.faceLandmark68Net.loadFromDisk("path/to/models")
  await faceapi.nets.faceRecognitionNet.loadFromDisk("path/to/models")
}

loadModels()

const faceRecognition = {
  async compareWithDatabase(imagePath, employes) {
    const img = await canvas.loadImage(imagePath)
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()

    if (detections.length === 0) {
      return { match: false, message: "Aucun visage détecté" }
    }

    const labeledDescriptors = await Promise.all(
      employes.map(async (employe) => {
        const img = await canvas.loadImage(employe.photo)
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        return new faceapi.LabeledFaceDescriptors(employe._id.toString(), [detection.descriptor])
      }),
    )

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
    const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor)

    if (bestMatch.distance < 0.6) {
      const matchedEmploye = employes.find((e) => e._id.toString() === bestMatch.label)
      return { match: true, employe: matchedEmploye }
    } else {
      return { match: false, message: "Aucune correspondance trouvée" }
    }
  },
}

module.exports = { faceapi: faceRecognition }

