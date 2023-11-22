// Обработчик события нажатия клавиш

class Game {
  constructor() {
    this.map = []; // Карта
    this.player = { x: 0, y: 0, health: 100, attack: 20, swords: 0 }; // Герой
    this.enemies = []; // Противники
    this.items = { swords: 2, healthPotions: 10 }; // Мечи и зелья хп
  }

  // Генерация карты в массив
  generateMap() {
    this.map = [];

    // Заполнение карты стенами
    for (let i = 0; i < 24; i++) {
      this.map[i] = [];
      for (let j = 0; j < 40; j++) {
        this.map[i][j] = "wall";
      }
    }

    // Генерация случайного количества прямоугольных комнат
    for (let i = 0; i < Math.floor(Math.random() * 6) + 5; i++) {
      let roomWidth = Math.floor(Math.random() * 6) + 3;
      let roomHeight = Math.floor(Math.random() * 6) + 3;
      let startX = Math.floor(Math.random() * (40 - roomWidth));
      let startY = Math.floor(Math.random() * (24 - roomHeight));

      for (let i = startY; i < startY + roomHeight; i++) {
        for (let j = startX; j < startX + roomWidth; j++) {
          this.map[i][j] = "floor";
        }
      }
    }

    // Генерация случайного количества вертикальных проходов
    let verticalPassages = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < verticalPassages; i++) {
      let passageX = Math.floor(Math.random() * 38) + 1;
      for (let j = 0; j < 24; j++) {
        this.map[j][passageX] = "floor";
      }
    }

