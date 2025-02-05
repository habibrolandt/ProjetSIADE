import { useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "react-toastify"

export default function GestionEmployes() {
  const [employes, setEmployes] = useState([])
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    poste: "",
    role: "employe",
    photo: null,
    motDePasse: "",
  })
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("creation")
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    chargerEmployes()
  }, [])

  const chargerEmployes = async () => {
    try {
      const response = await api.get("/employes")
      setEmployes(response.data)
    } catch (error) {
      toast.error("Erreur lors du chargement des employés")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      })

      if (mode === "creation") {
        await api.post("/employes", formDataToSend)
        toast.success("Employé ajouté avec succès")
      } else {
        await api.put(`/employes/${selectedId}`, formDataToSend)
        toast.success("Employé modifié avec succès")
      }

      resetForm()
      chargerEmployes()
    } catch (error) {
      toast.error("Erreur lors de l'opération")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employe) => {
    setFormData({
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      poste: employe.poste,
      role: employe.role,
      photo: null,
      motDePasse: "",
    })
    setSelectedId(employe._id)
    setMode("edition")
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      try {
        await api.delete(`/employes/${id}`)
        toast.success("Employé supprimé avec succès")
        chargerEmployes()
      } catch (error) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      poste: "",
      role: "employe",
      photo: null,
      motDePasse: "",
    })
    setMode("creation")
    setSelectedId(null)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Gestion des Employés</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {mode === "creation" ? "Ajouter un employé" : "Modifier un employé"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Poste</label>
              <input
                type="text"
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="employe">Employé</option>
                <option value="rh">RH</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                className="mt-1 block w-full"
                accept="image/*"
                {...(mode === "creation" && { required: true })}
              />
            </div>

            {mode === "creation" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  value={formData.motDePasse}
                  onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {mode === "edition" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Chargement..." : mode === "creation" ? "Ajouter" : "Modifier"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Liste des Employés</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employes.map((employe) => (
                <tr key={employe._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={employe.photo || "/placeholder.svg"}
                      alt={`${employe.prenom} ${employe.nom}`}
                      className="h-10 w-10 rounded-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employe.prenom} {employe.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{employe.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employe.poste}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(employe)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(employe._id)} className="text-red-600 hover:text-red-900">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

