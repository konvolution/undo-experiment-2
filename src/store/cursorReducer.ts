import { Action, ActionType, Direction } from './actions';
import * as constants from './constants';

export type Cursor = {
    row: number,
    column: number,
};

export function cursorReducer(state: Cursor, action: Action): Cursor {
    switch(action.type) {
        case ActionType.MoveCursorByCell:
            switch(action.direction) {
                case Direction.Right: return {
                    ...state,
                    column: Math.min(state.column + 1, constants.GridColumns - 1)
                }
                case Direction.Down: return {
                    ...state,
                    row: Math.min(state.row + 1, constants.GridRows - 1)
                }
                case Direction.Left: return {
                    ...state,
                    column: Math.max(state.column - 1, 0)
                }
                case Direction.Up: return {
                    ...state,
                    row: Math.max(state.row - 1, 0)
                }
            }
            break;

        case ActionType.MoveCursorToEdge:
            switch(action.direction) {
                case Direction.Right: return {
                    ...state,
                    column: constants.GridColumns - 1
                }
                case Direction.Down: return {
                    ...state,
                    row: constants.GridRows - 1
                }
                case Direction.Left: return {
                    ...state,
                    column: 0
                }
                case Direction.Up: return {
                    ...state,
                    row: 0
                }
            }
            break;
   
        case ActionType.MoveCursorTo: {
            const { row, column } = action;
            return { row, column };
        }
    }

    return state;
}