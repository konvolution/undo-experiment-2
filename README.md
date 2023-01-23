# Undo experiment 2

This project is an experiment to implement the ideas described here:

https://github.com/zaboople/klonk/blob/master/TheGURQ.md

The application is a simple grid that the user can "edit". Edit operations include:

1. Writing a character to a cell.
2. Insert a row/column.
3. Delete a row/column.
4. Undo the last edit operation (using Ctrl-z).
5. Redo the last undo (using Ctrl-y).

The user can move a cursor using the arrow keys. Cursor moves are not undoable.

The experiment aims to demonstrate a method for implementing undo/redo that is
easy for users to understand and allows them to return to any previous state,
regardless of the undo/redo actions taken. This is different from traditional
undo methods, where it can be difficult to recover a previous state if an action
is taken after undoing.

## Undoing user operations

I tried two different approaches to undoing individual user operations. Hence
there are two undo experiments (in separate GitHub repos). The two approaches
are:

### Undo experiment 1

Take a copy of the current grid state before making any changes. To undo the
operation, revert to the stored copy.
   
While this may seem like it would use a lot of memory, I can use immutable data
and take advantage of "structural sharing" to avoid multiple copies of parts of
the state that do not change.

For the purpose of this experiment, the data representation I use is not
optimized for structural sharing, but it's fine as a proof of concept.

### Undo experiment 2 (this repo)

For each possible operation that changes the grid state, calculate the sequence
of operations needed to restore the original grid state. This should be more
efficient than approach 1 in terms of memory usage. However, it is more
complicated to implement, and it's easy to make a mistake in undo calculation,
so that undo does not restore the state correctly.

I am more familar with approach 2. I'm not sure how well approach 1 would scale
in a "real" application.