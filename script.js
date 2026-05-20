const defaultPhotos = [
  "photo1.jpeg",
  "photo2.jpeg",
  "photo3.jpeg",
  "photo4.jpeg"
];

const defaultEvents = [
  {
    title: "Victoria`s birthday",
    date: "29/05",
    description: "Ближайшее мероприятие OLEGATORSHA.",
    image: "images/photo2.jpeg"
  }
];

function getPhotos() {
  return JSON.parse(localStorage.getItem("olegatorsha_photos")) || defaultPhotos;
}

function savePhotos(photos) {
  localStorage.setItem("olegatorsha_photos", JSON.stringify(photos));
}

function getEvents() {
  return JSON.parse(localStorage.getItem("olegatorsha_events")) || defaultEvents;
}

function saveEvents(events) {
  localStorage.setItem("olegatorsha_events", JSON.stringify(events));
}

function renderPhotos() {
  const grid = document.getElementById("photoGrid");
  const photos = getPhotos();

  grid.innerHTML = photos.map((photo, index) => `
    <div class="photo-card">
      <img src="${photo}" alt="OLEGATORSHA photo">
      <button class="delete-btn" onclick="deletePhoto(${index})">Удалить</button>
    </div>
  `).join("");
}

function addPhotos() {
  const input = document.getElementById("photoInput");
  const files = Array.from(input.files);

  if (!files.length) {
    alert("Выбери фото");
    return;
  }

  const photos = getPhotos();
  let loaded = 0;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(event) {
      photos.push(event.target.result);
      loaded++;

      if (loaded === files.length) {
        savePhotos(photos);
        input.value = "";
        renderPhotos();
      }
    };
    reader.readAsDataURL(file);
  });
}

function deletePhoto(index) {
  const photos = getPhotos();
  photos.splice(index, 1);
  savePhotos(photos);
  renderPhotos();
}

function resetPhotos() {
  localStorage.removeItem("olegatorsha_photos");
  renderPhotos();
}

function renderEvents() {
  const grid = document.getElementById("eventsGrid");
  const events = getEvents();

  grid.innerHTML = events.map((event, index) => `
    <article class="event-card">
      <img src="${event.image}" alt="${event.title}">
      <button class="delete-btn" onclick="deleteEvent(${index})">Удалить</button>
      <div class="event-body">
        <div class="event-date">${event.date}</div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
      </div>
    </article>
  `).join("");
}

function addEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value.trim();
  const description = document.getElementById("eventDescription").value.trim();
  const imageInput = document.getElementById("eventImage");
  const file = imageInput.files[0];

  if (!title || !date || !description) {
    alert("Заполни название, дату и описание");
    return;
  }

  const add = (image) => {
    const events = getEvents();
    events.unshift({ title, date, description, image });
    saveEvents(events);

    document.getElementById("eventTitle").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventDescription").value = "";
    imageInput.value = "";

    renderEvents();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => add(e.target.result);
    reader.readAsDataURL(file);
  } else {
    add("images/photo1.jpeg");
  }
}

function deleteEvent(index) {
  const events = getEvents();
  events.splice(index, 1);
  saveEvents(events);
  renderEvents();
}

renderPhotos();
renderEvents();
