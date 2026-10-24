# Movie Booking App - Frontend + Backend

This package contains the original backend unchanged plus a local HTML5/CSS/Bootstrap/JavaScript frontend.

## Run

1. Start MongoDB on `mongodb://127.0.0.1:27017`.
2. Terminal 1:
```bash
cd backend
npm install
npm run seed
npm start
```
Backend: `http://localhost:3000`

3. Terminal 2:
```bash
cd frontend
npm start
```
Open `http://localhost:4000`.

The frontend server provides a small `/api` reverse proxy. This does not change the backend routes, database logic, session logic, RBAC, booking constraints, or aggregation/CORS behavior.

## Demo accounts

User: `user@test.com` / `user123`

Theater: `theater@test.com` / `theater123`

## Frontend functions

### User
- Login/logout
- View movies and show times
- Book a seat
- Select date/show time/seat number
- View own bookings
- Display backend validation errors

### Theater
- Login/logout
- View own movies
- Add movie
- Update movie
- Delete movie
- Exactly four show-time fields

## Existing backend routes used

POST `/login`
POST `/logout`
GET `/movies`
POST `/bookings`
GET `/bookings`
GET `/theater/movies`
POST `/movies`
PUT `/movies/:movieId`
DELETE `/movies/:movieId`

Bootstrap 5.3.6 CSS and JavaScript are included locally in `frontend/bootstrap/`.
