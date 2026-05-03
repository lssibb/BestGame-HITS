
import { BUILDING_CONFIGS } from '../core/BuildingConfigs';

export class BuildingSelector {
    private scene: Phaser.Scene;
    private onSelect: (type: string) => void;

    constructor(scene:Phaser.Scene,onSelect:(type:string)=>void){
        this.scene = scene;
        this.onSelect = onSelect;
        this.scene.add.rectangle(750, 300, 100, 600, 0x333333);

        let y = 100;
        for(const [type,config] of Object.entries(BUILDING_CONFIGS)){
            this.createButton(740,y,type,config.color);
            y+=70;
        }
        
    }
    
    private createButton(x:number,y:number,type:string,color:number){
        const button = this.scene.add.rectangle(x,y,50,50,color);
        button.setInteractive();
        button.on('pointerdown',()=>{
            this.onSelect(type);
        })

    }
}