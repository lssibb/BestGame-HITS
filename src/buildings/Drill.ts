import { eventBus } from "../core/EventBus";
import { Building } from "./Building";

export class Drill extends Building {
    static readonly COLOR = 0x00aaff;
    static readonly HEALTHPOINTS = 300;
    private timer: number = 0;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, Drill.COLOR,Drill.HEALTHPOINTS);
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
