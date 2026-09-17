"use strict";

// ~ Defining Movements / Velocities
let x = 0;
let y = 900;
let vxl = 0;
let vxr = 0;
let vy = 0;
let rotation = 0;
let gameRunning = false;
const bullets = [];
let playerHp = 100;
let playerCoolDown = 0;
let wins = JSON.parse(localStorage.getItem("wins")) ?? 0;
const storeWins = function () {
  localStorage.setItem("wins", JSON.stringify(wins));
};

// ~ Defining Images
const crate = document.querySelector(".crate");
const blue = document.querySelector(`.blue`);
const red = document.querySelector(`.red`);
const play = document.querySelector(`.play-btn`);
const highScore = document.querySelector(`.high-score`);
const title = document.querySelector(`.main-title`);
const bullet = document.querySelector(`.bullet`);
const reset = document.querySelector(`.reset`);
const winMessage = document.querySelector(`.win-message`);
const loseMessage = document.querySelector(`.lose-message`);

// ~ All crates
const crates = [
  document.querySelector(".crate"),
  document.querySelector(".crate1"),
  document.querySelector(".crate2"),
  document.querySelector(".crate3"),
  document.querySelector(".crate4"),
  document.querySelector(".crate5"),
  document.querySelector(".crate6"),
  document.querySelector(".crate7"),
].filter(Boolean);

function resetTanks() {
  x = 0;
  y = Math.max(0, canvas.height - player.height);

  enemy.x = Math.max(0, canvas.width - enemy.width);
  enemy.y = 0;
  enemy.rotation = 90;
  enemy.cooldown = 0;
  enemy.hp = 100;
  player.hp = 100;
  player.cooldown = 0;
  rotation = 180;

  vxl = 0;
  vxr = 0;
  vy = 0;
  bullets.length = 0;
}

// ! MOVING
const moveWASD = function () {
  addEventListener("keydown", function (e) {
    if (!gameRunning) return;
    if (e.code === "KeyD") {
      vxr = 1;
      rotation = 270;
    }
    if (e.code === "KeyA") {
      vxl = -1;
      rotation = 90;
    }
    if (e.code === "KeyS") {
      vy = 1;
      rotation = 0;
    }
    if (e.code === "KeyW") {
      vy = -1;
      rotation = 180;
    }
  });
};
const shoot = function (tank = player) {
  if (!gameRunning || tank.hp <= 0) return;
  const now = performance.now();
  if (now < tank.cooldown) return;
  tank.cooldown = now + (tank === player ? 350 : 900);
  const angle = tank === player ? rotation : tank.rotation;
  const tankX = tank === player ? x : tank.x;
  const tankY = tank === player ? y : tank.y;

  let vx = 0;
  let vy = 0;

  if (angle === 0) {
    vx = 0;
    vy = 8;
  }
  if (angle === 90) {
    vx = -8;
    vy = 0;
  }
  if (angle === 180) {
    vx = 0;
    vy = -8;
  } // up
  if (angle === 270) {
    vx = 8;
    vy = 0;
  }

  bullets.push({
    x: tankX + tank.width / 2,
    y: tankY + tank.height / 2,
    vx: vx,
    vy: vy,
    width: 30,
    height: 30,
    image: bullet,
    rotation: angle,
    owner: tank,
  });
};
addEventListener("keydown", function (e) {
  if (e.code == "Space" && gameRunning) {
    e.preventDefault();
    shoot();
  }
});

// ~ STOP MOVING
const stopMOVING = function () {
  addEventListener("keyup", function (e) {
    if (!gameRunning) return;
    if (e.code === "KeyD") vxr = 0;
    if (e.code === "KeyA") vxl = 0;
    if (e.code === "KeyW") vy = 0;
    if (e.code === "KeyS") vy = 0;
  });
};

// ! CANVAS
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let player = {
  image: blue,
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  rotation: 180,
  cooldown: 0,
  hp: 100,
};

