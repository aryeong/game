/* 코드를 작성하세요 */

//내가 누른 키코드가 뭔지 명확하게 정의
const key = {
  keyDown : {},
  keyValue : {
    37 : 'left',
    38 : 'up',
    39 : 'right',
    88 : 'attack',
    67 : 'slide'
  }
}
//대량의 몬스터 생성
const allMonsterComProp = {
  arr : []
}
const bulletComProp = {
  launch: false, //검 던졌는지 체크
  arr : []
}
const gameBackground = {
  gameBox : document.querySelector('.game')
}
const stageInfo = {
  stage: [],
  totalScore: 0,
  monster: [
    {defaultMon: greenMon, bossMon: greenMonBoss},
    {defaultMon: yellowMon, bossMon: yellowMonBoss},
    {defaultMon: pinkMon, bossMon: pinkMonBoss},
  ]
}
const gameProp = {
  screenWidth : window.innerWidth,
  screenHeight : window.innerHeight,
  gameOver : false
}

const renderGame = () => {
  hero.keyMotion();
  setGameBackground();
  bulletComProp.arr.forEach((arr, i) => {
    arr.moveBullet(); // 검 움직이기
  })
  allMonsterComProp.arr.forEach((arr, i) => {
    arr.moveMonster(); // 몬스터 움직이기
  })
  stageInfo.stage.clearCheck();
  //재귀호출, 초당 약 60프레임을 그리며 무한반복
  window.requestAnimationFrame(renderGame);
}

const endGame = () => {
  gameProp.gameOver = true;
  key.keyDown.left = false;
  key.keyDown.right = false;
  document.querySelector('.game_over').classList.add('active');
}

const setGameBackground = () => {
  let parallaxValue = Math.min(0, (hero.moveX - gameProp.screenWidth/3) * -1);

  gameBackground.gameBox.style.transform = `translateX(${parallaxValue}px)`
}

const windowEvent = () => {
  window.addEventListener('keydown', e => {
    // console.log(key.keyValue[e.which]);
    if (!gameProp.gameOver) key.keyDown[key.keyValue[e.which]] = true;
  });
  window.addEventListener('keyup', e => {
    // console.log(key.keyValue[e.which]);
    key.keyDown[key.keyValue[e.which]] = false;
  });
  window.addEventListener('resize', e => {
    gameProp.screenWidth = window.innerWidth;
    gameProp.screenHeight = window.innerHeight;
  });
}

const loadImg = () => {
  const preLoadImgSrc = ['../../lib/images/ninja_attack.png', '../../lib/images/ninja_run.png'];
  preLoadImgSrc.forEach(arr => {
    const img = new Image(); //이미지 객체에 인스턴스 생성
    img.src = arr; 
  })
}

let hero;
const init = () => {
  hero = new Hero('.hero');
  stageInfo.stage = new Stage();

  // allMonsterComProp.arr[0] = new Monster(greenMonBoss, gameProp.screenWidth + 700);
  // allMonsterComProp.arr[1] = new Monster(yellowMonBoss, gameProp.screenWidth + 1400);
  // allMonsterComProp.arr[2] = new Monster(pinkMonBoss, gameProp.screenWidth + 2100);

  // allMonsterComProp.arr[1] = new Monster(1500, 15000);
  loadImg();  // 이미지가 미리 로드되어 깜빡거림없이 처리됨
  windowEvent();
  renderGame();
}

window.onload = () => {
  init();
}