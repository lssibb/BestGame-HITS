export abstract class Building {
  sprite: Phaser.GameObjects.Sprite;
  gridX: number;
  gridY: number;
  healthPoints: number;
  maxHealthPoints: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    frameKey: string,
    healthPoints: number
  ) {
    this.gridX = x;
    this.gridY = y;
    this.healthPoints = healthPoints;
    this.maxHealthPoints = healthPoints;

    this.sprite = scene.add.sprite(x, y, 'buildings', frameKey);
    this.sprite.setOrigin(0, 0);
    this.sprite.setDepth(10);
  }

  abstract update(delta: number): void;
  abstract onPlace(): void;

  public takeDamage(amount: number): boolean {
    this.healthPoints -= amount;
    return this.healthPoints <= 0;
  }

  public destroy(): void {
    this.sprite.destroy();
  }
}