let enemy = {
  image: red,
  x: 0,
  y: 0,
  width: 200,
  height: 200,
  rotation: 180,
  cooldown: 0,
  hp: 100,
};
//! COLLISION

function getPlayerRect(px, py, tank = player) {
  const canvasRect = canvas.getBoundingClientRect();
  return {
    left: canvasRect.left + px,
    top: canvasRect.top + py,
    right: canvasRect.left + px + tank.width,
    bottom: canvasRect.top + py + tank.height,
  };
}

function rectsOverlap(a, b) {
  return (
    a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom
  );
}

const CRATE_HITBOXES = crates.map((el) => ({
  el,
  w: 130,
  h: 130,
  ox: 0,
  oy: 0,
}));

function getCrateRect(cfg) {
  const r = cfg.el.getBoundingClientRect();
  const cx = r.left + r.width / 2 + cfg.ox;
  const cy = r.top + r.height / 2 + cfg.oy;

  return {
    left: cx - cfg.w / 2,
    top: cy - cfg.h / 2,
    right: cx + cfg.w / 2,
    bottom: cy + cfg.h / 2,
  };
}

function isTouchingAnyCrate(px = x, py = y) {
  const p = getPlayerRect(px, py, player);
  for (const cfg of CRATE_HITBOXES) {
    if (rectsOverlap(p, getCrateRect(cfg))) return true;
  }
  return false;
}

