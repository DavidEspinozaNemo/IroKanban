//variables
let cardBeignDragged;
let dropzones = document.querySelectorAll(".dropzone");
let priorities;
// let cards = document.querySelectorAll('.kanbanCard');
let maxColumn = {
  config: {
    max: 2,
  },
};
let dataColors = [
  { id: 0, color: "yellow", title: "columna 1" },
  { id: 1, color: "green", title: "columna 2" },
  { id: 2, color: "blue", title: "columna 3" },
];
let dataCards = {
  config: {
    maxid: 0,
  },
  cards: [],
};
let theme = "light";
//initialize

$(document).ready(() => {
  //localStorage.clear();
  $("#loadingScreen").addClass("d-none");
  theme = localStorage.getItem("@kanban:theme");
  if (theme) {
    $("body").addClass(`${theme === "light" ? "" : "darkmode"}`);
  }
  if (JSON.parse(localStorage.getItem("@kanban:columns"))) {
    dataColors = JSON.parse(localStorage.getItem("@kanban:columns"));
    maxColumn = JSON.parse(localStorage.getItem("@kanban:maxC"));
  }
  initializeBoards();
  if (JSON.parse(localStorage.getItem("@kanban:data"))) {
    dataCards = JSON.parse(localStorage.getItem("@kanban:data"));

    initializeComponents(dataCards);
  }
  initializeCards();
  $("#add").click(() => {
    const title = $("#titleInput").val() !== "" ? $("#titleInput").val() : null;
    const description =
      $("#descriptionInput").val() !== "" ? $("#descriptionInput").val() : null;
    $("#titleInput").val("");
    $("#descriptionInput").val("");
    if (title && description) {
      let id = dataCards.config.maxid + 1;
      const newCard = {
        id,
        title,
        description,
        position: "yellow",
        priority: false,
      };
      dataCards.cards.push(newCard);
      dataCards.config.maxid = id;
      save();
      appendComponents(newCard);
      initializeCards();
    }
  });
  $("#addC").click(() => {
    const titleT =
      $("#titleInputC").val() !== "" ? $("#titleInputC").val() : null;
    $("#titleInputC").val("");

    if (titleT) {
      let id = maxColumn.config.max + 1;
      let newColumn = { id, color: "red", title: titleT };
      maxColumn.config.max = id;
      dataColors.push(newColumn);
      console.log(titleT);
      console.log(newColumn);
      save();
    }
  });
  $("#delC").click(() => {
    const titleT =
      $("#titleInputCD").val() !== "" ? $("#titleInputCD").val() : null;
    $("#titleInputCD").val("");
    if (titleT) {
      console.log(titleT);
      dataColors.forEach((columm) => {
        if (columm.title.toUpperCase() == titleT.toUpperCase()) {
          deleteColumn(columm.id);
        }
      });
      save();
    }
  });
  $("#deleteAll").click(() => {
    dataCards.cards = [];
    save();
  });
  $("#theme-btn").click((e) => {
    e.preventDefault();
    $("body").toggleClass("darkmode");
    if (theme) {
      localStorage.setItem(
        "@kanban:theme",
        `${theme === "light" ? "darkmode" : ""}`
      );
    } else {
      localStorage.setItem("@kanban:theme", "darkmode");
    }
  });
});

//functions
function initializeBoards() {
  dataColors.forEach((item) => {
    let htmlString = `
        <div class="board">
            <h3 class="text-center">${item.title.toUpperCase()}</h3>
            <div class="dropzone" id="${item.color}">
                
            </div>
        </div>
        `;
    $("#boardsContainer").append(htmlString);
  });
  let dropzones = document.querySelectorAll(".dropzone");
  dropzones.forEach((dropzone) => {
    dropzone.addEventListener("dragenter", dragenter);
    dropzone.addEventListener("dragover", dragover);
    dropzone.addEventListener("dragleave", dragleave);
    dropzone.addEventListener("drop", drop);
  });
}

