export type SOCKET_EVENT = SOCKET_GAME_EVENTS | BUILD_IN_SOCKET_GAME_EVENTS;
export enum SOCKET_GAME_EVENTS
{
	PLAYER_CONNECTED = 'player_connected',
	PLAYER_DISCONNECTED = 'player_disconnected',
	PLAYERS_IN_GAME = 'players_in_game',
	PLAYER_TOGGLE_READY = 'player_toggle_ready',
	START_GAME = 'start_game',
	GET_GAME_STATE = 'get_game_state',
	CARD_PLAYED = 'card_played',
	CARD_WITH_OPTION_PLAYED = 'card_with_option_played',
	CARDS_TAKEN = 'cards_taken',
	TURN_FINISHED = 'turn_finished',
	UPDATE_ACTIONS = 'update_actions',
	GAME_FINISHED = 'game_finished',
	AUCTION = 'auction',
	SELECT_MAIN_CARD = 'select_main_card'
}
export enum BUILD_IN_SOCKET_GAME_EVENTS
{
	CONNECTION = 'connection',
	DISCONNECT = 'disconnect',
	ERROR = 'error',
}
