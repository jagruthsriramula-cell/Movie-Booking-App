const API = "/api";
let token = localStorage.getItem("movieToken") || "";
let role = localStorage.getItem("movieRole") || "";
let moviesCache = [];
let bookingModal;

const $ = id => document.getElementById(id);

function showAlert(message, type = "info") {
  $("alertBox").innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${escapeHtml(message)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(API + path, { ...options, headers });
  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    if (response.status === 401 && path !== "/login") logout(false);
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

function setLoggedIn() {
  $("loginSection").classList.add("d-none");
  $("logoutBtn").classList.remove("d-none");
  $("userInfo").textContent = `${role.toUpperCase()} • Logged in`;
  if (role === "user") {
    $("userSection").classList.remove("d-none");
    $("theaterSection").classList.add("d-none");
    loadMovies(); loadBookings();
  } else {
    $("theaterSection").classList.remove("d-none");
    $("userSection").classList.add("d-none");
    loadTheaterMovies();
  }
}
function setLoggedOut() {
  $("loginSection").classList.remove("d-none");
  $("userSection").classList.add("d-none");
  $("theaterSection").classList.add("d-none");
  $("logoutBtn").classList.add("d-none");
  $("userInfo").textContent = "";
}
function logout(callApi = true) {
  if (callApi && token) api("/logout", { method:"POST" }).catch(()=>{});
  token = ""; role = "";
  localStorage.removeItem("movieToken"); localStorage.removeItem("movieRole");
  setLoggedOut();
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await api("/login", { method:"POST", body: JSON.stringify({ email:$("email").value, password:$("password").value }) });
    token = data.token; role = data.role;
    localStorage.setItem("movieToken", token); localStorage.setItem("movieRole", role);
    showAlert("Login successful", "success"); setLoggedIn();
  } catch (err) { showAlert(err.message, "danger"); }
});

$("logoutBtn").addEventListener("click", () => logout(true));
$("refreshMoviesBtn").addEventListener("click", loadMovies);
$("refreshBookingsBtn").addEventListener("click", loadBookings);
$("refreshTheaterBtn").addEventListener("click", loadTheaterMovies);

async function loadMovies() {
  try {
    moviesCache = await api("/movies");
    $("movieList").innerHTML = moviesCache.length ? moviesCache.map(movie => `
      <div class="col-md-6 col-lg-4"><div class="card movie-card shadow-sm border-0">
        <div class="card-body"><span class="badge text-bg-primary mb-2">${escapeHtml(movie.language)}</span>
        <h4>${escapeHtml(movie.title)}</h4><p class="text-muted mb-3">${movie.duration} minutes</p>
        <div class="mb-3">${movie.showTimes.map(t => `<span class="badge rounded-pill text-bg-light border showtime-badge">${escapeHtml(t)}</span>`).join("")}</div>
        <button class="btn btn-primary w-100" onclick="openBooking('${movie._id}','${escapeHtml(movie.title)}')">Book Seat</button></div>
      </div></div>`).join("") : `<div class="col-12"><div class="empty-state">No movies available.</div></div>`;
  } catch (err) { showAlert(err.message, "danger"); }
}

function openBooking(id, title) {
  const movie = moviesCache.find(m => String(m._id) === String(id));
  $("bookingMovieId").value = id; $("bookingMovieTitle").value = title;
  $("bookingShowTime").innerHTML = movie.showTimes.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
  $("bookingDate").value = new Date().toISOString().slice(0,10);
  $("bookingSeat").value = "";
  bookingModal.show();
}

$("bookingForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await api("/bookings", { method:"POST", body: JSON.stringify({ movieId:$("bookingMovieId").value, date:$("bookingDate").value, showTime:$("bookingShowTime").value, seatNo:$("bookingSeat").value }) });
    bookingModal.hide(); showAlert("Seat booked successfully", "success"); loadBookings();
  } catch (err) { showAlert(err.message, "danger"); }
});

