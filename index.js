const shootingSound = new Audio('./music/shoooting.mp3');
const killEnemySound = new Audio('./music/killEnemy.mp3');
const gameOverSound = new Audio('./music/gameOver.mp3');
const heavyWeaponSound = new Audio('./music/heavyWeapon.mp3');
const hugeWeaponSound = new Audio('./music/hugeWeapon.mp3');

const canvas = document.createElement('canvas');
document.querySelector('.myGame').appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext('2d');
const lightWeaponDamage = 10;
const heavyWeaponDamage = 20;
const form = document.querySelector('form');
const scoreBoard = document.querySelector('.scoreBoard');
const difficulty = document.querySelector('#difficulty');
let playerScore = 0;
playerDetails = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  color: 'white',
};
//controls
var controlsWidth = window.innerWidth || document.documentElement.clientWidth;
if (controlsWidth <= 768) {
  const firstControl = document.createElement('p');
  firstControl.innerHTML = 'Shoot Enemy: Single tap on screen';
  const secondControl = document.createElement('p');
  secondControl.innerHTML =
    'Kill All Enemies: Tap on screen for more than second';
  form.appendChild(firstControl);
  form.appendChild(secondControl);
} else {
  const firstControl = document.createElement('p');
  firstControl.innerHTML =
    'Shoot Enemy with small bullets: Single tap on screen';
  const secondControl = document.createElement('p');
  secondControl.innerHTML =
    'Shoot Enemy with large bullets: right click on screen';
  const thirdControl = document.createElement('p');
  thirdControl.innerHTML = 'Kill All Enemies: click on space bar';
  form.appendChild(firstControl);
  form.appendChild(secondControl);
  form.appendChild(thirdControl);
}
//------------ creating player weapon enemy
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
}

class Weapon {
  constructor(x, y, radius, color, velocity, damage) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.damage = damage;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Creating HugeWeapon Class

class HugeWeapon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'rgba(255,0,133,1)';
  }

  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 200, canvas.height);
  }

  update() {
    this.draw();
    this.x += 20;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Creating Particle Class
const friction = 0.98;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.aplha = 1;
  }

  draw() {
    context.save();
    context.globalAlpha = this.aplha;
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      (Math.PI / 180) * 0,
      (Math.PI / 180) * 360,
      false
    );
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.aplha -= 0.01;
  }
}

//------------ Main logic --------------
let player;

let speed = 2;
// array of weapons
const weapons = [];

// array of enemy
const enemies = [];

const particles = [];

const hugeWeapons = [];

// Endscreen
const gameoverLoader = () => {
  // Creating endscreen div and play again button and high score element
  const gameOverBanner = document.createElement('div');
  const gameOverBtn = document.createElement('button');
  const highScore = document.createElement('div');

  highScore.innerHTML = `High Score : ${
    localStorage.getItem('highScore')
      ? localStorage.getItem('highScore')
      : playerScore
  }`;

  const oldHighScore =
    localStorage.getItem('highScore') && localStorage.getItem('highScore');

  if (oldHighScore < playerScore) {
    localStorage.setItem('highScore', playerScore);

    // updating high score html
    highScore.innerHTML = `High Score: ${playerScore}`;
  }

  // adding text to playagain button
  gameOverBtn.innerText = 'Play Again';

  gameOverBanner.appendChild(highScore);

  gameOverBanner.appendChild(gameOverBtn);

  // Making reload on clicking playAgain button
  gameOverBtn.onclick = () => {
    window.location.reload();
  };

  gameOverBanner.classList.add('gameover');

  document.querySelector('body').appendChild(gameOverBanner);
};

