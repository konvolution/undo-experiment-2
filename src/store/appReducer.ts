import { stat } from "fs";
import * as Act from "./actions";
import { cursorReducer } from "./cursorReducer";
import { Grid, gridReducer, initialGrid } from "./gridReducer";
import { calculateUndoActions, isUndoableAction, UndoActions, UndoState } from "./undoReducer";

export type AppState = Grid & UndoState;

export const initialState: AppState = {
    ...initialGrid,
    undoStack: [],
    redoStack: []
};

function extractGridState(appState: AppState): Grid {
    const { cursor, cells } = appState;
    return {
        cursor, cells
    };
}

function performUndoActions(gridState: Grid, undoActions: UndoActions, calcRedo: boolean): { grid: Grid, redoActions: UndoActions } {
    const redoGroups: UndoActions[] = [];

    for (const undoAction of undoActions) {
        if (calcRedo) {
            // Calculate the actions to reverse the undo action
            const redoActions = calculateUndoActions(gridState, undoAction);

            // Push redoActions onto redoGroups
            redoGroups.push(redoActions);
        }

        gridState = gridReducer(gridState, undoAction);
    }

    // In order to undo all of the undoActions, we need to apply the redo groups in reverse order
    const redoActions: UndoActions = [];

    for (let i = redoGroups.length - 1; i >= 0; --i) {
        redoActions.push(...redoGroups[i]);
    }

    return {
        grid: gridState,
        redoActions
    };
}


export function appReducer(state: AppState, action: Act.Action): AppState {
    switch (action.type) {
        case Act.ActionType.Undo:
            if (state.undoStack.length > state.redoStack.length) {
                /**
                 * Every user action requires one or more actions to undo it. The reasons why more than one action may be required are:
                 *   1. Actions depend on the current cursor, but cursor moves are not undoable. Hence we need to set the cursor to the
                 *      location where the action was performed.
                 *   2. Actions are destructive. e.g. insert row will push values off the grid that need to be restored to undo.
                 *
                 * To undo, we need to perform the undo actions calculated when the original user action was performed. As we perform
                 * the undo actions, we calculate how to undo the undo actions (i.e. to get back to the current state) and push this
                 * onto the redo stack.
                 * 
                 * Note: we don't throw away the undo actions, in case the user wants to undo again after redo. This avoids having to
                 * calculate the undo actions again from the redo. Hence every entry (action list) on the redo stack is matched to an entry
                 * on the undo stack.
                 * 
                 * Thus, an undo operation does not change the undo stack. It only pushes to the redo stack. It also means that the
                 * undo actions to perform are not necessarily the "top" of the undo stack.
                 */

                const undoResult = performUndoActions(extractGridState(state), state.undoStack[state.undoStack.length - 1 - state.redoStack.length], true);

                return {
                    ...state,
                    ...undoResult.grid,
                    redoStack: [...state.redoStack, undoResult.redoActions]
                };
            }
            break;

        case Act.ActionType.Redo:
            if (state.redoStack.length > 0) {
                /**
                 * To redo, we perform the actions on the top of the redo stack. We don't need to calculate how to undo redo actions, as we
                 * left these on the undo stack when we calculated the redo actions from the undo operation.
                 */
                const undoResult = performUndoActions(extractGridState(state), state.redoStack[state.redoStack.length - 1], false);

                return {
                    ...state,
                    ...undoResult.grid,
                    redoStack: state.redoStack.slice(0, state.redoStack.length - 1)
                };
            }
            break;

        default: {
            const { cursor, cells } = state;
            let gridState: Grid = {
                cursor, cells
            };
            if (isUndoableAction(action)) {
                /**
                 * In order to ensure that the user can always go back to any point in the past, if the user performs an action
                 * *after* one or more undo operations, we concatenate all of the redo entries (in reverse order) into a single
                 * entry, and push it onto the undo stack. This entry will restore the state to the point in time *before*
                 * the undo actions. Because we left the undo actions on the stack when the user originally performed the undo
                 * operations, it effectively means that the undo operations are pushed back onto the undo stack. What we end
                 * up with is as follows:
                 *    Let:
                 *         A         = the current action
                 *         L         = the last state with an empty redo stack;
                 *         U1,...,Un = the list of undo entries corresponding to the undo operations performed by the user just
                 *                     before the current action. These entries occur *after* the top of the undo stack, so they
                 *                     are conceptually no longer on the undo stack. 
                 *         Ri        = the redo entry calculated for undo entry Ui
                 *         Ua        = the undo entry calculated for action A 
                 *         S         = the current state (against which action, A, is being performed)
                 *         Sa        = the state after action A is performed
                 * 
                 *    Then:
                 *         R1,...,Rn will be combined into a single redo entry, RL, and pushed onto the undo stack. The redo
                 *         stack is emptied, which essentially pushes U1,...,Un back onto the undo stack.
                 * 
                 *         Ua is calculated for action A
                 * 
                 *         The undo stack then becomes: ...,Un,...,U1, RL, Ua
                 *
                 *     The final effect is:
                 * 
                 *         1. Sa is the final state.
                 *         2. Undo entry, Ua, will restore the state to S.
                 *         3. Undo entry, RL, will restore the state to L.
                 *         4. Undo entries U1,...,Un will repeat the undo operations that the user performed prior to action A,
                 *            after which, we will end up back in state S.
                 */

                const squashRedo = state.redoStack.length === 0 ? [] : [[...state.redoStack].reverse().reduce(
                    (accum, actionsRedoOnce) => {
                        accum.push(...actionsRedoOnce);
                        return accum;
                    },
                    []
                )];

                state = {
                    ...state,
                    undoStack: [...state.undoStack, ...squashRedo, calculateUndoActions(gridState, action)],
                    redoStack: []
                };
            }

            return {
                ...state,
                ...gridReducer(gridState, action)
            };
        }
    }

    return state;
}

    