function initializeCards() {
  cards = document.querySelectorAll(".kanbanCard");

  cards.forEach((card) => {
    card.addEventListener("dragstart", dragstart);
    card.addEventListener("drag", drag);
    card.addEventListener("dragend", dragend);
  });
}

function initializeComponents(dataArray) {
  //create all the stored cards and put inside of the todo area
  dataArray.cards.forEach((card) => {
    appendComponents(card);
  });
}

function appendComponents(card) {
  //creates new card inside of the todo area
  let htmlString = `
        <div id=${card.id.toString()} class="kanbanCard ${
    card.position
  }" draggable="true">
            <div class="content">               
                <h4 class="title">${card.title}</h4>
                <p class="description">${card.description}</p>
            </div>
            <form class="row mx-auto justify-content-between">
                <span id="span-${card.id.toString()}" onclick="togglePriority(event)" class="material-icons priority ${
    card.priority ? "is-priority" : ""
  }">
                    star
                </span>
                <button class="invisibleBtn">
                    <span class="material-icons delete" onclick="deleteCard(${card.id.toString()})">
                        remove_circle
                    </span>
                </button>
            </form>
        </div>
    `;
  $(`#${card.position}`).append(htmlString);
  priorities = document.querySelectorAll(".priority");
}
function togglePriority(event) {
  event.target.classList.toggle("is-priority");
  dataCards.cards.forEach((card) => {
    if (event.target.id.split("-")[1] === card.id.toString()) {
      card.priority = card.priority ? false : true;
    }
  });
  save();
}

function deleteCard(id) {
  dataCards.cards.forEach((card) => {
    if (card.id === id) {
      let index = dataCards.cards.indexOf(card);
      console.log(index);
      dataCards.cards.splice(index, 1);
      console.log(dataCards.cards);
      save();
    }
  });
}
function deleteColumn(id) {
  console.log(dataColors.toString());
  dataColors.forEach((column) => {
    if (column.id == id) {
      let index = dataColors.indexOf(column);
      dataColors.splice(index, 1);
      console.log(dataColors.toString());
      save();
    }
  });
}

function removeClasses(cardBeignDragged, color) {
  cardBeignDragged.classList.remove("red");
  cardBeignDragged.classList.remove("blue");
  cardBeignDragged.classList.remove("purple");
  cardBeignDragged.classList.remove("green");
  cardBeignDragged.classList.remove("yellow");
  cardBeignDragged.classList.add(color);
  position(cardBeignDragged, color);
}

function save() {
  localStorage.setItem("@kanban:data", JSON.stringify(dataCards));
  localStorage.setItem("@kanban:columns", JSON.stringify(dataColors));
  localStorage.setItem("@kanban:maxC", JSON.stringify(maxColumn));
}

function position(cardBeignDragged, color) {
  const index = dataCards.cards.findIndex(
    (card) => card.id === parseInt(cardBeignDragged.id)
  );
  dataCards.cards[index].position = color;
  save();
}

//cards
function dragstart() {
  dropzones.forEach((dropzone) => dropzone.classList.add("highlight"));
  this.classList.add("is-dragging");
}

function drag() {}

function dragend() {
  dropzones.forEach((dropzone) => dropzone.classList.remove("highlight"));
  this.classList.remove("is-dragging");
}

// Release cards area
function dragenter() {}

function dragover({ target }) {
  this.classList.add("over");
  cardBeignDragged = document.querySelector(".is-dragging");
  if (this.id === "yellow") {
    removeClasses(cardBeignDragged, "yellow");
  } else if (this.id === "green") {
    removeClasses(cardBeignDragged, "green");
  } else if (this.id === "blue") {
    removeClasses(cardBeignDragged, "blue");
  } else if (this.id === "purple") {
    removeClasses(cardBeignDragged, "purple");
  } else if (this.id === "red") {
    removeClasses(cardBeignDragged, "red");
  }

  this.appendChild(cardBeignDragged);
}

function dragleave() {
  this.classList.remove("over");
}

function drop() {
  this.classList.remove("over");
}