// function to spaw enemy at random location
const spawnEnemy = () => {
  const enemySize = Math.random() * (40 - 5) + 5;
  const enemyColor = `hsl(${Math.floor(Math.random() * 360)},100%,50%)`;
  let random;
  // enemy location random from outside screen
  if (Math.random() < 0.5) {
    // Making X equal to very left off of screen or very right off of screen and setting Y to any where vertically
    random = {
      x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
      y: Math.random() * canvas.height,
    };
  } else {
    // Making Y equal to very up off of screen or very down off of screen and setting X to any where horizontally
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
    };
  }
  // Finding Angle between center (means Player Position) and enemy position
  const myAngle = Math.atan2(
    canvas.height / 2 - random.y,
    canvas.width / 2 - random.x
  );
  // Making velocity or speed of enemy by multipling chosen difficulty to radian
  const velocity = {
    x: Math.cos(myAngle) * speed,
    y: Math.sin(myAngle) * speed,
  };
  // Adding enemy to enemies array
  enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
};

function startGame(event) {
  //form submit method
  player = new Player(
    playerDetails.x,
    playerDetails.y,
    playerDetails.radius,
    playerDetails.color
  );
  event.preventDefault();

  form.style.display = 'none';
  scoreBoard.style.display = 'block';
  const difficultyValue = difficulty.value;
  if (difficultyValue == 'Easy') {
    setInterval(spawnEnemy, 2000);
    if (controlsWidth > 768) return (speed = 2);
    return (speed = 1);
  } else if (difficultyValue == 'Medium') {
    setInterval(spawnEnemy, 1400);
    if (controlsWidth > 768) return (speed = 4);
    return (speed = 1.5);
  } else if (difficultyValue == 'Hard') {
    setInterval(spawnEnemy, 1000);
    if (controlsWidth > 768) return (speed = 6);
    return (speed = 2);
  } else if (difficultyValue == 'Fast') {
    setInterval(spawnEnemy, 700);
    if (controlsWidth > 768) return (speed = 8);
    return (speed = 2.5);
  }
  setInterval(spawnEnemy, 1000);
}
function heavyWeaponCode(e) {
  // finding angle between player position(center) and click co-ordinates
  if (playerScore <= 0) return;

  heavyWeaponSound.play();
  // Decreasing Player Score for using Heavy Weapon
  playerScore -= 2;
  // Updating Player Score in Score board in html
  scoreBoard.innerHTML = `Score : ${playerScore}`;

  const playerAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // Making const speed for light weapon
  const velocity = {
    x: Math.cos(playerAngle) * 4,
    y: Math.sin(playerAngle) * 4,
  };

  // Adding light weapon in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      30,
      'cyan',
      velocity,
      heavyWeaponDamage
    )
  );
}

function hugeWeaponCode() {
  if (playerScore < 20) return;

  // Decreasing Player Score for using Huge Weapon
  playerScore -= 20;
  // Updating Player Score in Score board in html
  scoreBoard.innerHTML = `Score : ${playerScore}`;
  hugeWeaponSound.play();
  hugeWeapons.push(new HugeWeapon(0, 0));
}
function smallWeaponCode(e) {
  shootingSound.play();
  // finding angle between player position(center) and click co-ordinates
  const playerAngle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  // Making const speed for light weapon
  const velocity = {
    x: Math.cos(playerAngle) * 6,
    y: Math.sin(playerAngle) * 6,
  };

  // Adding light weapon in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      6,
      'white',
      velocity,
      lightWeaponDamage
    )
  );
}
function animation() {
  const animationId = requestAnimationFrame(animation);
  // context.clearRect(0, 0, canvas.width, canvas.height);

  // Updating Player Score in Score board in html
  var scoreText = scoreBoard.innerHTML;
  var scoreValue = parseInt(scoreText.split(':')[1].trim(), 10);
  if (scoreValue != playerScore)
    scoreBoard.innerHTML = `Score : ${playerScore}`;

  // Clearing canvas on each frame
  context.fillStyle = 'rgba(49, 49, 49,0.2)';

  context.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  // Generating Particles
  particles.forEach((particle, particleIndex) => {
    if (particle.aplha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  // Generating Huge Weapon
  hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
    if (hugeWeapon.x > canvas.width) {
      hugeWeapons.splice(hugeWeaponIndex, 1);
    } else {
      hugeWeapon.update();
    }
  });

  //generate bullets
  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.y + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y - weapon.radius > canvas.height
    ) {
      weapons.splice(weaponIndex, 1);
    }
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    const distanceBetweenPlayerAndEnemy = Math.hypot(
      player.x - enemy.x,
      player.y - enemy.y
    );
    // stop game when enemy hit player
    if (distanceBetweenPlayerAndEnemy - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      gameOverSound.play();
      hugeWeaponSound.pause();
      shootingSound.pause();
      heavyWeaponSound.pause();
      killEnemySound.pause();
      return gameoverLoader();
    }

    hugeWeapons.forEach((hugeWeapon) => {
      // Finding Distance between Huge weapon and enemy
      const distanceBetweenHugeWeaponAndEnemy = hugeWeapon.x - enemy.x;

      if (
        distanceBetweenHugeWeaponAndEnemy <= 200 &&
        distanceBetweenHugeWeaponAndEnemy >= -200
      ) {
        // increasing player Score when killing one enemy
        playerScore += 10;
        setTimeout(() => {
          killEnemySound.play();

          enemies.splice(enemyIndex, 1);
        }, 0);
      }
    });
    weapons.forEach((weapon, weaponIndex) => {
      const distanceBetweenWeaponAndEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );
      if (distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {
        killEnemySound.play();
        if (enemy.radius > weapon.damage + 8) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          for (let i = 0; i < enemy.radius * 3; i++) {
            particles.push(
              new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color, {
                x: (Math.random() - 0.5) * (Math.random() * 7),
                y: (Math.random() - 0.5) * (Math.random() * 7),
              })
            );
          }
          playerScore += 10;

          // Rendering player Score in scoreboard html element
          scoreBoard.innerHTML = `Score : ${playerScore}`;

          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            weapons.splice(weaponIndex, 1);
          }, 0);
        }
      }
    });
  });
}

