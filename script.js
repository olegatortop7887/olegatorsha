let siteData = { gallery: [], events: [] };
let currentLanguage = localStorage.getItem("olegatorsha_language") || "ru";
let carouselIndex = 0;
let lightboxImages = [];
let lightboxIndex = 0;

const translations = {
  ru: { navPhotos:"Фото", navEvents:"Мероприятия", navBooking:"Заказать", heroPhotos:"Смотреть фото", heroEvents:"Мероприятия", photosTitle:"Фото", photosText:"Фотографии с мероприятий OLEGATORSHA.", eventsTitle:"Мероприятия", eventsText:"Ближайшие и прошедшие мероприятия.", upcomingTitle:"Ближайшие мероприятия", pastTitle:"Прошедшие мероприятия", bookingTitle:"Заказать OLEGATORSHA", bookingText:"Для заказа выступления, мероприятия или шоу:", more:"Подробнее", organizer:"Организатор", place:"Место", role:"Моя роль", links:"Ссылки", eventPhotos:"Фото мероприятия", noEvents:"Пока нет мероприятий.", noPhotos:"Фото скоро появятся." },
  he: { navPhotos:"תמונות", navEvents:"אירועים", navBooking:"להזמנה", heroPhotos:"צפייה בתמונות", heroEvents:"אירועים", photosTitle:"תמונות", photosText:"תמונות מאירועים של OLEGATORSHA.", eventsTitle:"אירועים", eventsText:"אירועים קרובים ואירועים קודמים.", upcomingTitle:"אירועים קרובים", pastTitle:"אירועים קודמים", bookingTitle:"להזמנת OLEGATORSHA", bookingText:"להזמנת הופעה, אירוע או שואו:", more:"פרטים נוספים", organizer:"מארגן", place:"מקום", role:"התפקיד שלי", links:"קישורים", eventPhotos:"תמונות מהאירוע", noEvents:"אין אירועים כרגע.", noPhotos:"תמונות יופיעו בקרוב." },
  en: { navPhotos:"Photos", navEvents:"Events", navBooking:"Booking", heroPhotos:"View photos", heroEvents:"Events", photosTitle:"Photos", photosText:"Photos from OLEGATORSHA events.", eventsTitle:"Events", eventsText:"Upcoming and past events.", upcomingTitle:"Upcoming events", pastTitle:"Past events", bookingTitle:"Book OLEGATORSHA", bookingText:"For booking a performance, event or show:", more:"More details", organizer:"Organizer", place:"Place", role:"My role", links:"Links", eventPhotos:"Event photos", noEvents:"No events yet.", noPhotos:"Photos coming soon." }
};

function t(key){ return translations[currentLanguage][key] || translations.ru[key] || key; }
function localized(item, field){ return item[`${field}_${currentLanguage}`] || item[`${field}_ru`] || item[field] || ""; }

