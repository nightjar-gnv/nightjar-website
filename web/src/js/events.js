// ===== CONFIG — fill these in =====
const CALENDAR_ID = "f47813df05cc1e6708e514a8ca2036b61802c80739ba0eeba3fcabcfce81c6c4@group.calendar.google.com";
const API_KEY = "AIzaSyDesws55psRt1IX2ggC233XdKZ7BJ-GTW4";
const MAX_EVENTS = 8;    // how many events the list shows
const FETCH_COUNT = 25;  // how many upcoming events to scan for flyers
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone; // visitor's time zone
// ==================================

// 1. Embed the calendar iframe
document.getElementById("calendar-frame").src =
  "https://calendar.google.com/calendar/embed" +
  "?src=" + encodeURIComponent(CALENDAR_ID) +
  "&ctz=" + encodeURIComponent(TIME_ZONE);

// 2. Load upcoming events, then fill the list and the flyer carousel
async function loadUpcomingEvents() {
  const list = document.getElementById("event-list");

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: new Date().toISOString(),
    maxResults: FETCH_COUNT,
    singleEvents: "true", // expand recurring events into individual instances
    orderBy: "startTime",
  });

  const url =
    "https://www.googleapis.com/calendar/v3/calendars/" +
    encodeURIComponent(CALENDAR_ID) +
    "/events?" + params;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || res.statusText);
    }

    const data = await res.json();
    const events = data.items || [];

    // Event list (first few only)
    list.innerHTML = "";
    if (events.length === 0) {
      list.innerHTML = '<li class="status">No upcoming events.</li>';
    } else {
      events.slice(0, MAX_EVENTS).forEach((event) => list.appendChild(renderEvent(event)));
    }

    // Flyer carousel (any upcoming event that has a flyer)
    renderCarousel(events);
  } catch (err) {
    list.innerHTML = "";
    const li = document.createElement("li");
    li.className = "status error";
    li.textContent = "Couldn't load events: " + err.message;
    list.appendChild(li);
  }
}

function renderEvent(event) {
  const li = document.createElement("li");

  const title = document.createElement("p");
  title.className = "event-title";
  title.textContent = event.summary || "(No title)";

  const time = document.createElement("p");
  time.className = "event-time";
  time.textContent = formatEventTime(event);

  li.append(title, time);

  if (event.location) {
    const loc = document.createElement("p");
    loc.className = "event-location";
    loc.textContent = "📍 " + event.location;
    li.appendChild(loc);
  }

  return li;
}

function formatEventTime(event) {
  // All-day events use start.date ("2026-11-05"); timed events use start.dateTime
  if (event.start.date) {
    const [y, m, d] = event.start.date.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    return day.toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    }) + " · All day";
  }

  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);

  const datePart = start.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeOpts = { hour: "numeric", minute: "2-digit" };

  return `${datePart} · ${start.toLocaleTimeString(undefined, timeOpts)} – ${end.toLocaleTimeString(undefined, timeOpts)}`;
}

// ===== Flyers =====

// Looks for a line like "Flyer: https://..." in the event description
function getFlyerUrl(event) {
  if (!event.description) return null;

  // Descriptions can contain HTML; convert to plain text, keeping line breaks
  const html = event.description.replace(/<br\s*\/?>|<\/p>|<\/div>/gi, "\n");
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent;

  const match = text.match(/flyer:\s*(https?:\/\/\S+)/i);
  return match ? toImageUrl(match[1]) : null;
}

// Turns a Google Drive share link into a direct image URL; other URLs pass through
function toImageUrl(url) {
  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/);
  if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1000`;
  return url;
}

function renderCarousel(events) {
  const section = document.getElementById("flyers");
  const track = document.getElementById("carousel-track");
  track.innerHTML = "";

  const withFlyers = events
    .map((event) => ({ event, flyer: getFlyerUrl(event) }))
    .filter((item) => item.flyer);

  if (withFlyers.length === 0) {
    section.hidden = true;
    return;
  }

  withFlyers.forEach(({ event, flyer }) => {
    const figure = document.createElement("figure");
    figure.className = "flyer";
    figure.tabIndex = 0; // lets keyboard users reveal the caption too

    const img = document.createElement("img");
    img.src = flyer;
    img.alt = `Flyer for ${event.summary || "event"}`;
    img.loading = "lazy";
    img.onerror = () => {
      // Drop flyers that fail to load; hide the section if none are left
      figure.remove();
      if (!track.children.length) section.hidden = true;
      updateCarouselButtons();
    };

    const caption = document.createElement("figcaption");
    const title = document.createElement("span");
    title.className = "flyer-title";
    title.textContent = event.summary || "(No title)";
    const date = document.createElement("span");
    date.className = "flyer-date";
    date.textContent = formatEventTime(event);
    caption.append(title, date);

    figure.append(img, caption);
    track.appendChild(figure);
  });

  section.hidden = false;
  updateCarouselButtons();
}

// Carousel arrow buttons
const track = document.getElementById("carousel-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

prevBtn.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth * 0.8 }));
nextBtn.addEventListener("click", () => track.scrollBy({ left: track.clientWidth * 0.8 }));
track.addEventListener("scroll", updateCarouselButtons);
window.addEventListener("resize", updateCarouselButtons);

function updateCarouselButtons() {
  const maxScroll = track.scrollWidth - track.clientWidth;
  prevBtn.hidden = track.scrollLeft <= 1;
  nextBtn.hidden = track.scrollLeft >= maxScroll - 1;
}

loadUpcomingEvents();
