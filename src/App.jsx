import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import UIProvider from "./context/UIProvider";
import RegistrationProvider from "./context/RegistrationProvider";
import { RequireAdmin, RequireStudent, ScrollToTop } from "./components/RouteGuards";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./admin/AdminDashboard";
import StudentLayout from "./student/StudentLayout";
import Home from "./student/pages/Home";
import Events from "./student/pages/Events";
import MyEvents from "./student/pages/MyEvents";
import Notifications from "./student/pages/Notifications";
import Certificates from "./student/pages/Certificates";
import EditProfile from "./student/pages/EditProfile";
import About from "./student/pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <RegistrationProvider>
            <ScrollToTop />

            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                }
              />

              <Route element={<StudentLayout />}>
                <Route index element={<Home />} />
                <Route path="events" element={<Events />} />
                <Route path="about" element={<About />} />

                <Route
                  path="my-events"
                  element={
                    <RequireStudent>
                      <MyEvents />
                    </RequireStudent>
                  }
                />

                <Route
                  path="notifications"
                  element={
                    <RequireStudent>
                      <Notifications />
                    </RequireStudent>
                  }
                />

                <Route
                  path="certificates"
                  element={
                    <RequireStudent>
                      <Certificates />
                    </RequireStudent>
                  }
                />

                <Route
                  path="profile"
                  element={
                    <RequireStudent>
                      <EditProfile />
                    </RequireStudent>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </RegistrationProvider>
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}