const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['employe', 'admin', 'rh'],
    default: 'employe'
  },
  photo: {
    type: String,
    required: [true, 'La photo est requise']
  },
  poste: {
    type: String,
    required: [true, 'Le poste est requis']
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  }
});

// Crypter le mot de passe avant la sauvegarde
employeSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Méthode pour comparer les mots de passe
employeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

module.exports = mongoose.model('Employe', employeSchema);