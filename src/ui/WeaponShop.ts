import { WEAPON_CONFIGS, WeaponType } from '../player/Weapon';
import { GameState } from '../core/GameState';

export class WeaponShop {
  private buttons: Map<WeaponType, Phaser.GameObjects.Container> = new Map();
  private priceTexts: Map<WeaponType, Phaser.GameObjects.Text> = new Map();
  private selectedWeapon: WeaponType = 'hand';

  constructor(scene: Phaser.Scene, gameState: GameState, onWeaponSelect: (type: WeaponType) => void) {
    const startX = 15;
    const startY = 120;
    const buttonWidth = 70;
    const buttonHeight = 80;
    const spacing = 5;

    const weaponTypes: WeaponType[] = ['hand', 'axe', 'pistol'];

    weaponTypes.forEach((type, index) => {
      const x = startX + (buttonWidth + spacing) * index;
      const container = scene.add.container(x, startY);

      // Фон кнопки
      const bg = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2a2a3e)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x00d2ff);

      // Иконка оружия
      const icon = scene.add.sprite(0, -15, 'weapons', type).setScale(1.2);

      // Название
      const name = scene.add.text(0, 10, WEAPON_CONFIGS[type].name, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Цена
      const cost = WEAPON_CONFIGS[type].cost;
      const priceText = scene.add.text(0, 28, `${cost}`, {
        fontSize: '10px',
        color: cost === 0 ? '#90EE90' : '#FFD700',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      container.add([bg, icon, name, priceText]);
      this.buttons.set(type, container);
      this.priceTexts.set(type, priceText);

      bg.on('pointerdown', () => {
        if (cost <= gameState.resources.iron + gameState.resources.stone) {
          this.select(type);
          onWeaponSelect(type);
        }
      });

      bg.on('pointerover', () => {
        if (bg.strokeColor !== 0x00ff00) {
          bg.setStrokeStyle(2, 0x00ff00);
        }
      });

      bg.on('pointerout', () => {
        if (this.selectedWeapon !== type) {
          bg.setStrokeStyle(2, 0x00d2ff);
        }
      });
    });

    this.select('hand');
  }

  private select(type: WeaponType): void {
    this.selectedWeapon = type;
    this.buttons.forEach((container, id) => {
      const bg = container.first as Phaser.GameObjects.Rectangle;
      if (id === type) {
        bg.setStrokeStyle(3, 0x00ff00);
        bg.setFillStyle(0x333355);
      } else {
        bg.setStrokeStyle(2, 0x00d2ff);
        bg.setFillStyle(0x2a2a3e);
      }
    });
  }

  public updateAffordability(iron: number, stone: number): void {
    const totalResources = iron + stone;

    this.priceTexts.forEach((text, weaponType) => {
      const cost = WEAPON_CONFIGS[weaponType].cost;
      if (cost > totalResources) {
        text.setColor('#ff6b6b'); // Красный - не можешь купить
      } else {
        text.setColor(cost === 0 ? '#90EE90' : '#FFD700');
      }
    });
  }
}
