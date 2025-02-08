const deepface = require("deepface")

async function analyseEtatEmploye(imagePath) {
  try {
    const analyse = await deepface.analyze(imagePath, {
      actions: ["emotion", "age", "gender"],
    })

    const emotion = analyse[0].dominant_emotion
    const age = analyse[0].age

    const etat = {
      fatigue: 0,
      stress: 0,
    }

    // Analyse de la fatigue basée sur l'émotion et l'âge estimé
    if (emotion === "sad" || emotion === "fear") {
      etat.fatigue += 0.3
    }
    if (age > 40) {
      etat.fatigue += 0.1
    }

    // Analyse du stress basée sur l'émotion
    if (emotion === "angry" || emotion === "fear") {
      etat.stress += 0.4
    }

    return etat
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'état de l'employé:", error)
    return null
  }
}

module.exports = analyseEtatEmploye

