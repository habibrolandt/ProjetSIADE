const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb://localhost:27017/ProjetReconnaissanceFaciale";
const client = new MongoClient(uri);

async function creerAdmin() {
  try {
    await client.connect();
    console.log("Connecté à MongoDB");

    const db = client.db("ProjetReconnaissanceFaciale");
    const collection = db.collection("employes"); // Collection pour les employés

    // Vérifier si un admin existe déjà
    const adminExistant = await collection.findOne({ role: "admin" });
    if (adminExistant) {
      console.log("Un administrateur existe déjà !");
      return;
    }

    // Créer le hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash("admin123", salt);

    // Créer l'administrateur
    const admin = {
      nom: "Admin",
      prenom: "System",
      email: "admin@example.com",
      motDePasse: motDePasseHash,
      role: "admin",
      poste: "Administrateur Système",
      dateCreation: new Date(),
      actif: true,
      photo: "/uploads/photos/default-admin.png" // Photo par défaut
    };

    const resultat = await collection.insertOne(admin);
    console.log("Administrateur créé avec succès !");
    console.log("ID:", resultat.insertedId);
    console.log("\nVous pouvez maintenant vous connecter avec:");
    console.log("Email: admin@example.com");
    console.log("Mot de passe: admin123");

  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
  } finally {
    await client.close();
  }
}

creerAdmin();