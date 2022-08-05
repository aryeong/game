class Stage {
  constructor() {
    this.level = 0;
    this.isStart = false;
    this.stageStart();
  }
  stageStart() {
    setTimeout(() => {
      this.isStart = true;
      this.stageGuide(`START LEVEL ${this.level+1}`);
      this.callMonster();
    }, 2000);
  }
  stageGuide(text) {
    this.parentNode = document.querySelector('.game_app');
    this.textBox = document.createElement('div');
    this.textBox.className = 'stage_box';
    this.textNode = document.createTextNode(text);
    this.textBox.appendChild(this.textNode);
    this.parentNode.appendChild(this.textBox);

    setTimeout(() => this.textBox.remove(), 1500);
  }
  callMonster() {
    for (let i = 0; i <= 10; i++) {
      if (i === 10) {
        allMonsterComProp.arr[i] = new Monster(stageInfo.monster[this.level].bossMon, hero.moveX + gameProp.screenWidth + 600 * i);
      } else {
        allMonsterComProp.arr[i] = new Monster(stageInfo.monster[this.level].defaultMon, hero.moveX + gameProp.screenWidth + 700 * i);
      }
    }
  }
  clearCheck() {
    if (allMonsterComProp.arr.length === 0 && this.isStart) {
      this.isStart = false;
      this.level++;
      if (this.level < stageInfo.monster.length) {
        this.stageGuide('CLEAR!');
        this.stageStart();
        hero.heroUpgrade();
      } else {
        this.stageGuide('ALL CLEAR!');
      }
    }
  }
}

class Hero {
  constructor(el) {
    //인스턴스 객체를 초기화할 때 수행할 코드 정의
    this.el = document.querySelector(el);

    //hero가 이동할 거리, 스피드 초기화
    this.moveX = 0;
    this.speed = 11;
    this.direction = 'right';
    this.attackDamage = 10000; //히어로 공격치수
    this.hpProgress = 0;
    this.hpValue = 300000;
    this.defaultHpValue = this.hpValue;
    this.realDamage = 0;
    this.slideSpeed = 14;
    this.slideTime = 0;
    this.slideMaxTime = 30;
    this.slideDown = false;
    this.level = 1;
    this.exp = 0;
    this.maxExp = 3000;
    this.expProgress = 0;
  }
  keyMotion() {
    if (key.keyDown['left']) {
      this.direction = 'left';
      this.el.classList.add('run');
      this.el.classList.add('flip');
      this.moveX = this.moveX <= 0 ? 0 : this.moveX - this.speed;
    } else if (key.keyDown['right']) {
      this.direction = 'right';
      this.el.classList.add('run');
      this.el.classList.remove('flip');
      this.moveX = this.moveX + this.speed;
    }

    if (key.keyDown['attack']) {
      if (!bulletComProp.launch) {
        this.el.classList.add('attack');
        bulletComProp.arr.push(new Bullet());

        bulletComProp.launch = true;
      }
    }

    if (key.keyDown['slide']) {
      if (!this.slideDown) {
        this.el.classList.add('slide');
        if (this.direction === 'right') {
          this.moveX = this.moveX + this.slideSpeed;
        } else {
          this.moveX = this.moveX <= 0 ? 0 : this.moveX - this.slideSpeed;
        }
  
        if (this.slideTime > this.slideMaxTime) {
          this.el.classList.remove('slide');
          this.slideDown = true;
        }
        this.slideTime += 1;
        console.log(this.slideTime);
      }
    }

    if (!key.keyDown['left'] && !key.keyDown['right']) {
      this.el.classList.remove('run');
    }

    if (!key.keyDown['attack']) {
      this.el.classList.remove('attack');
      bulletComProp.launch = false;
    }

    if (!key.keyDown['slide']) {
      this.el.classList.remove('slide');
      this.slideDown = false;
      this.slideTime = 0;
    }

    this.el.parentNode.style.transform = `translateX(${this.moveX}px)`;
  }
  position() {
    return{
      //getBoundingClientRect(): 엘리먼트의 위치 정보 알 수 있음
      left: this.el.getBoundingClientRect().left,
      right: this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom:  gameProp.screenHeight - this.el.getBoundingClientRect().top - this.el.getBoundingClientRect().height
    }
  }
  size() {
    return{
      width: this.el.offsetWidth,
      height: this.el.offsetHeight,
    }
  }
  minusHp(monsterDamage) {
    this.hpValue = Math.max(0, this.hpValue - monsterDamage);
    this.crash();
    if (this.hpValue === 0) {
      this.dead();
    }
    this.renderHp();
  }
  plusHp(hp) {
    this.hpValue = hp;
    this.renderHp();
  }
  renderHp() {
    this.hpProgress = this.hpValue / this.defaultHpValue * 100;
    const heroHpBox = document.querySelector('.state_box .hp span');
    heroHpBox.style.width = this.hpProgress + '%';
  }
  crash() {
    this.el.classList.add('crash');
    setTimeout(() => this.el.classList.remove('crash'), 400);
  }
  dead() {
    hero.el.classList.add('dead');
    endGame();
  }
  hitDamage() {
    this.realDamage = this.attackDamage - Math.round(Math.random() * this.attackDamage * 0.1);
  }
  heroUpgrade() {
    this.attackDamage += 5000;
  }
  updateExp(exp) {
    this.exp += exp;
    this.expProgress = this.exp / this.maxExp * 100;
    document.querySelector('.hero_state .exp span').style.width = this.expProgress + '%';

    if (this.exp >= this.maxExp) {
      this.levelUp();
    }
  }
  levelUp() {
    this.level += 1;
    this.exp = 0;
    this.maxExp = this.maxExp + this.level * 1000;
    document.querySelector('.level_box strong').innerText = this.level;
    const levelGuide = document.querySelector('.hero_box .level_up');
    levelGuide.classList.add('active');

    setTimeout(() => levelGuide.classList.remove('active'), 1000);
    this.updateExp(this.exp);
    this.heroUpgrade();
    this.plusHp(this.defaultHpValue);
  }
}

