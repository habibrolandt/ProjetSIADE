const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['entree', 'sortie'],
    required: true
  },
  methode: {
    type: String,
    enum: ['reconnaissance_faciale', 'manuel'],
    default: 'reconnaissance_faciale'
  },
  localisation: {
    type: {
      latitude: Number,
      longitude: Number
    },
    required: false
  },
  statut: {
    type: String,
    enum: ['valide', 'en_attente', 'rejete'],
    default: 'valide'
  }
});

// Index pour optimiser les recherches par date
presenceSchema.index({ date: 1, employe: 1 });

module.exports = mongoose.model('Presence', presenceSchema);