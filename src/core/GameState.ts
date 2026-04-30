import { eventBus } from "./EventBus";


export class GameState{
    public resources =0;

    constructor(){
        eventBus.on("resource-mined",(payload)=>{
            this.resources+=payload.amount;
        })
    }


}

