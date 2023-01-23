import * as Constants from "./constants";
import { Action, ActionType, ShiftDirection } from "./actions";
import { Cursor, cursorReducer } from "./cursorReducer"

export type Cells = string[][];

export type Grid = {
    cursor: Cursor;
    cells: Cells;
};

const makeEmptyCells = () => Array.from({length: Constants.GridRows}).map(_ => new Array(Constants.GridColumns).fill(''));

function putValue(cells: Cells, loc: Cursor, value: string): Cells {
    const { row, column } = loc;
    const changeRow = cells[row];
    return [
        ...cells.slice(0, row),
        [
            ...changeRow.slice(0, column),
            value,
            ...changeRow.slice(column + 1)
        ],
        ...cells.slice(row + 1)
    ];
}

function insertCellShiftRight(cells: Cells, loc: Cursor): Cells {
    const { row, column } = loc;
    const changeRow = cells[row];
    return [
        ...cells.slice(0, row),
        [
            ...changeRow.slice(0, column),
            '',
            ...changeRow.slice(column, changeRow.length - 1)
        ],
        ...cells.slice(row + 1)
    ];
}

function insertCellShiftDown(cells: Cells, loc: Cursor): Cells {
    // Make shallow copy of original cells
    const result = [...cells];

    const { row, column } = loc;

    let newValue = '';
    for (let r = row; r < cells.length; ++r) {
        const changeRow = cells[r];

        result[r] = [ 
            ...changeRow.slice(0, column),
            newValue,
            ...changeRow.slice(column, changeRow.length - 1)
        ];

        newValue = changeRow[column];
    }

    return result;
}

function insertRow(cells: Cells, row: number): Cells {
    return [
        ...cells.slice(0, row),
        new Array(Constants.GridColumns).fill(''),
        ...cells.slice(row, cells.length - 1)
    ];
}

function insertColumn(cells: Cells, column: number): Cells {
    return cells.map(row => [...row.slice(0, column), '', ...row.slice(column, row.length - 1)]);
}

function deleteCellShiftLeft(cells: Cells, loc: Cursor): Cells {
    const { row, column } = loc;
    const changeRow = cells[row];
    return [
        ...cells.slice(0, row),
        [
            ...changeRow.slice(0, column),
            ...changeRow.slice(column + 1, changeRow.length),
            ''
        ],
        ...cells.slice(row + 1)
    ];
}

function deleteCellShiftUp(cells: Cells, loc: Cursor): Cells {
    // Make shallow copy of original cells
    const result = [...cells];

    const { row, column } = loc;

    let newValue = '';
    for (let r = cells.length - 1; r > row; --r) {
        const changeRow = cells[r];

        result[r] = [ 
            ...changeRow.slice(0, column),
            newValue,
            ...changeRow.slice(column, changeRow.length - 1)
        ];

        newValue = changeRow[column];
    }

    return result;
}

function deleteRow(cells: Cells, row: number): Cells {
    return [
        ...cells.slice(0, row),
        ...cells.slice(row + 1),
        new Array(Constants.GridColumns).fill('')
    ];
}

function fillRow(cells: Cells, row: number, values: string[]): Cells {
    return [
        ...cells.slice(0, row),
        values,
        ...cells.slice(row + 1)
    ];
}

function fillColumn(cells: Cells, column: number, values: string[]): Cells {
    return cells.map(
        (row, i) => [...row.slice(0, column), values[i], ...row.slice(column + 1)]
    );
}

function clearRow(cells: Cells, row: number): Cells {
    return fillRow(cells, row, new Array(Constants.GridColumns).fill(''));
}

function clearColumn(cells: Cells, column: number): Cells {
    return cells.map(
        (row, i) => [...row.slice(0, column), '', ...row.slice(column + 1)]
    );
}

function deleteColumn(cells: Cells, column: number): Cells {
    return cells.map(row => [...row.slice(0, column), ...row.slice(column + 1, row.length), '']);
}

export function readColumnFromCells(cells: Cells, column: number): string[] {
    return cells.map(row => row[column]);
}

// Return true if range form [rangeStart, rangeEnd] (inclusive)
export function cellRangeEmpty(cells: Cells, rangeStart: Cursor, rangeEnd: Cursor): boolean {
    for (let row = rangeStart.row; row <= rangeEnd.row; ++row) {
        const selectRow = cells[row];
        for (let column = rangeStart.column; column <= rangeEnd.column; ++column) {
            if (selectRow[column] !== '') {
                return false;
            }
        }
    }

    return true;
}

export function cellsEmpty(cells: Cells): boolean {
    return cellRangeEmpty(
        cells,
        {row: 0, column: 0},
        {row: Constants.GridRows - 1, column: Constants.GridColumns - 1});
}

export const initialGrid: Grid = {
    cursor: { row: 0, column: 0},
    cells: [
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
};

function cellsReducer(state: Cells, cursor: Cursor, action: Action): Cells {

    switch(action.type) {
        case ActionType.ClearGrid:
            return initialGrid.cells; 

        case ActionType.SetGrid:
            return action.cells;

        case ActionType.PutValue:
            return putValue(state, cursor, action.value);

        case ActionType.InsertCell: {
            const insertOperation = action.shiftDirection === ShiftDirection.Horizontal ? insertCellShiftRight : insertCellShiftDown;

            return insertOperation(state, cursor);
        }

        case ActionType.InsertRow:
            return insertRow(state, cursor.row);

        case ActionType.InsertColumn:
            return insertColumn(state, cursor.column);

        case ActionType.DeleteCell: {
            const deleteOperation = action.shiftDirection === ShiftDirection.Horizontal ? deleteCellShiftLeft : deleteCellShiftUp;

            return deleteOperation(state, cursor);
        }

        case ActionType.DeleteRow:
            return deleteRow(state, cursor.row);

        case ActionType.DeleteColumn:   
            return deleteColumn(state, cursor.column);

        case ActionType.FillRowAt: {
            const { row, values } = action;
            return fillRow(state, row, values);
        }

        case ActionType.FillColumnAt: {
            const { column, values } = action;
            return fillColumn(state, column, values);
        }

        case ActionType.ClearRowAt: {
            const { row } = action;
            return clearRow(state, row);
        }

        case ActionType.ClearColumnAt: {
            const { column } = action;
            return clearColumn(state, column);
        }

    }

    return state;
}

export function gridReducer(state: Grid, action: Action): Grid {
    return {
        cursor: cursorReducer(state.cursor, action),
        cells: cellsReducer(state.cells, state.cursor, action)
    };
}
