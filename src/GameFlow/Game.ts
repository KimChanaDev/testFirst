import { GAME_STATE } from "../Enum/GameState.js";

export abstract class Game
{
    public gameState: number = GAME_STATE.NOT_STARTED;
    constructor()
    {

    }
}