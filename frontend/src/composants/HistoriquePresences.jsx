import { useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "react-toastify"

export default function HistoriquePresences() {
  const [presences, setPresences] = useState([])
  const [filtres, setFiltres] = useState({
    dateDebut: "",
    dateFin: "",
    employe: "",
  })
  const [employes, setEmployes] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    chargerEmployes()
    chargerPresences()
  }, [filtres]) // Removed unnecessary 'page' dependency

  const chargerEmployes = async () => {
    try {
      const response = await api.get("/employes")
      setEmployes(response.data)
    } catch (error) {
      toast.error("Erreur lors du chargement des employés")
    }
  }

  const chargerPresences = async () => {
    setLoading(true)
    try {
      const response = await api.get("/presences", {
        params: {
          ...filtres,
          page,
          limite: 10,
        },
      })
      setPresences(response.data.presences)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast.error("Erreur lors du chargement des présences")
    } finally {
      setLoading(false)
    }
  }

  const handleFiltreChange = (e) => {
    const { name, value } = e.target
    setFiltres((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPage(1)
  }

  const resetFiltres = () => {
    setFiltres({
      dateDebut: "",
      dateFin: "",
      employe: "",
    })
    setPage(1)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Historique des Présences</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              name="dateDebut"
              value={filtres.dateDebut}
              onChange={handleFiltreChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              name="dateFin"
              value={filtres.dateFin}
              onChange={handleFiltreChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
            <select
              name="employe"
              value={filtres.employe}
              onChange={handleFiltreChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Tous les employés</option>
              {employes.map((employe) => (
                <option key={employe._id} value={employe._id}>
                  {employe.prenom} {employe.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={resetFiltres}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Méthode
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : presences.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Aucune présence trouvée
                </td>
              </tr>
            ) : (
              presences.map((presence) => (
                <tr key={presence._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={presence.employe.photo || "/placeholder.svg"} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {presence.employe.prenom} {presence.employe.nom}
                        </div>
                        <div className="text-sm text-gray-500">{presence.employe.poste}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(presence.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(presence.date).toLocaleTimeString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        presence.type === "entree" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {presence.type === "entree" ? "Entrée" : "Sortie"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {presence.methode === "reconnaissance_faciale" ? "Reconnaissance faciale" : "Manuel"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((page) => Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de la page <span className="font-medium">{page}</span> sur{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Première</span>
                    ««
                  </button>
                  <button
                    onClick={() => setPage((page) => page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Précédent</span>«
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((page) => page + 1)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Suivant</span>»
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Dernière</span>
                    »»
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

