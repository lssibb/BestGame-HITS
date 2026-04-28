import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
  }

  create() {
    this.add.text(400, 300, 'Hello Phaser 4!', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 350, 'Edit src/main.ts to start coding', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  update() {
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
