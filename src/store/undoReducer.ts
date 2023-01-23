import * as Constants from "./constants";
import * as Act from "./actions";
import { Action, ActionType } from "./actions";
import { Grid, cellRangeEmpty, cellsEmpty, readColumnFromCells } from "./gridReducer";

export type UndoActions = Action[];

// Each element in the undo stack is a group of actions
export type UndoState = {
    undoStack: UndoActions[],
    redoStack: UndoActions[]
};

export function notImplemented() {
    return new Error("Not implemented.");    
}

// Returns true if action leads to a mutation that is undoable
export function isUndoableAction(action: Action): boolean {
    switch (action.type) {
        case ActionType.ClearGrid:
        case ActionType.SetGrid:
        case ActionType.PutValue:
        case ActionType.InsertCell:
        case ActionType.InsertRow:
        case ActionType.InsertColumn:
        case ActionType.DeleteCell:
        case ActionType.DeleteRow:
        case ActionType.DeleteColumn:
        case ActionType.FillRowAt:
        case ActionType.FillColumnAt:
        case ActionType.ClearRowAt:
        case ActionType.ClearColumnAt:
            return true;

        case ActionType.MoveCursorByCell:
        case ActionType.MoveCursorToEdge:
        case ActionType.MoveCursorTo:
        case ActionType.Undo:
        case ActionType.Redo:
            return false;            
    }
}

function removeNull<T>(values: (T | null)[]): T[] {
    return values.filter(v => v !== null) as T[];
}

// Function calculates how to undo a specific action, given the current state
export function calculateUndoActions(state: Grid, action: Action): Action[] {
    switch (action.type) {
        case ActionType.ClearGrid:
            return removeNull([cellsEmpty(state.cells) ? null : Act.createSetGridAction(state.cells)]);

        case ActionType.SetGrid:
            return [cellsEmpty(state.cells) ? Act.createClearGridAction() : Act.createSetGridAction(state.cells)];

        case ActionType.PutValue: {
            const { row, column } = state.cursor;
            return [
                Act.createMoveCursorToAction(row, column),
                Act.createPutValueAction(state.cells[row][column])
            ];
        }

        case ActionType.InsertCell: {
            const { row, column } = state.cursor;
            const { shiftDirection } = action;
            const { endRow, endColumn } =
                shiftDirection === Act.ShiftDirection.Horizontal
                    ? { endRow: row, endColumn: Constants.GridColumns - 1 }
                    : { endRow: Constants.GridRows - 1, endColumn: column };

            // Value in cell shifted off end of sheet
            const endCellValue = state.cells[endRow][endColumn];
            
            // Restore end cell if end cell value is not empty
            const restoreEndCell = endCellValue !== '';

            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createDeleteCellAction(shiftDirection),
                restoreEndCell ? Act.createMoveCursorToAction(endRow, endColumn) : null,
                restoreEndCell ? Act.createPutValueAction(endCellValue) : null,
                restoreEndCell ? Act.createMoveCursorToAction(row, column) : null
            ]);
        }

        case ActionType.InsertRow: {
            const { row, column } = state.cursor;
            const lastRow = Constants.GridRows - 1;
            const lastColumn = Constants.GridColumns - 1;
            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createDeleteRowAction(),
                cellRangeEmpty(
                    state.cells,
                    {row: lastRow, column: 0},
                    {row: lastRow, column: lastColumn})
                ? null
                : Act.createFillRowAtAction(lastRow, state.cells[lastRow])
            ]);
        }

        case ActionType.InsertColumn: {
            const { row, column } = state.cursor;
            const lastRow = Constants.GridRows - 1;
            const lastColumn = Constants.GridColumns - 1;
            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createDeleteColumnAction(),
                cellRangeEmpty(
                    state.cells,
                    {row: 0, column: lastColumn},
                    {row: lastRow, column: lastColumn})
                ? null
                : Act.createFillColumnAtAction(lastColumn, readColumnFromCells(state.cells, lastColumn))
            ]);
        }

        case ActionType.DeleteCell: {
            const { row, column } = state.cursor;
            const { shiftDirection } = action;

            // Value in cell (row, column) will be trashed by DeleteCell
            const trashedCellValue = state.cells[row][column];

            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createInsertCellAction(shiftDirection),
                trashedCellValue === '' ? null : Act.createPutValueAction(trashedCellValue) 
            ]);
        }
    
        case ActionType.DeleteRow: {
            const { row, column } = state.cursor;
            const lastColumn = Constants.GridColumns - 1;
            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createInsertRowAction(),
                cellRangeEmpty(
                    state.cells,
                    {row, column: 0},
                    {row, column: lastColumn})
                ? null
                : Act.createFillRowAtAction(row, state.cells[row])
            ]);
        }

        case ActionType.DeleteColumn: {
            const { row, column } = state.cursor;
            const lastRow = Constants.GridRows - 1;
            return removeNull([
                Act.createMoveCursorToAction(row, column),
                Act.createInsertColumnAction(),
                cellRangeEmpty(
                    state.cells,
                    {row: 0, column},
                    {row: lastRow, column})
                ? null
                : Act.createFillColumnAtAction(column, readColumnFromCells(state.cells, column))
            ]);
        }

        case ActionType.FillRowAt: {
            const { row } = action;
            const lastColumn = Constants.GridColumns - 1;

            // If row is currently empty, then we will need to clear the row to undo a fill row; else we need to replace with the current contents
            return [
                cellRangeEmpty(state.cells, { row, column: 0}, { row, column: lastColumn})
                ? Act.createClearRowAtAction(row)
                : Act.createFillRowAtAction(row, state.cells[row])
            ];
        }

        case ActionType.FillColumnAt: {
            const { column } = action;
            const lastRow = Constants.GridRows - 1;

            // If column is currently empty, then we will need to clear the column to undo a fill column; else we need to replace with the current contents
            return [
                cellRangeEmpty(state.cells, { row: 0, column}, { row: lastRow, column})
                ? Act.createClearColumnAtAction(column)
                : Act.createFillColumnAtAction(column, readColumnFromCells(state.cells, column))
            ];
        }

        case ActionType.ClearRowAt: {
            const { row } = action;
            const lastColumn = Constants.GridColumns - 1;

            // If row is currently empty, then ClearRowAt is a no-op, so there's nothing to undo
            if (cellRangeEmpty(state.cells, { row, column: 0}, { row, column: lastColumn})) {
                return [];
            }

            // Else, to undo a clear row, we need to restore the current contents
            return [Act.createFillRowAtAction(row, state.cells[row])];
        }

        case ActionType.ClearColumnAt: {
            const { column } = action;
            const lastRow = Constants.GridRows - 1;

            // If column is currently empty, then ClearColumnAt is a no-op, so there's nothing to undo
            if (cellRangeEmpty(state.cells, { row: 0, column}, { row: lastRow, column})) {
                return [];
            }

            // Else, to undo a clear column, we need to restore the current contents
            return [Act.createFillColumnAtAction(column, readColumnFromCells(state.cells, column))];
       }
        
        case ActionType.MoveCursorByCell:
        case ActionType.MoveCursorToEdge:
        case ActionType.MoveCursorTo:
        case ActionType.Undo:
        case ActionType.Redo:
            // Not all actions are undoable
            return [];        
    }    
}