    // Генерация случайного количества горизонтальных проходов
    let horizontalPassages = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < horizontalPassages; i++) {
      let passageY = Math.floor(Math.random() * 22) + 1;
      for (let j = 0; j < 40; j++) {
        this.map[passageY][j] = "floor";
      }
    }

    // Проверка на достижимость зон
    if (this.isFloorAccessible()) {
      // Добавление игрока, противников, мечей и зелий хп в пустые места
      this.placeItems("sword", 2);
      this.placeItems("healthPotion", 10);
      this.placeEnemies(10);
      this.placeHero("player", this.player);
    } else {
      this.generateMap();
    }
  }

  // Есть ли проход в каждую клетку пола
  isFloorAccessible() {
    const findFloorCoordinate = () => {
      for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 40; j++) {
          if (this.map[i][j] === "floor") {
            return { x: j, y: i };
          }
        }
      }
    };

    const stack = [findFloorCoordinate()];
    const visited = new Set();

    while (stack.length > 0) {
      const { x, y } = stack.pop();
      visited.add(`${x},${y}`);

      // Проверить соседние комнаты
      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ];

      for (const neighbor of neighbors) {
        const { x, y } = neighbor;
        if (
          x >= 0 &&
          x < 40 &&
          y >= 0 &&
          y < 24 &&
          this.map[y][x] === "floor" &&
          !visited.has(`${x},${y}`)
        ) {
          stack.push({ x, y });
        }
      }
    }

    return (
      visited.size === this.map.flat().filter((tile) => tile === "floor").length
    );
  }

  // Размещение предметов
  placeItems(itemType, count) {
    for (let i = 0; i < count; i++) {
      let x = Math.floor(Math.random() * 40);
      let y = Math.floor(Math.random() * 24);

      if (this.map[y][x] === "floor") {
        this.map[y][x] = itemType;
      } else {
        i--;
      }
    }
  }

  // Размещение героя
  placeHero(entityType, entity) {
    do {
      entity.x = Math.floor(Math.random() * 40);
      entity.y = Math.floor(Math.random() * 24);
    } while (this.map[entity.y][entity.x] !== "floor");

    this.map[entity.y][entity.x] = entityType;
  }

  // Размещение противников
  placeEnemies(count) {
    this.enemies = [];

    for (let i = 0; i < count; i++) {
      let x = Math.floor(Math.random() * 40);
      let y = Math.floor(Math.random() * 24);

      if (this.map[y][x] === "floor") {
        this.enemies.push({ x: x, y: y, health: 100, attack: 20 });
        this.map[y][x] = "enemy";
      } else {
        i--;
      }
    }
  }

  // Отрисовка карты
  drawMap() {
    let fieldContainer = document.querySelector(".field");

    fieldContainer.innerHTML = "";

    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 40; j++) {
        let tile = document.createElement("div");
        tile.className = "tile";

        switch (this.map[i][j]) {
          case "wall":
            tile.classList.add("tileW");
            break;
          case "floor":
            tile.classList.add("tile");
            break;
          case "player":
            tile.classList.add("tileP");
            let healthBarPlayer = document.createElement("div");
            healthBarPlayer.className = "health";
            healthBarPlayer.style.width = this.player.health + "%";
            tile.appendChild(healthBarPlayer);
            break;
          case "enemy":
            tile.classList.add("tileE");
            let healthBarEnemy = document.createElement("div");
            healthBarEnemy.className = "health";
            healthBarEnemy.style.width =
              this.enemies.find((enemy) => enemy.x === j && enemy.y === i)
                .health + "%";
            tile.appendChild(healthBarEnemy);
            break;
          case "sword":
            tile.classList.add("tileSW");
            break;
          case "healthPotion":
            tile.classList.add("tileHP");
            break;
        }

        tile.style.top = i * 50 + "px";
        tile.style.left = j * 50 + "px";

        fieldContainer.appendChild(tile);
      }
    }
  }

  // Активности игрока
  // Перемещение игрока
  movePlayer(direction) {
    let newX = this.player.x;
    let newY = this.player.y;

    switch (direction) {
      case "up":
        newY = Math.max(0, newY - 1);
        break;
      case "down":
        newY = Math.min(23, newY + 1);
        break;
      case "left":
        newX = Math.max(0, newX - 1);
        break;
      case "right":
        newX = Math.min(39, newX + 1);
        break;
    }
    this.checkForBarrierAndItems(newY, newX);
  }
  checkForBarrierAndItems(newY, newX) {
    switch (this.map[newY][newX]) {
      case "floor":
        this.newPlaeyrPlacement(newY, newX);
        break;
      case "healthPotion":
        this.items.healthPotions -= 1;
        if (this.player.health < 100) {
          this.player.health = Math.min(100, this.player.health + 25);
          this.newPlaeyrPlacement(newY, newX);
        } else {
          this.newPlaeyrPlacement(newY, newX);
        }
        break;
      case "sword":
        this.items.swords -= 1;
        this.player.attack += 10;
        this.newPlaeyrPlacement(newY, newX);
        break;
    }
  }
  newPlaeyrPlacement(newY, newX) {
    this.map[this.player.y][this.player.x] = "floor";
    this.player.x = newX;
    this.player.y = newY;
    this.map[newY][newX] = "player";
    this.drawMap();
  }
  // Атака противника
  attackEnemies() {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const neighborX = this.player.x + j;
        const neighborY = this.player.y + i;

        if (
          neighborX >= 0 &&
          neighborX < 40 &&
          neighborY >= 0 &&
          neighborY < 24 &&
          this.map[neighborY][neighborX] === "enemy"
        ) {
          const currentHealth = this.enemies.find(
            (enemy) => enemy.x === neighborX && enemy.y === neighborY
          ).health;

          const newHealth = currentHealth - this.player.attack;

          this.enemies.find(
            (enemy) => enemy.x === neighborX && enemy.y === neighborY
          ).health = newHealth;

          if (newHealth <= 0) {
            this.map[neighborY][neighborX] = "floor";
            this.enemies = this.enemies.filter(
              (enemy) => !(enemy.x === neighborX && enemy.y === neighborY)
            );
          }

          if (this.enemies.length === 0) {
            if (confirm("You WIN! Restart?")) {
              window.location.reload();
            }
          }
        }
      }
    }
    this.drawMap();
  }

  // Активности противников
  // Перемещение противников
  moveEnemies() {
    for (let enemy of this.enemies) {
      // Cлучайное передвижение в любом направлении
      const direction = Math.floor(Math.random() * 4); // 0: влево, 1: вверх, 2: вправо, 3: вниз

      switch (direction) {
        case 0:
          if (enemy.x > 0 && this.map[enemy.y][enemy.x - 1] === "floor") {
            this.map[enemy.y][enemy.x] = "floor";
            let newX = (enemy.x -= 1);
            this.map[enemy.y][newX] = "enemy";
          }
          break;
        case 1:
          if (enemy.y > 0 && this.map[enemy.y - 1][enemy.x] === "floor") {
            this.map[enemy.y][enemy.x] = "floor";
            let newY = (enemy.y -= 1);
            this.map[newY][enemy.x] = "enemy";
          }
          break;
        case 2:
          if (enemy.x < 39 && this.map[enemy.y][enemy.x + 1] === "floor") {
            this.map[enemy.y][enemy.x] = "floor";
            let newX = (enemy.x += 1);
            this.map[enemy.y][newX] = "enemy";
          }
          break;
        case 3:
          if (enemy.y < 23 && this.map[enemy.y + 1][enemy.x] === "floor") {
            this.map[enemy.y][enemy.x] = "floor";
            let newY = (enemy.y += 1);
            this.map[newY][enemy.x] = "enemy";
          }
          break;
        default:
          break;
      }
    }
  }
  // Атака игрока противником
  attackPlayer() {
    for (let enemy of this.enemies) {
      // Проверка соседних клеток вокруг врагов
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const neighborX = enemy.x + j;
          const neighborY = enemy.y + i;

          // Проверка на наличие игрока в соседней клетке
          if (
            neighborX >= 0 &&
            neighborX < 40 &&
            neighborY >= 0 &&
            neighborY < 24 &&
            this.map[neighborY][neighborX] === "player"
          ) {
            this.player.health -= enemy.attack;
          }
        }
      }
    }
  }

  updateGame() {
    this.playerAttackInterval = setInterval(() => {
      this.attackPlayer();
      this.moveEnemies();
      this.drawMap();

      if (this.player.health <= 0) {
        clearInterval(this.playerAttackInterval);
        if (confirm("Game Over. Restart?")) {
          window.location.reload();
        }
      }
    }, 1000);
  }

  init() {
    this.generateMap();
    this.drawMap();
    this.updateGame();

    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyW":
          this.movePlayer("up");
          break;
        case "KeyA":
          this.movePlayer("left");
          break;
        case "KeyS":
          this.movePlayer("down");
          break;
        case "KeyD":
          this.movePlayer("right");
          break;
        case "Space":
          this.attackEnemies();
          break;
      }
    });
  }
}

let game = new Game();
game.init();