async function loadBookings() {
  try {
    const bookings = await api("/bookings");
    $("bookingList").innerHTML = bookings.length ? bookings.map(b => `
      <div class="booking-row d-flex flex-wrap justify-content-between gap-2"><div><strong>Movie ID:</strong> ${escapeHtml(b.movieId)}<br><strong>Date:</strong> ${escapeHtml(b.date)} &nbsp; <strong>Show:</strong> ${escapeHtml(b.showTime)} &nbsp; <strong>Seat:</strong> ${escapeHtml(b.seatNo)}</div><span class="badge text-bg-success align-self-start">Booked</span></div>`).join("") : `<div class="empty-state">You have no bookings yet.</div>`;
  } catch (err) { showAlert(err.message, "danger"); }
}

function getShowTimes() { return [...document.querySelectorAll(".show-time")].map(x => x.value); }
function resetMovieForm() {
  $("movieForm").reset(); $("editMovieId").value = ""; $("movieFormTitle").textContent = "Add Movie"; $("movieSubmitBtn").textContent = "Add Movie"; $("cancelEditBtn").classList.add("d-none");
}
$("cancelEditBtn").addEventListener("click", resetMovieForm);

$("movieForm").addEventListener("submit", async e => {
  e.preventDefault();
  const body = { title:$("movieTitle").value, language:$("movieLanguage").value, duration:Number($("movieDuration").value), showTimes:getShowTimes() };
  const id = $("editMovieId").value;
  try {
    if (id) await api(`/movies/${id}`, { method:"PUT", body:JSON.stringify(body) });
    else await api("/movies", { method:"POST", body:JSON.stringify(body) });
    showAlert(id ? "Movie updated" : "Movie added", "success"); resetMovieForm(); loadTheaterMovies();
  } catch (err) { showAlert(err.message, "danger"); }
});

async function loadTheaterMovies() {
  try {
    const movies = await api("/theater/movies");
    $("theaterMovieList").innerHTML = movies.length ? movies.map(movie => `
      <div class="col-md-6 col-lg-4"><div class="card movie-card shadow-sm border-0"><div class="card-body">
        <span class="badge text-bg-secondary mb-2">${escapeHtml(movie.language)}</span><h4>${escapeHtml(movie.title)}</h4><p class="text-muted">${movie.duration} minutes</p>
        <div class="mb-3">${movie.showTimes.map(t => `<span class="badge rounded-pill text-bg-light border showtime-badge">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="d-flex gap-2"><button class="btn btn-outline-primary flex-fill" onclick='editMovie(${JSON.stringify(movie)})'>Edit</button><button class="btn btn-outline-danger flex-fill" onclick="deleteMovie('${movie._id}')">Delete</button></div>
      </div></div></div>`).join("") : `<div class="col-12"><div class="empty-state">No movies added by this theater.</div></div>`;
  } catch (err) { showAlert(err.message, "danger"); }
}

window.editMovie = movie => {
  $("editMovieId").value = movie._id; $("movieTitle").value = movie.title; $("movieLanguage").value = movie.language; $("movieDuration").value = movie.duration;
  document.querySelectorAll(".show-time").forEach((x,i) => x.value = movie.showTimes[i] || "");
  $("movieFormTitle").textContent = "Update Movie"; $("movieSubmitBtn").textContent = "Update Movie"; $("cancelEditBtn").classList.remove("d-none"); window.scrollTo({top:0, behavior:"smooth"});
};
window.deleteMovie = async id => {
  if (!confirm("Delete this movie? Related bookings will also be deleted by the backend.")) return;
  try { await api(`/movies/${id}`, { method:"DELETE" }); showAlert("Movie removed", "success"); loadTheaterMovies(); }
  catch (err) { showAlert(err.message, "danger"); }
};

bookingModal = new bootstrap.Modal($("bookingModal"));
if (token && role) setLoggedIn(); else setLoggedOut();
