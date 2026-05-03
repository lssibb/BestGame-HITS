import type { Building } from "./Building";
import { Drill } from "./Drill";
import { Wall } from "./Wall";

const REGISTRY: Record<string, new (scene: Phaser.Scene, x:number, y:number) => Building> = {
    drill:Drill,
    wall:Wall
};

export function createBuilding(type: string, scene: Phaser.Scene, x: number, y: number):Building{
        const BuildingClass = REGISTRY[type];
        if(!BuildingClass) throw new Error(`Unknown type: ${type}`);
        return new BuildingClass(scene,x,y);
    }
