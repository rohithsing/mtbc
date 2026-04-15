import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { getUser } from "./apis";

// Pages
import Login from "./pages/Login";
import SeatSelection from "./pages/SeatSelection";
import CancellationPortal from "./pages/CancellationPortal";

import MoviesList from "./pages/MoviesList";
import ShowSelection from "./pages/ShowSelection";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL parameters for JWT
    const params = new URLSearchParams(window.location.search);
    const tokenParams = params.get('token');
    
    if (tokenParams) {
      localStorage.setItem("token", tokenParams);
      // Remove token from URL
      window.history.replaceState({}, document.title, "/");
    }

    const token = localStorage.getItem("token");
    if (token) {
      getUser().then((res) => {
          // If backend issued a fresh token (user was re-created after DB re-seed)
          if (res.data.refreshedToken) {
            localStorage.setItem("token", res.data.refreshedToken);
          }
          setUser(res.data);
      }).catch(() => {
          localStorage.removeItem("token");
          setUser(null);
      }).finally(() => {
          setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/movies" /> : <Login />} />
        <Route path="/movies" element={user ? <MoviesList user={user} /> : <Navigate to="/" />} />
        <Route path="/movie/:movieId" element={user ? <ShowSelection /> : <Navigate to="/" />} />
        <Route path="/booking/:showId" element={user ? <SeatSelection user={user} /> : <Navigate to="/" />} />
        <Route path="/cancel/:bookingId" element={user ? <CancellationPortal user={user}/> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
