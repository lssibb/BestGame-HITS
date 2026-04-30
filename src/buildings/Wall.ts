import { Building } from "./Building";

export class Wall extends Building{
    static readonly COLOR = 0xA0522D;
    static readonly HEALTHPOINTS = 150;

    constructor(scene: Phaser.Scene, x:number, y:number){
        super(scene, x, y, Wall.COLOR, Wall.HEALTHPOINTS);
    }

    update(delta: number): void {
        
    }

    onPlace(): void {
        
    }
}