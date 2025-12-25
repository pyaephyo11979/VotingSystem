import App from "@/App";
import { createBrowserRouter } from "react-router-dom";
import { LoginCard } from "@/components/ui/login";
import HomePage from "@/pages/HomePage";
import AdminDashboard from "@/components/AdminDashboard";
import VotingPage from "@/pages/VotingPage";
import ResultsLivePage from "@/pages/ResultsLivePage";

// Route guards removed: routes now accessible directly.

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginCard />,
      },
      { path: "/vote", element: <VotingPage /> },
      { path: "/admin/:eventId", element: <AdminDashboard /> },
      { path: "/admin", element: <AdminDashboard /> },
      {
        path: "/results/:eventId",
        element: <ResultsLivePage />,
      },
    ],
  },
]);

export default router;
