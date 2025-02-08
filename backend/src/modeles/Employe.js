const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const employeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true, select: false },
  poste: { type: String, required: true },
  role: { type: String, enum: ["employe", "rh", "admin"], default: "employe" },
  photo: { type: String, required: true },
  dateCreation: { type: Date, default: Date.now },
  derniereMiseAJour: { type: Date },
  actif: { type: Boolean, default: true },
  caracteristiquesVisage: { type: Object },
})

employeSchema.pre("save", async function (next) {
  if (this.isModified("motDePasse")) {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 12)
  }
  if (this.isModified()) {
    this.derniereMiseAJour = Date.now()
  }
  next()
})

employeSchema.methods.verifierMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse)
}

module.exports = mongoose.model("Employe", employeSchema)

