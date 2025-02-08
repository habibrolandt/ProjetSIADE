function genererRecommandations(etatEmploye) {
    const recommandations = []
  
    if (etatEmploye.fatigue > 0.5) {
      recommandations.push("Prenez une pause de 15 minutes pour vous reposer")
      recommandations.push("Considérez de prendre un café ou une boisson énergisante")
    }
  
    if (etatEmploye.stress > 0.5) {
      recommandations.push("Faites quelques exercices de respiration profonde")
      recommandations.push("Prenez un moment pour méditer ou faire une courte promenade")
    }
  
    if (etatEmploye.fatigue > 0.7 || etatEmploye.stress > 0.7) {
      recommandations.push("Parlez à votre superviseur de votre état actuel")
    }
  
    return recommandations
  }
  
  module.exports = genererRecommandations
  
  