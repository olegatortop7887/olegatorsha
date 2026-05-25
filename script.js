async function loadSiteData() {
  try {
    const response = await fetch("data/site.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Cannot load data/site.json");
    return await response.json();
  } catch (error) {
    console.error(error);
    return {
      gallery: [
        { image: "photo1.jpeg" },
        { image: "photo2.jpeg" },
        { image: "photo3.jpeg" },
        { image: "photo4.jpeg" }
      ],
      events: [
        {
          title: "Victoria`s birthday",
          date: "29/05",
          description: "Ближайшее мероприятие OLEGATORSHA.",
          image: "photo2.jpeg"
        }
      ]
    };
  }
}

function renderPhotos(gallery) {
  const grid = document.getElementById("photoGrid");
  if (!gallery || !gallery.length) {
    grid.innerHTML = "<p>Фото скоро появятся.</p>";
    return;
  }

  grid.innerHTML = gallery.map(item => `
    <div class="photo-card">
      <img src="${item.image}" alt="OLEGATORSHA photo">
    </div>
  `).join("");
}

function renderEvents(events) {
  const grid = document.getElementById("eventsGrid");
  if (!events || !events.length) {
    grid.innerHTML = "<p>Мероприятия скоро появятся.</p>";
    return;
  }

  grid.innerHTML = events.map(event => `
    <article class="event-card">
      <img src="${event.image}" alt="${event.title}">
      <div class="event-body">
        <div class="event-date">${event.date || ""}</div>
        <h3>${event.title || ""}</h3>
        <p>${event.description || ""}</p>
      </div>
    </article>
  `).join("");
}

loadSiteData().then(data => {
  renderPhotos(data.gallery);
  renderEvents(data.events);
});
// === OLEGATORSHA INTRO ANIMATION ===
window.addEventListener("load", () => {
  const intro = document.querySelector(".intro-screen");
  if (!intro) return;

  setTimeout(() => {
    intro.classList.add("hidden");
  }, 3600);
});
