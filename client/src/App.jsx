import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { lazy, useEffect } from "react";
import RootPageLayout from "./Pages/mainlayout/RootPageLayout";
import { getAuthState } from "./store/slices/authSlice";
import { updateOnlineStatus } from "./store/slices/appSlice";
const Signin = lazy(() => import("./Pages/Signin.page"));
const Signup = lazy(() => import("./Pages/Signup.page"));
const Forgotpassowrd = lazy(() => import("./Pages/Forgotpassowrd.page"));
const Page404 = lazy(() => import("./Pages/Page404"));
const SettingsPage = lazy(() => import("./Pages/Setting.page"));
const GroupPage = lazy(() => import("./Pages/Group.page"));
const DefaultPage = lazy(() => import("./Pages/Home.page"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword.page"));
const ProfilePage = lazy(() => import("./Pages/Profile.page"));
// const RootPageLayout = lazy(() =>
//   import("./Pages/mainlayout/RootPageLayout")
// );

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    let theme = localStorage.getItem("data-theme");
    document.body.setAttribute("data-theme", theme);
  }, []);
  useEffect(() => {
    function checkOnlineStatus() {
      if (navigator.onLine) {
        dispatch(updateOnlineStatus({ status: navigator.onLine }));
      } else {
        dispatch(updateOnlineStatus({ status: navigator.onLine }));
      }
    }

    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);

    // Initial check when the component mounts
    checkOnlineStatus();

    return () => {
      window.removeEventListener("online", checkOnlineStatus);
      window.removeEventListener("offline", checkOnlineStatus);
    };
  }, []);
  const user = useSelector(getAuthState);

  const router = createBrowserRouter([
    {
      path: "/",
      element: user ? <RootPageLayout /> : <Navigate to="/login" />,

      children: [
        {
          index: true,
          element: <DefaultPage />,
        },
        {
          path: "group",
          element: <GroupPage />,
        },

        {
          path: "settings",
          element: <SettingsPage />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
        },
      ],
    },
    {
      path: "/login",
      element: <Signin />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/forgot-password",
      element: <Forgotpassowrd />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "*",
      element: <Page404 />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
