import { Cells } from "./gridReducer";

export const ActionType = {
    ClearGrid: "ClearGrid",
    SetGrid: "SetGrid",
    MoveCursorByCell: "MoveCursorByCell",
    MoveCursorToEdge: "MoveCursorToEdge",
    MoveCursorTo: "MoveCursorTo",
    PutValue: "PutValue",
    InsertCell: "InsertCell",
    InsertRow: "InsertRow",
    InsertColumn: "InsertColumn",
    DeleteCell: "DeleteCell",
    DeleteRow: "DeleteRow",
    DeleteColumn: "DeleteColumn",
    FillRowAt: "FillRowAt",
    FillColumnAt: "FillColumnAt",
    ClearRowAt: "ClearRowAt",
    ClearColumnAt: "ClearColumnAt",
    Undo: "Undo",
    Redo: "Redo"
} as const;

export type ActionType = typeof ActionType[keyof typeof ActionType];

export const Direction = {
    Right: "Right",
    Down: "Down",
    Left: "Left",
    Up: "Up",
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export const ShiftDirection = {
  Horizontal: "Horizontal",
  Vertical: "Vertical",
} as const;

export type ShiftDirection = typeof ShiftDirection[keyof typeof ShiftDirection];
  
export interface ActionBase {
    type: ActionType;
}

export interface ActionClearGrid extends ActionBase {
  type: typeof ActionType.ClearGrid;
}

export interface ActionSetGrid extends ActionBase {
  type: typeof ActionType.SetGrid;
  cells: Cells;
}

export interface ActionMoveCursorByCell extends ActionBase {
    type: typeof ActionType.MoveCursorByCell;
    direction: Direction;
}

export interface ActionMoveCursorToEdge extends ActionBase {
    type: typeof ActionType.MoveCursorToEdge;
    direction: Direction;
}

export interface ActionMoveCursorTo extends ActionBase {
  type: typeof ActionType.MoveCursorTo;
  row: number;
  column: number;
}

export interface ActionPutValue extends ActionBase {
  type: typeof ActionType.PutValue;
  value: string;
}

export interface ActionInsertCell extends ActionBase {
  type: typeof ActionType.InsertCell;
  shiftDirection: ShiftDirection;
}

export interface ActionInsertRow extends ActionBase {
  type: typeof ActionType.InsertRow;
}

export interface ActionInsertColumn extends ActionBase {
  type: typeof ActionType.InsertColumn;
}

export interface ActionDeleteCell extends ActionBase {
  type: typeof ActionType.DeleteCell;
  shiftDirection: ShiftDirection;
}

export interface ActionDeleteRow extends ActionBase {
  type: typeof ActionType.DeleteRow;
}

export interface ActionDeleteColumn extends ActionBase {
  type: typeof ActionType.DeleteColumn;
}

export interface ActionFillRowAt extends ActionBase {
  type: typeof ActionType.FillRowAt;
  row: number;
  values: string[];
}

export interface ActionFillColumnAt extends ActionBase {
  type: typeof ActionType.FillColumnAt;
  column: number;
  values: string[];
}

export interface ActionClearRowAt extends ActionBase {
  type: typeof ActionType.ClearRowAt;
  row: number;
}

export interface ActionClearColumnAt extends ActionBase {
  type: typeof ActionType.ClearColumnAt;
  column: number;
}

export interface ActionUndo extends ActionBase {
  type: typeof ActionType.Undo;
}

export interface ActionRedo extends ActionBase {
  type: typeof ActionType.Redo;
}

export type Action =
| ActionClearGrid
| ActionSetGrid
| ActionMoveCursorByCell
| ActionMoveCursorToEdge
| ActionMoveCursorTo
| ActionPutValue
| ActionInsertCell
| ActionInsertRow
| ActionInsertColumn
| ActionDeleteCell
| ActionDeleteRow
| ActionDeleteColumn
| ActionFillRowAt
| ActionFillColumnAt
| ActionClearRowAt
| ActionClearColumnAt
| ActionUndo
| ActionRedo;

export function createClearGridAction(): ActionClearGrid {
  return {
    type: ActionType.ClearGrid
  };
}

export function createSetGridAction(cells: Cells): ActionSetGrid {
  return {
    type: ActionType.SetGrid,
    cells
  };
}

export function createMoveCursorByCellAction(direction: Direction): ActionMoveCursorByCell {
  return {
    type: ActionType.MoveCursorByCell,
    direction
  };
}

export function createMoveCursorToEdgeAction(direction: Direction): ActionMoveCursorToEdge {
  return {
    type: ActionType.MoveCursorToEdge,
    direction
  };
}

export function createMoveCursorToAction(row: number, column: number): ActionMoveCursorTo {
  return {
    type: ActionType.MoveCursorTo,
    row,
    column
  };
}

export function createPutValueAction(value: string): ActionPutValue {
  return {
    type: ActionType.PutValue,
    value
  };
}

export function createInsertCellAction(shiftDirection: ShiftDirection): ActionInsertCell {
  return {
    type: ActionType.InsertCell,
    shiftDirection
  };
}

export function createInsertRowAction(): ActionInsertRow {
  return {
    type: ActionType.InsertRow
  };
}

export function createInsertColumnAction(): ActionInsertColumn {
  return {
    type: ActionType.InsertColumn
  };
}

export function createDeleteCellAction(shiftDirection: ShiftDirection): ActionDeleteCell {
  return {
    type: ActionType.DeleteCell,
    shiftDirection
  };
}

export function createDeleteRowAction(): ActionDeleteRow {
  return {
    type: ActionType.DeleteRow
  };
}

export function createDeleteColumnAction(): ActionDeleteColumn {
  return {
    type: ActionType.DeleteColumn
  };
}

export function createFillRowAtAction(row: number, values: string[]): ActionFillRowAt {
  return {
    type: ActionType.FillRowAt,
    row,
    values
  };
}

export function createFillColumnAtAction(column: number, values: string[]): ActionFillColumnAt {
  return {
    type: ActionType.FillColumnAt,
    column,
    values
  };
}

export function createClearRowAtAction(row: number): ActionClearRowAt {
  return {
    type: ActionType.ClearRowAt,
    row
  };
}

export function createClearColumnAtAction(column: number): ActionClearColumnAt {
  return {
    type: ActionType.ClearColumnAt,
    column
  };
}

export function createUndoAction(): ActionUndo {
  return {
    type: ActionType.Undo
  };
}

export function createRedoAction(): ActionRedo {
  return {
    type: ActionType.Redo
  };
}

/*

  ··········
  ··········
  ····oo····
  ···o··o···
  ··oo··oo··
  ··O····O··
  ·OO····OO·
  ·OOO··OOO·
  ····OO····
  ··········  
{
  undo: [],
  redo: []
}  
---------------------------------

PUT(X @ 4,3)

  ··········
  ··········
  ····oo····
  ···o··o···
  ··oX··oo··
  ··O····O··
  ·OO····OO·
  ·OOO··OOO·
  ····OO····
  ··········  
{
  undo: [PUT(o @ 4,3)],
  redo: []
}  
---------------------------------

INSERTCOL(3)

  ··········
  ··········
  ·····oo···
  ····o··o··
  ··o·X··oo·
  ··O·····O·
  ·OO·····OO
  ·OO·O··OOO
  ·····OO···
  ··········  
{
  undo: [PUT(o @ 4,3), DELETECOL(3)],
  redo: []
}  
---------------------------------


INSERTCOL(3)

  ··········
  ··········
  ······oo··
  ·····o··o·
  ··o··X··oo
  ··O······O
  ·OO······O
  ·OO··O··OO
  ······OO··
  ··········
{
  undo: [PUT(o @ 4,3), DELETECOL(3), DELETECOL(3, lastColumn: ······OO··)],
  undoIndex: 3,
  redo: []
}  
---------------------------------
  
UNDO

  ··········
  ··········
  ·····oo···
  ····o··o··
  ··o·X··oo·
  ··O·····O·
  ·OO·····OO
  ·OO·O··OOO
  ·····OO···
  ··········
{
  undo: [PUT(o @ 4,3), DELETECOL(3), DELETECOL(3, lastColumn: ······OO··)],
  redo: [INSERTCOL(3)]
}  
---------------------------------
  
UNDO

  ··········
  ··········
  ····oo····
  ···o··o···
  ··oX··oo··
  ··O····O··
  ·OO····OO·
  ·OOO··OOO·
  ····OO····
  ··········  
{
  undo: [PUT(o @ 4,3), DELETECOL(3), DELETECOL(3, lastColumn: ······OO··)],
  redo: [INSERTCOL(3), INSERTCOL(3)]
}  
---------------------------------

PUT(A @ 4,3)

  ··········
  ··········
  ····oo····
  ···o··o···
  ··oA··oo··
  ··O····O··
  ·OO····OO·
  ·OOO··OOO·
  ····OO····
  ··········  
{
  undo: [PUT(o @ 4,3), DELETECOL(3), DELETECOL(3, lastColumn: ······OO··), [INSERTCOL(3), INSERTCOL(3)], PUT(X @ 4,3)],
  redo: []
}  
---------------------------------




  ··········
  ··········
  ····oo····
  ···o··o···
  ··oX··oo··
  ··O····O··
  ·OO····OO·
  ·OOO··OOO·
  ····OO····
  ··········  

*/