class Bullet {
  constructor() {
    this.parentNode = document.querySelector('.game');
    this.el = document.createElement('div');
    this.el.className = 'hero_bullet';
    this.x = 0;
    this.y = 0;
    this.speed = 30;
    this.distance = 0;
    this.bulletDirection = 'right';
    this.init();
  }
  init() {
    this.bulletDirection = hero.direction === 'left' ? 'left' : 'right';
    this.x = this.bulletDirection === 'right' ? hero.moveX + hero.size().width/2 : hero.moveX - hero.size().width/2;
    this.y = hero.position().bottom - hero.size().height/2;
    this.distance = this.x; //검이 0부터 시작하지 않도록

    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.parentNode.appendChild(this.el);
  }
  moveBullet() {
    let setRotate = '';
    if(this.bulletDirection === 'left') {
      this.distance -= this.speed;
      setRotate = 'rotate(180deg)'
    } else {
      this.distance += this.speed;
    }

    this.el.style.transform = `translate(${this.distance}px, ${this.y}px) ${setRotate}`;
    this.crashBullet();
  }
  position() {
    return{
      left: this.el.getBoundingClientRect().left,
      right: this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom:  gameProp.screenHeight - this.el.getBoundingClientRect().top - this.el.getBoundingClientRect().height
    }
  }
  crashBullet() {
    for (let j = 0; j < allMonsterComProp.arr.length; j++) { //모든 몬스터 각각 다르게 만들기위해
      if (this.position().left > allMonsterComProp.arr[j].position().left && this.position().right < allMonsterComProp.arr[j].position().right) {
        for (let i = 0; i < bulletComProp.arr.length; i++) {
          if (bulletComProp.arr[i] === this) { //충돌한 검 찾기
            hero.hitDamage();
            bulletComProp.arr.splice(i,1);
            this.el.remove();
            this.damageView(allMonsterComProp.arr[j]);
            allMonsterComProp.arr[j].updateHp(j);
          }
        }
      }
    }
    
    if (this.position().left > gameProp.screenWidth || this.position().right < 0) {
      for (let i = 0; i < bulletComProp.arr.length; i++) {
        if (bulletComProp.arr[i] === this) { //충돌한 검 찾기
          bulletComProp.arr.splice(i,1);
          this.el.remove();
        }
      }
    }
  }
  damageView(monster) {
    this.parentNode = document.querySelector('.game_app');
    this.textDamageNode = document.createElement('div');
    this.textDamageNode.className = 'text_damage';
    this.textDamage = document.createTextNode(hero.realDamage);
    this.textDamageNode.appendChild(this.textDamage);
    this.parentNode.appendChild(this.textDamageNode);
    let textPosition = Math.random() * -100;
    let damageX = monster.position().left + textPosition;
    let damageY = monster.position().top;

    this.textDamageNode.style.transform = `translate(${damageX}px, ${-damageY}px)`;
    setTimeout(() => this.textDamageNode.remove(), 500);
  }
}