function setLanguage(lang){
  currentLanguage = lang;
  localStorage.setItem("olegatorsha_language", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  applyTranslations();
  renderAll();
}

function applyTranslations(){
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll(".language-switcher button").forEach(btn => btn.classList.toggle("active", btn.textContent.toLowerCase() === currentLanguage));
}

async function loadSiteData(){
  try{
    const response = await fetch("data/site.json", { cache: "no-store" });
    if(!response.ok) throw new Error("Cannot load data/site.json");
    return await response.json();
  } catch(error){
    console.error(error);
    return {
      gallery:[{image:"photo1.jpeg"},{image:"photo2.jpeg"},{image:"photo3.jpeg"},{image:"photo4.jpeg"}],
      events:[{status:"upcoming",date:"29/05",title_ru:"Victoria`s birthday",title_he:"יום ההולדת של ויקטוריה",title_en:"Victoria`s birthday",place_ru:"Star Loft",organizer_ru:"Victoria",role_ru:"Участник / performer",description_ru:"Ближайшее мероприятие OLEGATORSHA.",image:"photo2.jpeg",links:[],event_gallery:[]}]
    };
  }
}

function renderCarousel(gallery){
  const carousel = document.getElementById("photoCarousel");
  if(!gallery || !gallery.length){ carousel.innerHTML = `<p>${t("noPhotos")}</p>`; return; }
  if(carouselIndex >= gallery.length) carouselIndex = 0;
  carousel.innerHTML = gallery.map((item,index)=>`
    <div class="carousel-slide ${index===carouselIndex ? "active" : ""}" onclick="openLightbox(${index}, 'main')">
      <img src="${item.image}" alt="OLEGATORSHA photo">
    </div>
  `).join("");
}

function moveCarousel(direction){
  const gallery = siteData.gallery || [];
  if(!gallery.length) return;
  carouselIndex = (carouselIndex + direction + gallery.length) % gallery.length;
  renderCarousel(gallery);
}

function eventCard(event,index,type){
  const desc = localized(event,"description");
  return `
    <article class="event-card" onclick="openEventModal('${type}', ${index})">
      <img src="${event.image || "photo1.jpeg"}" alt="${localized(event,"title")}">
      <div class="event-body">
        <div class="event-date">${event.date || ""}</div>
        <h3>${localized(event,"title")}</h3>
        <p>${desc.slice(0,140)}${desc.length > 140 ? "..." : ""}</p>
        <button class="details-btn" type="button">${t("more")}</button>
      </div>
    </article>`;
}

function renderEvents(events){
  const upcomingGrid = document.getElementById("upcomingEventsGrid");
  const pastGrid = document.getElementById("pastEventsGrid");
  const upcoming = (events || []).filter(e => e.status !== "past");
  const past = (events || []).filter(e => e.status === "past");
  upcomingGrid.innerHTML = upcoming.length ? upcoming.map((event,index)=>eventCard(event,index,"upcoming")).join("") : `<p>${t("noEvents")}</p>`;
  pastGrid.innerHTML = past.length ? past.map((event,index)=>eventCard(event,index,"past")).join("") : `<p>${t("noEvents")}</p>`;
}

function getEventByType(type,index){
  const list = type === "past" ? (siteData.events||[]).filter(e=>e.status==="past") : (siteData.events||[]).filter(e=>e.status!=="past");
  return list[index];
}

function openEventModal(type,index){
  const event = getEventByType(type,index);
  if(!event) return;
  const links = event.links || [];
  const photos = event.event_gallery || [];
  document.getElementById("eventModalBody").innerHTML = `
    <img class="modal-cover" src="${event.image || "photo1.jpeg"}" alt="${localized(event,"title")}">
    <div class="modal-info">
      <p class="event-date">${event.date || ""}</p>
      <h2>${localized(event,"title")}</h2>
      <div class="modal-meta">
        ${localized(event,"place") ? `<p><strong>${t("place")}:</strong> ${localized(event,"place")}</p>` : ""}
        ${localized(event,"organizer") ? `<p><strong>${t("organizer")}:</strong> ${localized(event,"organizer")}</p>` : ""}
        ${localized(event,"role") ? `<p><strong>${t("role")}:</strong> ${localized(event,"role")}</p>` : ""}
      </div>
      <p class="modal-description">${localized(event,"description").replace(/\\n/g,"<br>")}</p>
      ${links.length ? `<h3>${t("links")}</h3><div class="modal-links">${links.map(link=>`<a href="${link.url}" target="_blank">${localized(link,"label") || link.url}</a>`).join("")}</div>` : ""}
      ${photos.length ? `<h3>${t("eventPhotos")}</h3><div class="modal-gallery">${photos.map((photo,photoIndex)=>`<img src="${photo.image}" onclick='openLightbox(${photoIndex}, "event", ${JSON.stringify(photos.map(p=>p.image))})' alt="">`).join("")}</div>` : ""}
    </div>`;
  document.getElementById("eventModal").classList.add("open");
  document.body.classList.add("modal-open");
}
function closeEventModal(){ document.getElementById("eventModal").classList.remove("open"); document.body.classList.remove("modal-open"); }

function openLightbox(index, source, customImages){
  lightboxImages = (source === "event" && Array.isArray(customImages)) ? customImages : (siteData.gallery || []).map(item=>item.image);
  if(!lightboxImages.length) return;
  lightboxIndex = index;
  document.getElementById("lightboxImage").src = lightboxImages[lightboxIndex];
  document.getElementById("lightbox").classList.add("open");
}
function moveLightbox(direction){
  if(!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  document.getElementById("lightboxImage").src = lightboxImages[lightboxIndex];
}
function closeLightbox(){ document.getElementById("lightbox").classList.remove("open"); }
function renderAll(){ renderCarousel(siteData.gallery || []); renderEvents(siteData.events || []); }

window.addEventListener("load", async ()=>{
  const intro = document.querySelector(".intro-screen");
  if(intro) setTimeout(()=>intro.classList.add("hidden"), 3600);
  siteData = await loadSiteData();
  applyTranslations();
  renderAll();
});
