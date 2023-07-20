const search = document.querySelector("#search");
const rowContainer = document.querySelector("#rowContainer");
const form = document.querySelector("form");
const sortSelect = document.querySelector("#sortSelect");
const yearsContainer = document.querySelector("#yearsContainer");

let films = [];
let filteredFilms = [];
let selectedYear = "";

// Главная функция которая делаем запрос и запускает процесс отображения контента

const getData = async function (query) {
  const res = await axios.get(`https://api.tvmaze.com/search/shows?q=${query}`);
  films = res.data;
  renderFilms();
  renderFilter();
};

// Отлавливаем ивент на поиск
search.addEventListener("keyup", () => {
  if (search.value.length >= 3) {
    sortSelect.value = "";
    rowContainer.innerHTML = "";
    getData(search.value);
  } else if (!search.value) {
    rowContainer.innerHTML = "";
  }
});

// Отлавливаем ивент на сортировку
sortSelect.addEventListener("change", (e) => {
  handleSort(e.target.value);
});

// Сортировка фильмов
const handleSort = (sort) => {
  switch (sort) {
    case "raitingAsc":
      films.sort((a, b) => a.score - b.score);
      break;
    case "raitingDesc":
      films.sort((a, b) => b.score - a.score);
      break;
    case "nameAsc":
      films.sort((a, b) => a.show.name.localeCompare(b.show.name));
      break;
    case "nameDesc":
      films.sort((a, b) => b.show.name.localeCompare(a.show.name));
  }
  renderFilms();
};

// Отображаем фильмы
const renderFilms = async function () {
  const filmsForRender = filteredFilms.length ? filteredFilms : films;
  rowContainer.innerHTML = "";
  for (let i = 0; i < filmsForRender.length; i++) {
    renderShow(filmsForRender[i]);
  }
};

// Логика на отображение фильтра по годам

const renderFilter = () => {
  yearsContainer.innerHTML = "";

  const years = films
    .map((el) => el.show.premiered.split("-")[0])
    .reduce((acc, el) => {
      if (!acc.includes(el)) {
        acc.push(el);
      }
      return acc;
    }, [])
    .sort();

  for (let i = 0; i < years.length; i++) {
    const button = document.createElement("button");
    button.innerText = years[i];
    button.setAttribute("class", "yearBtn btn btn-light col m-2");
    button.addEventListener("click", () => {
      selectedYear = button.innerText;
      renderButtons();
    });

    yearsContainer.append(button);
  }
};

// Отображаем кнопки для фильтрации по годам

const renderButtons = () => {
  const buttons = document.querySelectorAll(".yearBtn");
  buttons.forEach((button) => {
    if (
      button.innerText === selectedYear &&
      !button.classList.contains("btn-success")
    ) {
      button.classList.remove("btn-light");
      button.classList.add("btn-success");
      filteredFilms = [];
      filteredFilms = films.filter(
        (film) => film.show.premiered.split("-")[0] === selectedYear
      );
      renderFilms();
    } else if (
      button.innerText === selectedYear &&
      button.classList.contains("btn-success")
    ) {
      button.classList.remove("btn-success");
      button.classList.add("btn-light");
      filteredFilms = [];
      renderFilms();
    }
  });
};

// Считаем рейтинг на основе максимума - 5 звезд.
const renderRaiting = (raiting) => {
  const number = Math.floor(raiting * 5);
  const starsContainer = document.createElement("small");
  for (let i = 0; i <= number; i++) {
    const start = document.createElement("span");
    start.setAttribute("class", "fa fa-star text-success");
    starsContainer.appendChild(start);
  }

  return starsContainer;
};

// отображаем один фильм

const renderShow = (item) => {
  if (!item.show) return;
  const col = document.createElement("div");
  col.setAttribute("class", "col");
  const card = document.createElement("div");
  card.setAttribute("class", "card shadow-sm");
  const image = document.createElement("img");
  image.setAttribute("class", "image");
  image.src =
    item.show.image?.medium ??
    "https://img.freepik.com/free-photo/movie-background-collage_23-2149876028.jpg";

  const cardBody = document.createElement("div");
  cardBody.setAttribute("class", "card-body");
  const summaryWrapper = document.createElement("div");
  summaryWrapper.setAttribute("class", "summaryWrapper");
  summaryWrapper.innerHTML = item.show.summary;
  const footer = document.createElement("div");
  footer.setAttribute(
    "class",
    "d-flex justify-content-between align-items-center"
  );
  const viewButton = document.createElement("a");
  viewButton.setAttribute("target", "_blank");
  viewButton.href = item.show.officialSite;
  viewButton.setAttribute("class", "btn btn-sm btn-outline-primary");
  viewButton.innerText = "Visit site";
  const raiting = renderRaiting(item.score);

  footer.append(viewButton);
  footer.append(raiting);

  const title = document.createElement("h3");
  title.innerText = item.show.name;

  cardBody.append(title);
  cardBody.append(summaryWrapper);
  cardBody.append(footer);

  card.append(image);
  card.append(cardBody);
  col.appendChild(card);
  rowContainer.append(col);
};