class Monster {
  constructor(property, positionX) {
    this.parentNode = document.querySelector('.game');
    this.el = document.createElement('div');
    this.el.className = 'monster_box ' + property.name;
    this.elChildren = document.createElement('div');
    this.elChildren.className = 'monster';
    this.hpNode = document.createElement('div');
    this.hpNode.className = 'hp';
    this.hpValue = property.hpValue;
    this.defaultHpValue = property.hpValue;
    this.hpInner = document.createElement('span');
    this.progress = 0;
    this.positionX = positionX;
    this.moveX = 0;
    this.speed = property.speed;
    this.crashDamage = property.crashDamage;
    this.score = property.score;
    this.exp = property.exp;

    this.init();
  }
  init() {
    this.hpNode.appendChild(this.hpInner);
    this.el.appendChild(this.hpNode);
    this.el.appendChild(this.elChildren);
    this.parentNode.appendChild(this.el);
    this.el.style.left = this.positionX + 'px';
  }
  position() {
    return{
      left: this.el.getBoundingClientRect().left,
      right: this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom:  gameProp.screenHeight - this.el.getBoundingClientRect().top - this.el.getBoundingClientRect().height
    }
  }
  updateHp(index) {
    this.hpValue = Math.max(0, this.hpValue - hero.realDamage);
    this.progress = this.hpValue / this.defaultHpValue * 100;
    this.el.children[0].children[0].style.width = this.progress + '%';

    if (this.hpValue === 0) {
      this.dead(index);
    }
  }
  dead(index) {
    this.el.classList.add('remove');
    setTimeout(() => this.el.remove, 200);
    allMonsterComProp.arr.splice(index, 1);
    this.setScore();
    this.setExp();
  }
  moveMonster() {
    if (this.moveX + this.positionX + this.el.offsetWidth + hero.position().left - hero.moveX <= 0) {
      this.moveX = hero.moveX - this.positionX + gameProp.screenWidth - hero.position().left;
    } else {
      this.moveX -= this.speed;
    }

    this.el.style.transform = `translateX(${this.moveX}px)`;
    this.crash();
  }
  crash() {
    let rightDiff = 30;
    let leftDiff = 90;

    if (hero.position().right - rightDiff > this.position().left && hero.position().left + leftDiff < this.position().right) {
      hero.minusHp(this.crashDamage);
    }
  }
  setScore() {
    stageInfo.totalScore += this.score;
    document.querySelector('.score_box').innerText = stageInfo.totalScore;
  }
  setExp() {
    hero.updateExp(this.exp);
  }
}