function drawHealthBar(tank, left, label) {
  const hp = Math.max(0, Math.min(100, tank.hp));
  const width = 300;
  const height = 36;
  const top = 48;
  const fillWidth = (width * hp) / 100;

  const color = hp > 60 ? "#39ff88" : hp > 30 ? "#ffcc33" : "#ff4057";

  ctx.save();

  // Label and HP
  ctx.font = "bold 22px Arial";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#f0f6ff";
  ctx.fillText(label.toUpperCase(), left, top - 10);

  ctx.textAlign = "right";
  ctx.fillStyle = color;
  ctx.fillText(`${Math.ceil(hp)} / 100`, left + width, top - 10);

  // Dark frame
  ctx.fillStyle = "#101827";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(left - 4, top - 4, width + 8, height + 8, 10);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 6);
  ctx.clip();

  ctx.fillStyle = "#202b3d";
  ctx.fillRect(left, top, width, height);

  if (hp > 0) {
    const gradient = ctx.createLinearGradient(0, top, 0, top + height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(1, color);

    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = gradient;
    ctx.fillRect(left, top, fillWidth, height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(left, top, fillWidth, height / 2);
  }

  ctx.strokeStyle = "rgba(10, 18, 30, 0.45)";
  ctx.lineWidth = 2;

  for (let i = 1; i < 10; i++) {
    const x = left + (width / 10) * i;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + height);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

function loseGame() {
  gameRunning = false;
  vxl = 0;
  vxr = 0;
  vy = 0;
  loseMessage.style.opacity = 1;
  reset.style.display = "block";
  reset.style.opacity = 1;
  reset.style.cursor = "pointer";
  reset.style.pointerEvents = "auto";
  wins++;
  storeWins();
}
function winGame() {
  gameRunning = false;
  vxl = 0;
  vxr = 0;
  vy = 0;
  winMessage.style.opacity = 1;
  reset.style.display = "block";
  reset.style.opacity = 1;
  reset.style.cursor = "pointer";
  reset.style.pointerEvents = "auto";
  wins++;
  storeWins();
}

function enemyHasClearShot() {
  const r = canvas.getBoundingClientRect();
  const sx = r.width / canvas.width;
  const sy = r.height / canvas.height;

  const startX = enemy.x + enemy.width / 2;
  const startY = enemy.y + enemy.height / 2;

  const halfBullet = 15;
  let path;

  if (enemy.rotation === 90 || enemy.rotation === 270) {
    const endX = enemy.rotation === 270 ? x : x + player.width;

    path = {
      left: Math.min(startX, endX),
      right: Math.max(startX, endX),
      top: startY - halfBullet,
      bottom: startY + halfBullet,
    };
  } else {
    const endY = enemy.rotation === 0 ? y : y + player.height;

    path = {
      left: startX - halfBullet,
      right: startX + halfBullet,
      top: Math.min(startY, endY),
      bottom: Math.max(startY, endY),
    };
  }

  const screenPath = {
    left: r.left + path.left * sx,
    right: r.left + path.right * sx,
    top: r.top + path.top * sy,
    bottom: r.top + path.bottom * sy,
  };

  return !CRATE_HITBOXES.some((cfg) => {
    if (!cfg.el.getClientRects().length) return false;

    return rectsOverlap(screenPath, getCrateRect(cfg));
  });
}

function updateEnemy() {
  const dx = x + player.width / 2 - (enemy.x + enemy.width / 2);
  const dy = y + player.height / 2 - (enemy.y + enemy.height / 2);

  const speed = 0.8;
  const stopDistance = 220;

  function tryMove(mx, my) {
    const nextX = Math.max(
      0,
      Math.min(canvas.width - enemy.width, enemy.x + mx),
    );

    const nextY = Math.max(
      0,
      Math.min(canvas.height - enemy.height, enemy.y + my),
    );

    const rect = getPlayerRect(nextX, nextY, enemy);

    for (const cfg of CRATE_HITBOXES) {
      if (!cfg.el.getClientRects().length) continue;

      if (rectsOverlap(rect, getCrateRect(cfg))) return false;
    }

    if (rectsOverlap(rect, getPlayerRect(x, y, player))) {
      return false;
    }

    if (nextX === enemy.x && nextY === enemy.y) return false;

    enemy.x = nextX;
    enemy.y = nextY;
    return true;
  }

  const alignedX = Math.abs(dx) < player.width / 2 - 15;
  const alignedY = Math.abs(dy) < player.height / 2 - 15;

  const moveHorizontally = alignedY
    ? true
    : alignedX
      ? false
      : Math.abs(dx) < Math.abs(dy);

  if (Math.hypot(dx, dy) > stopDistance || (!alignedX && !alignedY)) {
    if (moveHorizontally) {
      enemy.rotation = dx > 0 ? 270 : 90;

      if (!tryMove(Math.sign(dx) * speed, 0)) {
        enemy.rotation = dy > 0 ? 0 : 180;
        tryMove(0, Math.sign(dy) * speed);
      }
    } else {
      enemy.rotation = dy > 0 ? 0 : 180;

      if (!tryMove(0, Math.sign(dy) * speed)) {
        enemy.rotation = dx > 0 ? 270 : 90;
        tryMove(Math.sign(dx) * speed, 0);
      }
    }
  }

  if (alignedX) {
    enemy.rotation = dy > 0 ? 0 : 180;
    if (enemyHasClearShot()) shoot(enemy);
  } else if (alignedY) {
    enemy.rotation = dx > 0 ? 270 : 90;
    if (enemyHasClearShot()) shoot(enemy);
  }
}

//! GAME
const move = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameRunning) {
    requestAnimationFrame(move);
    return;
  }

  updateEnemy();
  if (gameRunning) {
    const nextX = x + vxl + vxr;
    const nextY = y + vy;

    const stuck = isTouchingAnyCrate(x, y);

    if (stuck || !isTouchingAnyCrate(nextX, y)) x = nextX;
    if (stuck || !isTouchingAnyCrate(x, nextY)) y = nextY;
    x = Math.max(0, Math.min(canvas.width - player.width, x));
    y = Math.max(0, Math.min(canvas.height - player.height, y));

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];

      b.x += b.vx;
      b.y += b.vy;

      const canvasRect = canvas.getBoundingClientRect();
      const scaleX = canvasRect.width / canvas.width;
      const scaleY = canvasRect.height / canvas.height;

      const bulletRect = {
        left: canvasRect.left + (b.x - b.width / 2) * scaleX,
        right: canvasRect.left + (b.x + b.width / 2) * scaleX,
        top: canvasRect.top + (b.y - b.height / 2) * scaleY,
        bottom: canvasRect.top + (b.y + b.height / 2) * scaleY,
      };

      const hitCrate = CRATE_HITBOXES.some((cfg) => {
        if (!cfg.el.getClientRects().length) return false;

        return rectsOverlap(bulletRect, getCrateRect(cfg));
      });

      if (hitCrate) {
        bullets.splice(i, 1);
        continue;
      }

      const target = b.owner === player ? enemy : player;
      const targetX = target === player ? x : enemy.x;
      const targetY = target === player ? y : enemy.y;

      const hit =
        b.x + b.width / 2 > targetX &&
        b.x - b.width / 2 < targetX + target.width &&
        b.y + b.height / 2 > targetY &&
        b.y - b.height / 2 < targetY + target.height;

      if (hit) {
        target.hp = Math.max(0, target.hp - 20);
        bullets.splice(i, 1);

        if (target.hp === 0) {
          target === player ? loseGame() : winGame();

          highScore.textContent = `Wins: ${wins}`;
          storeWins();
          break;
        }

        continue;
      }

      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(b.x, b.y);

      ctx.rotate(((b.rotation - 180) * Math.PI) / 180);

      ctx.drawImage(b.image, -b.width / 2, -b.height / 2, b.width, b.height);

      ctx.restore();
    }
    ctx.save();
  }

  ctx.translate(x + 100, y + 100);
  ctx.rotate((rotation * Math.PI) / 180);

  ctx.drawImage(
    player.image,
    -player.width / 2,
    -player.height / 2,
    player.width,
    player.height,
  );

  ctx.restore();

  ctx.save();

  ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

  ctx.rotate((enemy.rotation * Math.PI) / 180);

  ctx.drawImage(
    enemy.image,
    -enemy.width / 2,
    -enemy.height / 2,
    enemy.width,
    enemy.height,
  );

  ctx.restore();

  //! Draw health bars
  drawHealthBar(player, 20, "YOU");
  // drawHealthBar(enemy, canvas.width - 180, "RED");
  drawHealthBar(enemy, canvas.width - 320, "RED");

  requestAnimationFrame(move);
};

