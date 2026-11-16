const teams = [
  {
    slug: "vasco-da-gama",
    name: "Vasco da Gama",
    stadium: "São Januário",
    founded: "1898",
    glow: "#d9a623",
  },
  {
    slug: "liverpool",
    name: "Liverpool",
    stadium: "Anfield",
    founded: "1892",
    glow: "#d00027",
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    stadium: "Camp Nou",
    founded: "1899",
    glow: "#d4275b",
  },
  {
    slug: "real-madrid",
    name: "Real Madrid",
    stadium: "Santiago Bernabéu",
    founded: "1902",
    glow: "#d8b13c",
  },
  {
    slug: "chelsea",
    name: "Chelsea",
    stadium: "Stamford Bridge",
    founded: "1905",
    glow: "#1972d2",
  },
  {
    slug: "corinthians",
    name: "Corinthians",
    stadium: "Neo Química Arena",
    founded: "1910",
    glow: "#e7e4d9",
  },
  {
    slug: "inter-de-milao",
    name: "Inter de Milão",
    stadium: "San Siro",
    founded: "1908",
    glow: "#2757c7",
  },
  {
    slug: "bayern-de-munique",
    name: "Bayern de Munique",
    stadium: "Allianz Arena",
    founded: "1900",
    glow: "#e2272e",
  },
  {
    slug: "borussia-dortmund",
    name: "Borussia Dortmund",
    stadium: "Signal Iduna Park",
    founded: "1909",
    glow: "#f4d20b",
  },
  {
    slug: "psg",
    name: "Paris Saint-Germain",
    stadium: "Parc des Princes",
    founded: "1970",
    glow: "#315fc4",
  },
];

const gallery = document.querySelector(".gallery");

const leftCards = [
  ...document.querySelectorAll('[data-wheel="left"] .project-card'),
];

const rightCards = [
  ...document.querySelectorAll('[data-wheel="right"] .project-card'),
];

const focus = document.querySelector(".gallery__focus");
const activeIndex = document.querySelector("[data-active-index]");
const activeTitle = document.querySelector("[data-active-title]");
const activeStadium = document.querySelector("[data-active-stadium]");
const activeFounded = document.querySelector("[data-active-founded]");
const cards = [...leftCards, ...rightCards];

let progress = 0;
let selectedTeam = -1;
let frame;

function placeCard(card, side, itemIndex) {
  const distance = itemIndex - progress;
  const visible = Math.abs(distance) < 3.1;

  const focusHalfWidth = focus.offsetWidth / 2;
  const activeScale = side === "left" ? 1.24 : 0.83;
  const activeCardHalfWidth = (card.offsetWidth * activeScale) / 2;
  const gapFromTitle = Math.min(30, window.innerWidth * 0.035);
  const customMargin = parseFloat(getComputedStyle(card).marginLeft) || 0;
  const activeX = side === "left"
    ? -(focusHalfWidth + activeCardHalfWidth + gapFromTitle + customMargin)
    : focusHalfWidth + activeCardHalfWidth + gapFromTitle - customMargin;

  // Os dois cards partem das laterais e chegam ao texto somente quando
  // o clube correspondente se torna o item ativo.
  const x = activeX + (side === "left" ? -1 : 1) * Math.abs(distance) * 175;
  const y = distance * 360;

  const closeness = Math.max(
    0,
    1 - Math.abs(distance) / 3.1
  );

  const scale =
    (side === "left" ? 0.62 : 0.44) +
    closeness * (side === "left" ? 0.62 : 0.39);

  const depth =
    80 + closeness * (side === "left" ? 340 : 220);

  const tilt = (side === "left" ? -1 : 1) * (15 + distance * 7);

  card.style.opacity = visible
    ? `${0.28 + closeness * 0.72}`
    : "0";

  card.style.pointerEvents = visible ? "auto" : "none";

  card.style.filter = `blur(${
    Math.max(0, Math.abs(distance) - 1.45) * 1.8
  }px)`;

  card.style.zIndex = `${Math.round(closeness * 100)}`;

  card.style.transform = `
    translate(-50%, -50%)
    translateX(${x}px)
    translateY(${y}px)
    translateZ(${depth}px)
    rotateY(${tilt}deg)
    scale(${scale})
  `;
}

function updateFocus() {
  // O texto muda apenas quando o estádio e o escudo chegam à posição central.
  const index = Math.min(teams.length - 1, Math.floor(progress + 0.001));

  if (index === selectedTeam) return;

  selectedTeam = index;

  const team = teams[index];

  activeIndex.textContent = String(index + 1).padStart(2, "0");
  activeTitle.textContent = team.name;
  activeStadium.textContent = team.stadium;
  activeFounded.textContent = `Fundado em ${team.founded}`;

  focus.style.setProperty(
    "--team-glow",
    `${team.glow}c9`
  );

  document.documentElement.style.setProperty(
    "--team-glow",
    `${team.glow}c9`
  );

  cards.forEach((card) => {
    const isActive = card.dataset.team === team.slug;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function render() {
  leftCards.forEach((card, index) => {
    placeCard(card, "left", index);
  });

  rightCards.forEach((card, index) => {
    placeCard(card, "right", index);
  });

  updateFocus();
}

function updateFromScroll() {
  const start = gallery.offsetTop;

  const distance =
    gallery.offsetHeight - window.innerHeight;

  progress = Math.max(
    0,
    Math.min(
      teams.length - 1,
      ((window.scrollY - start) / distance) *
        (teams.length - 1)
    )
  );

  cancelAnimationFrame(frame);

  frame = requestAnimationFrame(render);
}

function goToTeam(index) {
  const distance =
    gallery.offsetHeight - window.innerHeight;

  const target =
    gallery.offsetTop +
    distance * (index / (teams.length - 1));

  window.scrollTo({
    top: target,
    behavior: "smooth",
  });
}

[...leftCards, ...rightCards].forEach((card) => {
  card.addEventListener("click", () => {
    goToTeam(Number(card.dataset.position) - 1);
  });
});

let pointerStartX = 0;
let pointerStartProgress = 0;

gallery.addEventListener("pointerdown", (event) => {
  pointerStartX = event.clientX;
  pointerStartProgress = progress;

  gallery.setPointerCapture(event.pointerId);
});

gallery.addEventListener("pointermove", (event) => {
  if (!gallery.hasPointerCapture(event.pointerId)) return;

  const next = Math.max(
    0,
    Math.min(
      teams.length - 1,
      pointerStartProgress -
        (event.clientX - pointerStartX) / 90
    )
  );

  const distance =
    gallery.offsetHeight - window.innerHeight;

  window.scrollTo(
    0,
    gallery.offsetTop +
      distance * (next / (teams.length - 1))
  );
});

window.addEventListener("scroll", updateFromScroll, {
  passive: true,
});

window.addEventListener("resize", updateFromScroll);

updateFromScroll();
