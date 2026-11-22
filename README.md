# Campus Connect — Event Management System
**Sarala Birla University**

One React + Vite app with two sides that share the same data:

| URL | What it is |
| --- | --- |
| `/` | Student site: browse events, search and filter, event details |
| `/login` | Student and Faculty / Admin login |
| `/events`, `/my-events`, `/notifications`, `/profile`, `/about` | Student pages (My Events, Notifications and Profile need login) |
| `/admin` | Admin panel: dashboard, add / archive events, registrations, notifications |

## Run it

```bash
npm install
npm run dev        # development  -> http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Logging in (demo, no backend)

* **Student:** ID like `SBU2400680`, password like `SBU#18741` (`SBU` + 2-digit joining year + 5 digits / `SBU#` + 5 digits).
* **Faculty / Admin:** any email and password.

Student and admin sessions are independent, so you can keep the **admin panel in one tab and the student site in another** and watch changes appear live.

## How the two sides connect

Data lives in the browser's `localStorage`, and every change is broadcast to all open tabs.

* Admin **adds an event** → it appears on the student site (banner, fee, payment QR, registration window).
* Students can only register **inside the registration window**, and only if eligible (batch-restricted events check the student's year).
* Student **registers** → a ticket is created and the admin sees it in *Registrations* (filter, search, **CSV export**).
* Admin **publishes a notification** → students see it (all students, or one year) with an unread badge.
* Admin **archives** an event → it disappears from the student site but stays in Event History.

The admin *Profile* tab has **Reset to sample data** and **Clear all event data**, handy before a presentation. Sample events load automatically the first time the site opens, with dates relative to today.

## Project structure

```
src/
  App.jsx        routes
  config.js      university name, categories, storage keys
  context/       auth + toast/confirm dialogs
  utils/         storage, dates, seed data, images, csv, student helpers
  pages/         login, 404
  student/       student site (layout, pages, modals, styles)
  admin/         admin panel (dashboard, add-event form, sidebar, styles)
```

## Notes

* Authentication and storage are **front-end only** (localStorage), which suits a demo. For real use, add a backend and database; `utils/storage.js` is the one place to swap out.
* Data is per browser and per address: keep using the same URL (e.g. `localhost:5173`) to keep your data.
* On static hosting, route all paths to `index.html` (a Netlify `_redirects` file is included).
