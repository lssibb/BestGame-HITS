export abstract class Building{
    sprite: Phaser.GameObjects.Rectangle;
    gridX: number;
    gridY: number;
    healthPoints: number;

    constructor(scene: Phaser.Scene, x: number, y: number, color: number, healthPoints: number){
        this.gridX = x;
        this.gridY = y;
        this.sprite = scene.add.rectangle(
            x,
            y,
            30,30,
            color
        );
        this.healthPoints = healthPoints;
        this.sprite.setOrigin(0,0);
        this.sprite.setDepth(10);
    }

    abstract update(delta: number): void;
    abstract onPlace(): void;

    public destroy(){
        this.sprite.destroy();
    }
}