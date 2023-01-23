import { Action, createDeleteCellAction, createDeleteColumnAction, createInsertCellAction, createInsertColumnAction, createPutValueAction, ShiftDirection } from "./actions";
import { Cells, Grid, gridReducer, initialGrid } from "./gridReducer";
import * as constants from './constants';

const emptyRow = new Array(constants.GridColumns).fill('');

const testCells: Cells = [
    [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
    [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
    [ '',  '',  '',  '', 'o', 'o',  '',  '',  '',  ''],
    [ '',  '',  '', 'o',  '',  '', 'o',  '',  '',  ''],
    [ '',  '', 'o', 'o',  '',  '', 'o', 'o',  '',  ''],
    [ '',  '', 'O',  '',  '',  '',  '', 'O',  '',  ''],
    [ '', 'O', 'O',  '',  '',  '',  '', 'O', 'O',  ''],
    [ '', 'O', 'O', 'O',  '',  '', 'O', 'O', 'O',  ''],
    [ '',  '',  '',  '', 'O', 'O',  '',  '',  '',  ''],
    [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],  
]

function cellsToString(cells: Cells): string {
    return cells.map(row => row.map(cell => cell === '' ? ' ' : cell).join('')).join('\n');
}

function doGridActions(state: Grid, ...actions: Action[]): Grid {
    return actions.reduce(
        (state, action) => gridReducer(state, action),
        state
    );
}

describe("Grid reducer tests", () => {

    test('put value', () => {
        const inputState: Grid = {
            cursor: {row: 4, column: 3},
            cells: testCells
        };

        const result = gridReducer(inputState, createPutValueAction('X')); 

        console.log("Before:\n" + cellsToString(inputState.cells));
        console.log("After:\n" + cellsToString(result.cells));

        expect(result).toEqual({
            cursor: { row: 4, column: 3 },
            cells: [
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '', 'o', 'o',  '',  '',  '',  ''],
                [ '',  '',  '', 'o',  '',  '', 'o',  '',  '',  ''],
                [ '',  '', 'o', 'X',  '',  '', 'o', 'o',  '',  ''],
                [ '',  '', 'O',  '',  '',  '',  '', 'O',  '',  ''],
                [ '', 'O', 'O',  '',  '',  '',  '', 'O', 'O',  ''],
                [ '', 'O', 'O', 'O',  '',  '', 'O', 'O', 'O',  ''],
                [ '',  '',  '',  '', 'O', 'O',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],  
            ]
        });
    });

    test('insert cell and shift right', () => {
        const inputState: Grid = {
            cursor: {row: 4, column: 3},
            cells: testCells
        };

        const result = gridReducer(inputState, createInsertCellAction(ShiftDirection.Horizontal)); 

        console.log("Before:\n" + cellsToString(inputState.cells));
        console.log("After:\n" + cellsToString(result.cells));

        expect(result).toEqual({
            cursor: { row: 4, column: 3 },
            cells: [
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '', 'o', 'o',  '',  '',  '',  ''],
                [ '',  '',  '', 'o',  '',  '', 'o',  '',  '',  ''],
                [ '',  '', 'o',  '', 'o',  '',  '', 'o', 'o',  ''],
                [ '',  '', 'O',  '',  '',  '',  '', 'O',  '',  ''],
                [ '', 'O', 'O',  '',  '',  '',  '', 'O', 'O',  ''],
                [ '', 'O', 'O', 'O',  '',  '', 'O', 'O', 'O',  ''],
                [ '',  '',  '',  '', 'O', 'O',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],  
            ]
        });
    });

    test('insert column twice', () => {
        const inputState: Grid = {
            cursor: {row: 4, column: 3},
            cells: testCells
        };

        const insertColumnAction = createInsertColumnAction();

        const result = doGridActions(inputState, insertColumnAction, insertColumnAction); 

        console.log("Before:\n" + cellsToString(inputState.cells));
        console.log("After:\n" + cellsToString(result.cells));

        expect(result).toEqual({
            cursor: { row: 4, column: 3 },
            cells: [
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '', 'o', 'o',  '',  ''],
                [ '',  '',  '',  '',  '', 'o',  '',  '', 'o',  ''],
                [ '',  '', 'o',  '',  '', 'o',  '',  '', 'o', 'o'],
                [ '',  '', 'O',  '',  '',  '',  '',  '',  '', 'O'],
                [ '', 'O', 'O',  '',  '',  '',  '',  '',  '', 'O'],
                [ '', 'O', 'O',  '',  '', 'O',  '',  '', 'O', 'O'],
                [ '',  '',  '',  '',  '',  '', 'O', 'O',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],  
            ]
        });
    });

    test('delete column', () => {
        const inputState: Grid = {
            cursor: {row: 4, column: 3},
            cells: testCells
        };

        const result = doGridActions(inputState, createDeleteColumnAction()); 

        console.log("Before:\n" + cellsToString(inputState.cells));
        console.log("After:\n" + cellsToString(result.cells));

        expect(result).toEqual({
            cursor: { row: 4, column: 3 },
            cells: [
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],
                [ '',  '',  '', 'o', 'o',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '', 'o',  '',  '',  '',  ''],
                [ '',  '', 'o',  '',  '', 'o', 'o',  '',  '',  ''],
                [ '',  '', 'O',  '',  '',  '', 'O',  '',  '',  ''],
                [ '', 'O', 'O',  '',  '',  '', 'O', 'O',  '',  ''],
                [ '', 'O', 'O',  '',  '', 'O', 'O', 'O',  '',  ''],
                [ '',  '',  '', 'O', 'O',  '',  '',  '',  '',  ''],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ''],  
            ]
        });
    });

});
