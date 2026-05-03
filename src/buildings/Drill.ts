import { BUILDING_CONFIGS } from "../core/BuildingConfigs";
import { eventBus } from "../core/EventBus";
import { Building } from "./Building";

export class Drill extends Building {
    private timer: number = 0;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, BUILDING_CONFIGS.drill.color,BUILDING_CONFIGS.drill.healthPoints);
    }

    public update(delta: number): void {
        this.timer+=delta;
        if(this.timer>=1000){
            eventBus.emit("resource-mined",{type:"iron",amount:50});
            this.timer = 0;
        }
        
    }

    public onPlace(): void {

    }
}
