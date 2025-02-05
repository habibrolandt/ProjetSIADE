// backend/src/serveur.js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const employesRoutes = require('./src/routes/employes')
const presencesRoutes = require('./src/routes/presences')
const authRoutes = require('./src/routes/authentification')
const reconnaissanceFacialeRoutes = require('./src/routes/reconnaissanceFaciale')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => console.error('Erreur de connexion à MongoDB:', err))

app.use('/api/employes', employesRoutes)
app.use('/api/presences', presencesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/reconnaissance-faciale', reconnaissanceFacialeRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`))

// // backend/src/modeles/Employe.js
// const mongoose = require('mongoose')

// const EmployeSchema = new mongoose.Schema({
//   nom: { type: String, required: true },
//   prenom: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   poste: { type: String, required: true },
//   photo: { type: String, required: true },
//   role: { type: String, enum: ['employe', 'admin', 'rh'], default: 'employe' },
//   motDePasse: { type: String, required: true },
//   dateEnregistrement: { type: Date, default: Date.now }
// })

// module.exports = mongoose.model('Employe', EmployeSchema)

// // backend/src/routes/reconnaissanceFaciale.js
// const express = require('express')
// const router = express.Router()
// const fs = require('fs')
// const path = require('path')
// const { deepface } = require('deepface')
// const Employe = require('../modeles/Employe')
// const Presence = require('../modeles/Presence')

// router.post('/', async (req, res) => {
//   try {
//     const { image } = req.body
//     const base64Data = image.replace(/^data:image\/jpeg;base64,/, "")
    
//     const tempImagePath = path.join(__dirname, '../temp', `${Date.now()}.jpg`)
//     fs.writeFileSync(tempImagePath, base64Data, 'base64')

//     const employes = await Employe.find()
//     let employeReconnu = null

//     for (const employe of employes) {
//       const result = await deepface.verify({
//         img1_path: tempImagePath,
//         img2_path: employe.photo,
//       })

//       if (result.verified) {
//         employeReconnu = employe
//         break
//       }
//     }

//     fs.unlinkSync(tempImagePath)

//     if (employeReconnu) {
//       const presence = new Presence({
//         employe: employeReconnu._id,
//       })
//       await presence.save()

//       res.json({
//         nom: employeReconnu.nom,
//         prenom: employeReconnu.prenom,
//         poste: employeReconnu.poste,
//       })
//     } else {
//       res.status(404).json({ message: 'Employé non reconnu' })
//     }
//   } catch (error) {
//     console.error('Erreur lors de la reconnaissance faciale:', error)
//     res.status(500).json({ message: 'Erreur lors du traitement de la reconnaissance faciale' })
//   }
// })

// module.exports = router