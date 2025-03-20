import GatherTownAppLanding from "./Components/gatherTownAppLanding";
import GatherTownAuth from "./Components/gatherTownAuth";
import GatherTownHomepage from "./Components/gatherTownHomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { axios } from './Axios/axios'
import { useEffect } from "react";
import { useAuth } from "./Context/UseAuth";

function App() {
  const { isLogin, SetAccessToken } = useAuth();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!isLogin) {
      const refreshToken = async() => {
        const res = await axios.post(`${BackendUrl}/refresh`)
        if (res.status !== 200) {
          return;
        }
        SetAccessToken(res.data.accessToken)
      }
      refreshToken();
    }
  })

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GatherTownHomepage />} />
        <Route path="/app" element={<GatherTownAppLanding />} />
        <Route path="/login" element={<GatherTownAuth/>} />
        <Route path="/signup" element={<GatherTownAuth/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
