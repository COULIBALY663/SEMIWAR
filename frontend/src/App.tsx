import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { HomeRedirect } from './pages/HomeRedirect';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ClassesPage } from './pages/admin/ClassesPage';
import { ClasseDetailPage } from './pages/admin/ClasseDetailPage';
import { AppelDetailPage } from './pages/admin/AppelDetailPage';
import { ElevesPage } from './pages/admin/ElevesPage';
import { ParentsPage } from './pages/admin/ParentsPage';
import { MatieresPage } from './pages/admin/MatieresPage';
import { TrimestresPage } from './pages/admin/TrimestresPage';
import { StatistiquesPage } from './pages/admin/StatistiquesPage';
import { SignalementsPage } from './pages/admin/SignalementsPage';
import { SmsLogsPage } from './pages/admin/SmsLogsPage';
import { EspaceChefPage } from './pages/chef/EspaceChefPage';
import { EspaceElevePage } from './pages/eleve/EspaceElevePage';
import { EspaceParentPage } from './pages/parent/EspaceParentPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/administrateur" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomeRedirect />} />

                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/classes" element={<ClassesPage />} />
                  <Route path="/admin/classes/:id" element={<ClasseDetailPage />} />
                  <Route path="/admin/appels/:id" element={<AppelDetailPage />} />
                  <Route path="/admin/eleves" element={<ElevesPage />} />
                  <Route path="/admin/parents" element={<ParentsPage />} />
                  <Route path="/admin/matieres" element={<MatieresPage />} />
                  <Route path="/admin/trimestres" element={<TrimestresPage />} />
                  <Route path="/admin/statistiques" element={<StatistiquesPage />} />
                  <Route path="/admin/signalements" element={<SignalementsPage />} />
                  <Route path="/admin/sms-logs" element={<SmsLogsPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['ELEVE']} />}>
                  <Route path="/eleve" element={<EspaceElevePage />} />
                  <Route path="/chef" element={<EspaceChefPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['PARENT']} />}>
                  <Route path="/parent" element={<EspaceParentPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
