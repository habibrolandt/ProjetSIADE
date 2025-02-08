const express = require("express")
const router = express.Router()
const Presence = require("../modeles/Presence")
const Employe = require("../modeles/Employe")
const auth = require("../middleware/auth")
const verificationRole = require("../middleware/verificationRole")

// GET /api/presences
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limite = 10, dateDebut, dateFin, employe } = req.query
    const query = {}

    if (dateDebut || dateFin) {
      query.date = {}
      if (dateDebut) query.date.$gte = new Date(dateDebut)
      if (dateFin) query.date.$lte = new Date(dateFin)
    }

    if (employe) {
      query.employe = employe
    }

    const skip = (page - 1) * limite

    const [presences, total] = await Promise.all([
      Presence.find(query)
        .populate("employe", "-motDePasse")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number.parseInt(limite)),
      Presence.countDocuments(query),
    ])

    res.json({
      presences,
      page: Number.parseInt(page),
      totalPages: Math.ceil(total / limite),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// GET /api/presences/statistiques
router.get("/statistiques", auth, async (req, res) => {
  try {
    const maintenant = new Date()
    const debutJour = new Date(maintenant.setHours(0, 0, 0, 0))
    const finJour = new Date(maintenant.setHours(23, 59, 59, 999))

    const [presencesAujourdhui, totalEmployes, presencesParJour] = await Promise.all([
      Presence.countDocuments({
        date: { $gte: debutJour, $lte: finJour },
        type: "entree",
      }),
      Employe.countDocuments({ actif: true }),
      Presence.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
            type: "entree",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const tauxPresence = totalEmployes > 0 ? Math.round((presencesAujourdhui / totalEmployes) * 100) : 0

    res.json({
      presencesAujourdhui,
      totalEmployes,
      tauxPresence,
      presencesParJour: presencesParJour.map((p) => ({
        date: p._id,
        count: p.count,
      })),
    })
  } catch (error) {
    console.error("Erreur dans /api/presences/statistiques:", error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// POST /api/presences
router.post("/", auth, async (req, res) => {
  try {
    const { type, methode } = req.body

    const presence = new Presence({
      employe: req.user.id,
      type,
      methode,
      date: new Date(),
    })

    await presence.save()
    await presence.populate("employe", "-motDePasse")

    res.status(201).json(presence)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router