// ---------------------------------Adding Event Listeners------------------------
var touchHandled = false; // Flag to track whether touch event has been handled
var touchStartTime, touchEndTime, touchDuration;

//laptop/desktop events
// Click event listener
canvas.addEventListener('click', function (event) {
  if (!touchHandled) {
    handleEvent(event);
  }
});

// Contextmenu event listener
canvas.addEventListener('contextmenu', function (event) {
  event.preventDefault(); // Prevent the default context menu behavior
  if (!touchHandled) {
    handleEvent(event);
  }
});

// Keypress event listener
addEventListener('keypress', function (event) {
  if (!touchHandled) {
    handleEvent(event);
  }
});

//Mobile event
// Touchstart event listener for mobile devices
canvas.addEventListener('touchstart', function (event) {
  event.preventDefault(); // Prevent the default touchstart behavior
  touchStartTime = new Date().getTime(); // Record the start time of the touch
  touchHandled = false; // Reset touchHandled flag
});

// Touchend event listener for mobile devices
canvas.addEventListener('touchend', function (event) {
  touchHandled = true; // Set touchHandled flag
  touchEndTime = new Date().getTime(); // Record the end time of the touch
  touchDuration = touchEndTime - touchStartTime; // Calculate the duration of the touch
  handleEvent(event);
});

// Function to handle the events
function handleEvent(event) {
  if (event.type === 'touchend') {
    // Handle touchend event for mobile devices
    if (touchDuration >= 500) {
      // Define a threshold for the long-press duration
      // Prevent the default touchend behavior
      hugeWeaponCode();
      console.log('huge weapon');
    } else if (touchDuration >= 10) {
      smallWeaponCode(event.changedTouches[0]);
      console.log('small weapon');
    }
  } else {
    // Handle other events (click, contextmenu, keypress)
    if (event.type === 'click') {
      console.log('click event');
      smallWeaponCode(event);
    } else if (event.type === 'contextmenu') {
      event.preventDefault();
      heavyWeaponCode(event);
      console.log('Contextmenu event');
    } else if (event.type === 'keypress') {
      if (event.key === ' ') {
        hugeWeaponCode();
      }
      console.log('Keypress event');
    }
    // console.log('Click/Contextmenu/Keypress event');
  }
}

addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

addEventListener('resize', () => {
  window.location.reload();
});

animation();