window.addEventListener("load", () => {
  moveWASD();
  stopMOVING();
  move();
});

//* Hiding stuff
storeWins();
blue.style.display = "none";
red.style.display = "none";
crate.style.display = "none";
bullet.style.display = "none";
play.style.opacity = 1;
highScore.style.opacity = 1;
title.style.opacity = 1;
highScore.style.cursor = "default";
play.style.cursor = "pointer";
reset.style.cursor = "default";
highScore.textContent = `Wins: ${wins}`;

//^ Removing text with click And Adding Characters
play.addEventListener("click", function () {
  resetTanks();
  gameRunning = true;

  play.style.display = "none";
  play.disabled = true;

  highScore.style.opacity = 0;
  title.style.opacity = 0;

  reset.style.display = "none";
  reset.style.opacity = 0;
  reset.style.pointerEvents = "none";
  // Both tanks are drawn on the canvas.
  blue.style.display = "none";
  red.style.display = "none";
  loseMessage.style.opacity = 0;
  winMessage.style.opacity = 0;
});

//& RESET BUTTON
reset.addEventListener("click", function () {
  gameRunning = false;

  vxl = 0;
  vxr = 0;
  vy = 0;

  x = 0;
  y = 900;
  play.style.opacity = 1;
  highScore.style.opacity = 1;
  title.style.opacity = 1;
  reset.style.display = "none";
  reset.style.opacity = 0;
  reset.style.pointerEvents = "none";
  play.style.cursor = "pointer";
  loseMessage.style.opacity = 0;
  winMessage.style.opacity = 0;

  blue.style.display = "none";
  red.style.display = "none";
  crate.style.display = "none";
  play.disabled = false;
  play.style.display = "block";
});
