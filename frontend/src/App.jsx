import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { ContexteAuthProvider } from "./contexte/ContexteAuth"
import RoutePrivee from "./composants/RoutePrivee"
import Navigation from "./composants/Navigation"
import Authentification from "./composants/Authentification"
import TableauDeBord from "./composants/TableauDeBord"
import GestionEmployes from "./composants/GestionEmployes"
import ReconnaissanceFaciale from "./composants/ReconnaissanceFaciale"
import HistoriquePresences from "./composants/HistoriquePresences"
import ExportDonnees from "./composants/ExportDonnees"

export default function App() {
  return (
    <ContexteAuthProvider>
      <Router>
        <div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          <Switch>
            <Route path="/login" component={Authentification} />
            <RoutePrivee path="/">
              <div className="d-flex">
                <Navigation />
                <main className="flex-grow-1 p-4">
                  <Switch>
                    <Route exact path="/" component={TableauDeBord} />
                    <Route path="/employes" component={GestionEmployes} />
                    <Route path="/reconnaissance" component={ReconnaissanceFaciale} />
                    <Route path="/historique" component={HistoriquePresences} />
                    <Route path="/export" component={ExportDonnees} />
                  </Switch>
                </main>
              </div>
            </RoutePrivee>
          </Switch>
        </div>
      </Router>
    </ContexteAuthProvider>
  )
}

