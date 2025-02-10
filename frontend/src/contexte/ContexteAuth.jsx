import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const ContexteAuth = createContext(null)

export const useAuth = () => {
  const context = useContext(ContexteAuth)
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}

export function ContexteAuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifierAuth()
  }, [])

  const verifierAuth = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const response = await api.get("/auth/me")
        setUtilisateur(response.data)
      } catch (error) {
        console.error("Erreur de vérification:", error)
        localStorage.removeItem("token")
      }
    }
    setLoading(false)
  }

  const connexion = async (email, motDePasse) => {
    try {
      const response = await api.post("/auth/connexion", {
        email,
        motDePasse,
      })
      const { token, utilisateur } = response.data
      if (token && utilisateur) {
        localStorage.setItem("token", token)
        setUtilisateur(utilisateur)
        return utilisateur
      } else {
        throw new Error("Données de connexion invalides")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      throw error
    }
  }

  const deconnexion = () => {
    localStorage.removeItem("token")
    setUtilisateur(null)
  }

  const value = {
    utilisateur,
    loading,
    connexion,
    deconnexion,
  }

  return <ContexteAuth.Provider value={value}>{!loading && children}</ContexteAuth.Provider>
}

