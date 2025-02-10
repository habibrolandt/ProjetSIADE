import React from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { Nav, Navbar, Container, Button } from "react-bootstrap"
import { useAuth } from "../contexte/ContexteAuth"
import { motion } from "framer-motion"

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
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          Gestion Présences
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link as={Link} to="/" className={location.pathname === "/" ? "active" : ""}>
                Tableau de Bord
              </Nav.Link>
            </motion.div>
            {utilisateur && (utilisateur.role === "admin" || utilisateur.role === "rh") && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link as={Link} to="/employes" className={location.pathname === "/employes" ? "active" : ""}>
                    Gestion Employés
                  </Nav.Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Nav.Link as={Link} to="/export" className={location.pathname === "/export" ? "active" : ""}>
                    Export
                  </Nav.Link>
                </motion.div>
              </>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link
                as={Link}
                to="/reconnaissance"
                className={location.pathname === "/reconnaissance" ? "active" : ""}
              >
                Reconnaissance
              </Nav.Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link as={Link} to="/historique" className={location.pathname === "/historique" ? "active" : ""}>
                Historique
              </Nav.Link>
            </motion.div>
          </Nav>
          {utilisateur ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline-danger" onClick={handleDeconnexion}>
                Déconnexion
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link as={Link} to="/login" className="btn btn-primary text-white">
                Connexion
              </Nav.Link>
            </motion.div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
