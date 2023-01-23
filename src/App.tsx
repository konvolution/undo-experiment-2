import React from 'react';
import * as AppModel from './store/appReducer';
import * as Act from './store/actions';
import './App.css';

function App() {
  const [appState, dispatch] = React.useReducer(
    AppModel.appReducer,
    AppModel.initialState,
    i => i
  );

  // Handle key press events at the document level
  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && ['z', 'Z', 'y', 'Y'].indexOf(ev.key) !== -1) {
        if (ev.key === 'z' || ev.key === 'Z') {
          dispatch(Act.createUndoAction());
        } else {
          dispatch(Act.createRedoAction());
        }
        return;
      }

      switch (ev.key) {
        case "ArrowLeft":
          dispatch(Act.createMoveCursorByCellAction(Act.Direction.Left));
          break;

        case "ArrowRight":
          dispatch(Act.createMoveCursorByCellAction(Act.Direction.Right));
          break;

        case "ArrowUp":
          dispatch(Act.createMoveCursorByCellAction(Act.Direction.Up));
          break;

        case "ArrowDown":
          dispatch(Act.createMoveCursorByCellAction(Act.Direction.Down));
          break;

        case "Insert":
          dispatch(ev.altKey ? Act.createInsertColumnAction() : Act.createInsertRowAction());
          break;

        case "Delete":
          dispatch(ev.altKey ? Act.createDeleteColumnAction() : Act.createDeleteRowAction());
          break;

        default:
          if (ev.key.length === 1) {
            dispatch(Act.createPutValueAction(ev.key === ' ' ? '' : ev.key));
          }
          break;
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  return (
    <div className="App">
      <table className="grid">
        <tbody>
          { appState.cells.map(
            (rowCells, row) =>
              <tr key={row}>
                { rowCells.map(
                    (value, column) => {
                      
                      const cellClass = [
                        "cell",
                        appState.cursor.row === row && appState.cursor.column === column && "active",
                        value !== "" && "filled"
                      ].filter(x => x).join(" ");

                      return <td key={column}><div className={cellClass}>{value}</div></td>;
                    })
                }
              </tr>
          )}
        </tbody>
      </table>
      {/* Debug undo/redo stack
      <pre className = "info">
        <p>Undo:</p>
        <ul>
        {appState.undoStack.map((actions, i) => <li key = {i}>{JSON.stringify(actions)}</li>) }
        </ul>
        <br/>
        <p>Redo:</p>
        <ul>
        {appState.redoStack.map((actions, i) => <li key = {i}>{JSON.stringify(actions)}</li>) }
        </ul>
      </pre>
      */}
    </div>
  );
}

export default App;
