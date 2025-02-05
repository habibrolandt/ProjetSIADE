import { useRef, useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "react-toastify"

export default function ReconnaissanceFaciale() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [cameras, setCameras] = useState([])
  const [cameraActive, setCameraActive] = useState("")

  useEffect(() => {
    // Récupérer la liste des caméras disponibles
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setCameras(videoDevices)
        if (videoDevices.length > 0) {
          setCameraActive(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des caméras:", error)
        toast.error("Impossible d'accéder aux caméras")
      }
    }

    getCameras()
  }, [])

  useEffect(() => {
    if (cameraActive) {
      startCamera()
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraActive, stream]) // Added stream to dependencies

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: cameraActive ? { exact: cameraActive } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error)
      toast.error("Impossible d'accéder à la caméra")
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null

    const context = canvasRef.current.getContext("2d")
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    return canvasRef.current.toDataURL("image/jpeg")
  }

  const handleReconnaissance = async () => {
    setLoading(true)
    setResultat(null)

    try {
      const imageData = captureImage()
      if (!imageData) {
        throw new Error("Impossible de capturer l'image")
      }

      const response = await api.post("/reconnaissance-faciale", {
        image: imageData,
      })

      if (response.data.success) {
        setResultat(response.data)
        toast.success("Présence enregistrée avec succès")
      } else {
        toast.warning("Personne non reconnue")
      }
    } catch (error) {
      console.error("Erreur lors de la reconnaissance:", error)
      toast.error("Erreur lors de la reconnaissance faciale")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reconnaissance Faciale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une caméra</label>
            <select
              value={cameraActive}
              onChange={(e) => setCameraActive(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Caméra ${camera.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>

          <div className="relative aspect-video mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <button
            onClick={handleReconnaissance}
            disabled={loading}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Reconnaissance en cours..." : "Lancer la reconnaissance"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Résultat</h2>

          {resultat ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={resultat.photo || "/placeholder.svg"}
                  alt="Photo de l'employé"
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium">
                    {resultat.prenom} {resultat.nom}
                  </h3>
                  <p className="text-sm text-gray-500">{resultat.poste}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  Présence enregistrée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">En attente d'une reconnaissance...</p>
          )}
        </div>
      </div>
    </div>
  )
}

