import App from "@/App";
import {
  createBrowserRouter,
} from "react-router-dom";
import { LoginCard } from "@/components/ui/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/login",
    element: <LoginCard/>,
  }
]);

export default router;