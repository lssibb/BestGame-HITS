import { Building } from "./Building";
import { BUILDING_CONFIGS } from '../core/BuildingConfigs';

export class Wall extends Building{

    constructor(scene: Phaser.Scene, x:number, y:number){
        super(scene, x, y, BUILDING_CONFIGS.wall.color, BUILDING_CONFIGS.wall.healthPoints);
    }

    update(delta: number): void {
        
    }

    onPlace(): void {
        
    }
}