import { useState } from "react"
import { useHistory } from "react-router-dom"
import { Form, Button, Card, Container, Alert } from "react-bootstrap"
import { useAuth } from "../contexte/ContexteAuth"
import { toast } from "react-toastify"

export default function Authentification() {
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { connexion } = useAuth()
  const history = useHistory()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await connexion(email, motDePasse)
      toast.success("Connexion réussie")
      history.push("/")
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la connexion")
      toast.error(error.response?.data?.message || "Erreur lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Connexion</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
              </Form.Group>

              <Button className="w-100" type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}

