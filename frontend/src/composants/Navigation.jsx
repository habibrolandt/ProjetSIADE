import { Link, useHistory, useLocation } from "react-router-dom"
import { Nav, Navbar, Container, Button } from "react-bootstrap"
import { useAuth } from "../contexte/ContexteAuth"

export default function Navigation() {
  const { utilisateur, deconnexion } = useAuth()
  const history = useHistory()
  const location = useLocation()

  const handleDeconnexion = () => {
    deconnexion()
    history.push("/login")
  }

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Gestion Présences
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={location.pathname === "/" ? "active" : ""}>
              Tableau de Bord
            </Nav.Link>
            {utilisateur && (utilisateur.role === "admin" || utilisateur.role === "rh") && (
              <>
                <Nav.Link as={Link} to="/employes" className={location.pathname === "/employes" ? "active" : ""}>
                  Gestion Employés
                </Nav.Link>
                <Nav.Link as={Link} to="/export" className={location.pathname === "/export" ? "active" : ""}>
                  Export
                </Nav.Link>
              </>
            )}
            <Nav.Link
              as={Link}
              to="/reconnaissance"
              className={location.pathname === "/reconnaissance" ? "active" : ""}
            >
              Reconnaissance
            </Nav.Link>
            <Nav.Link as={Link} to="/historique" className={location.pathname === "/historique" ? "active" : ""}>
              Historique
            </Nav.Link>
          </Nav>
          {utilisateur ? (
            <Button variant="danger" onClick={handleDeconnexion} className="btn-animate">
              Déconnexion
            </Button>
          ) : (
            <Nav.Link as={Link} to="/login" className="btn btn-primary text-white">
              Connexion
            </Nav.Link>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

