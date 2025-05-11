import GatherTownAppLanding from "./Components/gatherTownAppLanding";
import GatherTownAuth from "./Components/gatherTownAuth";
import GatherTownHomepage from "./Components/gatherTownHomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { axios } from "./Axios/axios";
import { useEffect } from "react";
import { useAuth } from "./Context/UseAuth";
import { config } from "./config";
import EmptySpace from "./Components/EmptySpace";
import { SpaceEditingPage } from "./Components/SpaceEditingPage";
import EmptySpace2 from "./Components/EmptySpace2";

function App() {
  const { isLogin, SetAccessToken } = useAuth();

  useEffect(() => {
    if (!isLogin) {
      const refreshToken = async () => {
        const res = await axios.post(
          `${config.BackendUrl}/refresh`,
          {},
          {
            withCredentials: true,
          }
        );
        if (res.status !== 200) {
          return;
        }
        SetAccessToken(res.data.accessToken, 15 * 60 * 1000, res.data.userId);
      };
      refreshToken();
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GatherTownHomepage />} />
        <Route path="/app" element={<GatherTownAppLanding />} />
        <Route path="/app/space/:spaceId" element={<EmptySpace2 />} />
        <Route path="/app/space/:spaceId/edit" element={<SpaceEditingPage />} />
        <Route path="/login" element={<GatherTownAuth />} />
        <Route path="/signup" element={<GatherTownAuth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
