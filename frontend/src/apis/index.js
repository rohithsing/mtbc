import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const getUser = () => API.get("/auth/me");

// Booking
export const getMyBookings = () => API.get("/booking"); // Ensure the backend gets bookings by user ideally
export const createBooking = (data) => API.post("/booking", data);
export const cancelBooking = (id, data) => API.post(`/booking/${id}/cancel`, data);
export const getShowSeats = (showId) => API.get(`/booking/show/${showId}/seats`);

// Movies
export const getMovies = () => API.get("/movies");
export const getShowsByMovie = (movieId) => API.get(`/movies/shows/${movieId}`);
