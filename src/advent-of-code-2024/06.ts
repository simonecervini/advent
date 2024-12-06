type Vector2 = { x: number; y: number };

type Board = Map<string, string>;

interface State {
  p: Vector2;
  dp: Vector2;
}

const input = await Bun.file(
  Bun.resolveSync("./inputs/06.txt", import.meta.dir)
).text();

const board: Board = new Map<string, string>();
for (const [y, row] of input.trim().split("\n").entries()) {
  const rowValues = [...row.trim()];
  for (const [x, value] of rowValues.entries()) {
    board.set([x, y].join(","), value);
  }
}

function runSimulation(opts: { board: Board; initialState: State }) {
  const { board: initialBoard, initialState } = structuredClone(opts);

  let board = initialBoard;
  let state = initialState;

  writeBoard({ ...state.p, value: "X" }, board);

  const history = new Set<string>();

  while (true) {
    const cursorNext = sum(state.p, state.dp);
    const nextValue = readBoard(cursorNext, board);
    if (!nextValue) {
      break;
    }
    if (nextValue === "#") {
      // rotate...
      state.dp =
        state.dp.x === 0 && state.dp.y === 1 // V
          ? { x: -1, y: 0 } // <
          : state.dp.x === -1 && state.dp.y === 0 // <
            ? { x: 0, y: -1 } // ^
            : state.dp.x === 0 && state.dp.y === -1 // ^
              ? { x: 1, y: 0 } // >
              : { x: 0, y: 1 }; // V

      // check/update history
      const historyKey = JSON.stringify(state);
      if (history.has(historyKey)) {
        return { board, loop: true };
      } else {
        history.add(historyKey);
      }
    } else if ([".", "X"].includes(nextValue)) {
      // move forward...
      state.p = cursorNext;
      writeBoard({ x: cursorNext.x, y: cursorNext.y, value: "X" }, board);
    }
  }

  return { board, loop: false };
}

function readBoard(point: Vector2, board: Board) {
  return board.get([point.x, point.y].join(","));
}

function writeBoard(item: Vector2 & { value: string }, board: Board) {
  board.set([item.x, item.y].join(","), item.value);
}

function getInitialPosition(board: Board) {
  const entry = Array.from(board.entries()).find(([_, value]) => value === "^");
  if (!entry) throw new Error();
  const [x, y] = entry[0].split(",");
  if (!x || !y) throw new Error();
  return {
    x: parseInt(x),
    y: parseInt(y),
  };
}

function sum(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function eq(a: Vector2, b: Vector2): boolean {
  return a.x === b.x && a.y === b.y;
}

const boardInitialState = {
  p: getInitialPosition(board),
  dp: { x: 0, y: -1 },
};

const { board: board1 } = runSimulation({
  board,
  initialState: boardInitialState,
});

const answerPart1 = Array.from(
  Array.from(board1.values()).filter((value) => value === "X")
).length;
console.log("Answer Part 1:", answerPart1); // Right answer: 5208

let answerPart2 = 0;
for (let x = 0; x < Math.sqrt(board.size); x++) {
  for (let y = 0; y < Math.sqrt(board.size); y++) {
    if (
      readBoard({ x, y }, board1) !== "X" ||
      eq(boardInitialState.p, { x, y })
    ) {
      continue;
    }
    const boardWithObstruction = structuredClone(board);
    writeBoard({ x, y, value: "#" }, boardWithObstruction);
    const simulationResult = runSimulation({
      board: boardWithObstruction,
      initialState: boardInitialState,
    });
    if (simulationResult.loop) {
      answerPart2++;
    }
  }
}
console.log("Answer Part 2:", answerPart2); // Right answer: 1972
