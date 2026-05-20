# PupLang (LRL) Software Architecture Documentation

**Version:** 1.0.1  
**Author:** Jed Cruz  
**Date:** May 2026

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [System Overview](#system-overview)
4. [Lexical Analysis (Tokenizer/Lexer)](#lexical-analysis)
5. [Parsing & AST Construction](#parsing--ast-construction)
6. [Interpreter & Runtime Execution](#interpreter--runtime-execution)
7. [Runtime Environment (Electron + React GUI)](#runtime-environment-electron--react-gui)
8. [Language Features](#language-features)
9. [File Extensions & Entry Points](#file-extensions--entry-points)
10. [Undocumented Features & Implementation Details](#undocumented-features--implementation-details)
11. [Communication Protocol](#communication-protocol)

---

## Project Structure

### Directory Organization

The PupLang project is organized into distinct layers:

```
runtime-environment/
├── interpreter/                    # Python-based interpreter (core language)
│   ├── lrl/                        # Core interpreter package
│   │   ├── __init__.py
│   │   ├── cli.py                 # Command-line interface for standalone execution
│   │   ├── errors.py              # Error handling and reporting
│   │   ├── interpreter.py         # AST visitor/interpreter
│   │   ├── lexer.py               # Tokenization (lexical analysis)
│   │   ├── nodes.py               # AST node definitions
│   │   ├── parse_result.py        # Parser result wrapper
│   │   ├── parser.py              # Syntax analysis & AST construction
│   │   ├── position.py            # Position tracking for error reporting
│   │   ├── runtime.py             # Runtime context and symbol table
│   │   ├── runner.py              # Main execution pipeline + syntax transpiler
│   │   ├── tokens.py              # Token type definitions
│   │   └── values.py              # Value types and built-in functions
│   ├── pup_interpreter.py          # Entry point for Electron subprocess
│   ├── docs/                      # Documentation
│   │   └── SYNTAX.md              # Beginner-friendly syntax documentation
│   ├── examples/                  # Sample programs
│   │   ├── calculator_demo.pup
│   │   └── calculator_interactive.pup
│   ├── new_syntax.pup             # Syntax reference
│   └── README.md
│
├── main/                           # Electron main process
│   ├── index.ts                   # IPC handlers, Python subprocess management
│   ├── preload.ts                 # Preload script for secure IPC
│   └── lib/
│       ├── getUrl.ts              # URL resolution
│       └── isDev.ts               # Development mode detection
│
├── src/                           # React renderer process (UI)
│   ├── App.tsx                    # Main React component
│   ├── main.tsx                   # React entry point
│   ├── electron.ts                # Electron API definitions
│   ├── components/
│   │   ├── Header.tsx             # File operations, window controls
│   │   ├── Editor/
│   │   │   ├── Editor.tsx         # Code editor with line numbers
│   │   │   ├── LineNumbers.tsx    # Line number display
│   │   │   └── RunButton.tsx      # Play/stop execution controls
│   │   ├── OutputPanel.tsx        # Output display with character sprite
│   │   ├── ConsolePanel.tsx       # Execution log/status display
│   │   └── CloseButtons.tsx       # Window chrome buttons
│   ├── assets/                    # Character sprites
│   │   ├── idle-laurel.png        # Default/idle state
│   │   ├── input-laurel.png       # Input prompt state
│   │   ├── output-laurel.png      # Output state
│   │   └── error-laurel.png       # Error state
│   ├── index.css                  # Global styles
│   └── vite-env.d.ts              # Vite type definitions
│
├── app/                           # Electron preload & entry
│   ├── index.js                   # Electron main entry
│   └── preload.js                 # Preload script
│
├── public/                        # Static assets
│   └── icon.png
│
├── vite.config.ts                 # Vite build config for renderer
├── esbuild.config.mjs             # ESBuild config for main process
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.cjs             # PostCSS configuration
├── tsconfig.json                  # TypeScript compiler options
├── package.json                   # Node.js dependencies
├── electron-builder.config.js     # Packaging configuration
└── README.md
```

### Key Directory Roles

| Directory | Purpose |
|-----------|---------|
| `interpreter/lrl/` | Core language implementation: lexer, parser, interpreter, runtime |
| `main/` | Electron main process: subprocess management, IPC, file handling |
| `src/` | React UI: editor, output display, console, file dialogs |
| `app/` | Electron bootstrapping and preload bridge |

---

## Technology Stack

### Backend (Interpreter)

| Component | Technology | Version |
|-----------|-----------|---------|
| **Language Runtime** | Python | 3.9+ |
| **Lexer/Parser** | Custom Python | — |
| **AST Interpreter** | Python (visitor pattern) | — |

### Frontend (GUI)

| Component | Technology | Version |
|-----------|-----------|---------|
| **Desktop Framework** | Electron | 33.3.1 |
| **UI Framework** | React | 18.3.1 |
| **Language** | TypeScript | 5.7.2 |
| **Build Tool** | Vite | 6.0.5 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **Package Manager** | Bun | (latest) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code quality & linting |
| **Electron Builder** | Cross-platform packaging |
| **PostCSS** | CSS transformation |
| **TypeScript ESLint** | Type-aware linting |

### Key Dependencies

```json
{
  "core": [
    "react@18.3.1",
    "react-dom@18.3.1",
    "electron@33.3.1",
    "typescript@5.7.2",
    "vite@6.0.5"
  ],
  "ui": [
    "react-icons@5.4.0",
    "tailwindcss@3.4.17"
  ],
  "electron-extensions": [
    "electron-serve@2.1.1",
    "electron-updater@6.3.9",
    "electronmon@2.0.3",
    "electron-log@5.3.0"
  ]
}
```

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PupLang Desktop Application                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Renderer Process (UI)                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  App.tsx                                           │  │   │
│  │  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐  │  │   │
│  │  │  │   Editor    │  │   Output     │  │ Console  │  │  │   │
│  │  │  │  Component  │  │   Panel      │  │  Panel   │  │  │   │
│  │  │  │ (CodeMirror)│  │ (Character   │  │ (Logs)   │  │  │   │
│  │  │  │             │  │  Sprite UI)  │  │          │  │  │   │
│  │  │  └─────────────┘  └──────────────┘  └──────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ↕ (IPC)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Electron Main Process                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  index.ts                                          │  │   │
│  │  │  - IPC Message Handlers                            │  │   │
│  │  │  - Python subprocess spawn/manage                  │  │   │
│  │  │  - File I/O (save/open)                            │  │   │
│  │  │  - Output/Input stream parsing                     │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ↕ (stdio)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          Python Interpreter Subprocess                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  pup_interpreter.py (Entry point)                  │  │   │
│  │  │  ├─ Lexer (lrl.lexer)                              │  │   │
│  │  │  │  └─ Tokenizes source code                       │  │   │
│  │  │  ├─ Parser (lrl.parser)                            │  │   │
│  │  │  │  └─ Builds AST from tokens                      │  │   │
│  │  │  ├─ Interpreter (lrl.interpreter)                  │  │   │
│  │  │  │  └─ Visitor pattern AST execution               │  │   │
│  │  │  └─ Runner (lrl.runner)                            │  │   │
│  │  │     ├─ Transpiles .pup to core syntax              │  │   │
│  │  │     └─ Manages execution pipeline                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ↕ (stdio)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User writes code** → Stored in React state
2. **User clicks "Run"** → Code sent to main process via `pup:run` IPC
3. **Main process spawns Python** → Writes code to subprocess stdin
4. **Python interpreter executes** → Reads code until `__PUP_END_OF_CODE__` marker
5. **Output/Input handling**:
   - Regular output → Printed to stdout
   - `SAY_OUTPUT:` → Triggers pause, waits for "Continue" button
   - `INPUT_REQUEST:` → Triggers modal prompt, waits for user input
6. **Main process parses stdout** → Sends events back to UI
7. **UI updates** → Displays output or prompts user

---

## Lexical Analysis

### Lexer Overview

**File:** `interpreter/lrl/lexer.py`

The lexer performs character-by-character tokenization of source code into a stream of tokens. It handles:
- Number literals (integers and floats)
- String literals with escape sequences (`\n`, `\t`)
- Identifiers and keywords
- Operators and delimiters
- Comments
- Position tracking for error reporting

### Token Types

**File:** `interpreter/lrl/tokens.py`

```python
# Literals
TT_INT              # Integer (e.g., 123)
TT_FLOAT            # Float (e.g., 3.14)
TT_BOOL             # Boolean (True/False)
TT_STRING           # String (e.g., "hello")
TT_IDENTIFIER       # Variable/function name

# Operators
TT_PLUS             # +
TT_MINUS            # -
TT_MUL              # *
TT_DIV              # /
TT_POW              # ^ (exponentiation)
TT_EQ               # = (assignment)
TT_EE               # == (equality)
TT_NE               # != (not equal)
TT_LT               # <
TT_GT               # >
TT_LTE              # <=
TT_GTE              # >=

# Delimiters
TT_LPAREN           # (
TT_RPAREN           # )
TT_LSQUARE          # [
TT_RSQUARE          # ]
TT_COMMA            # ,
TT_DOT              # .
TT_ARROW            # -> (function body)
TT_NEWLINE          # \n or ;

# Keywords
TT_KEYWORD          # Reserved words (if, for, fun, etc.)
```

### Keywords

```python
KEYWORDS = [
    'and', 'or', 'not',
    'if', 'else', 'then', 'end',
    'for', 'to', 'step', 'fun', 'return', 'is',
    'make', 'gets', 'when', 'otherwise', 'count', 'from', 'asks', 'task'
]
```

The last eight keywords are **beginner-friendly** syntax aliases (transpiled to core syntax):
- `make` → variable initialization
- `gets` → variable assignment
- `when` → if statement
- `otherwise` → else/elif
- `count` → for loop
- `from` → loop start
- `asks` → input request
- `task` → function definition

### Lexer Algorithm

1. **Initialization:** Position set to -1, current char set to None
2. **Main Loop:**
   - Skip whitespace and comments
   - Handle each character type:
     - Digits → `make_number()`
     - Quotes → `make_string()`
     - Letters/underscore → `make_identifier()`
     - Operators → Single-char tokens or multi-char lookahead
   - Track position (line, column, index) for error reporting
3. **String Handling:**
   - Supports escape sequences: `\n` (newline), `\t` (tab)
   - Other characters after backslash are preserved literally
4. **Identifier Handling:**
   - Case-insensitive comparison for keywords and booleans
   - Variable names preserve case but are treated case-insensitively at runtime
5. **Position Tracking:**
   - Each token records `pos_start` and `pos_end`
   - Used for precise error messages with code snippets

### Example Tokenization

Input:
```pup
when x is 5 then
  say "x equals", x
end
```

Tokens:
```
KEYWORD:when → IDENTIFIER:x → KEYWORD:is → INT:5 → KEYWORD:then → NEWLINE
IDENTIFIER:say → STRING:"x equals" → COMMA → IDENTIFIER:x → NEWLINE
KEYWORD:end → EOF
```

---

## Parsing & AST Construction

### Parser Overview

**File:** `interpreter/lrl/parser.py`

The parser implements a recursive descent parser that builds an Abstract Syntax Tree (AST) from the token stream. It enforces grammar rules and provides detailed error messages.

### Grammar (Expressed in Parser Methods)

The parser uses method-based precedence climbing:

```
statements      → (NEWLINE)* statement (NEWLINE+ statement)* NEWLINE*
statement       → return expr | expr
expr            → IDENTIFIER EQ expr | comp_expr
comp_expr       → not comp_expr | bin_op(arith_expr, comparisons)
arith_expr      → bin_op(term, [+, -])
term            → bin_op(factor, [*, /])
factor          → [+, -] factor | power
power           → bin_op(call, [^], factor)
call            → atom (LPAREN args? RPAREN)?
atom            → INT | FLOAT | BOOL | STRING | IDENTIFIER | LPAREN expr RPAREN
                | LSQUARE list RSQUARE | if_expr | for_expr | fun_expr
list            → LSQUARE (expr (COMMA expr)*)? RSQUARE
if_expr         → if_expr_cases('if')
for_expr        → FOR IDENTIFIER EQ expr TO expr (STEP expr)? THEN statements END
fun_expr        → FUN IDENTIFIER? LPAREN params? RPAREN (ARROW expr | NEWLINE statements END)
```

### AST Node Types

**File:** `interpreter/lrl/nodes.py`

Each node type is a Python dataclass that represents a language construct:

```python
# Literals
NumberNode(tok)
StringNode(tok)
BoolNode(tok)
ListNode(element_nodes, pos_start, pos_end)

# Variables
VarAccessNode(var_name_tok)
VarAssignNode(var_name_tok, value_node)

# Operations
BinOpNode(left_node, op_tok, right_node)      # e.g., 1 + 2
UnaryOpNode(op_tok, node)                     # e.g., -x, not x

# Control Flow
IfNode(cases, else_case)                      # if/elif/else
ForNode(var_name_tok, start_value_node, end_value_node, step_value_node, body_node, should_return_null)
FuncDefNode(var_name_tok, arg_name_toks, body_node, should_auto_return)

# Function Calls & Special
CallNode(node_to_call, arg_nodes)
ReturnNode(node_to_return, pos_start, pos_end)
StatementsNode(statements, pos_start, pos_end)  # Wrapper for multiple statements
```

### Parser Features

1. **Recursive Descent:** Each grammar rule is a method
2. **Error Recovery:** `try_register()` allows backtracking
3. **Precedence Climbing:** Binary operators respect precedence (power > mul/div > add/sub > comparison)
4. **Lookahead:** `peek()` and `peek(offset)` for multi-token decisions
5. **Helpful Errors:** Detects reserved keyword usage as variable names
6. **Position Tracking:** Preserves token positions for error messages

### Example Parsing

Input tokens:
```
KEYWORD:fun → IDENTIFIER:add → LPAREN → IDENTIFIER:x → COMMA → IDENTIFIER:y 
→ RPAREN → ARROW → IDENTIFIER:x → PLUS → IDENTIFIER:y → EOF
```

Generated AST:
```
FuncDefNode(
  var_name_tok: Token(IDENTIFIER, "add"),
  arg_name_toks: [Token(IDENTIFIER, "x"), Token(IDENTIFIER, "y")],
  body_node: BinOpNode(
    left_node: VarAccessNode(Token(IDENTIFIER, "x")),
    op_tok: Token(PLUS),
    right_node: VarAccessNode(Token(IDENTIFIER, "y"))
  ),
  should_auto_return: True
)
```

---

## Interpreter & Runtime Execution

### Interpreter Overview

**File:** `interpreter/lrl/interpreter.py`

The interpreter implements the visitor pattern, traversing the AST and executing each node type. It maintains a runtime context with symbol tables for variable and function storage.

### Visitor Pattern

Each AST node type has a corresponding `visit_*` method:

```python
class Interpreter:
    def visit(self, node, context):
        method_name = f'visit_{type(node).__name__}'
        method = getattr(self, method_name, self.no_visit_method)
        return method(node, context)
    
    def visit_NumberNode(self, node, context):
        return RTResult().success(Number(node.tok.value).set_context(context).set_pos(...))
    
    def visit_BinOpNode(self, node, context):
        # Evaluate left and right, apply operator
        ...
    
    # ... one method per node type
```

### Value System

**File:** `interpreter/lrl/values.py`

All runtime values inherit from `Value` base class:

```python
class Number(Value):
    # Supports: +, -, *, /, ^ (power), ==, !=, <, >, <=, >=, and, or, not
    # Methods: added_to(), subbed_by(), multed_by(), dived_by(), powed_by(),
    #          get_comparison_*(), anded_by(), ored_by(), notted()

class String(Value):
    # Supports: + (concat), == (equality), != (inequality), * (repeat)
    
class Bool(Value):
    # Supports: == (equality), and, or, not
    # Interoperates with Numbers (0=false, 1=true)

class List(Value):
    # Supports: + (append), - (remove by index), * (extend), / (access by index)

class BaseFunction(Value):
    # Base for user-defined and built-in functions
    
class Function(BaseFunction):
    # User-defined functions: execute(args) interprets body_node in new context

class BuiltInFunction(BaseFunction):
    # Built-in functions: dispatch to execute_* methods
```

### Type Conversions

- **Numbers:** `0` is falsy, anything else is truthy
- **Strings:** Empty string is falsy, non-empty is truthy
- **Booleans:** Normal boolean semantics
- **Lists:** All lists are truthy (even empty)
- **Functions:** All functions are truthy

### Runtime Execution Flow

1. **Lexer** → Token stream
2. **Parser** → AST (StatementsNode root)
3. **Interpreter.visit(ast, context)**
4. For each statement:
   - Evaluate the node
   - If node is VarAssignNode: Set variable in symbol table
   - If node is CallNode: Execute function with arguments
   - If node is IfNode/ForNode: Execute control flow
   - Return value is the result of the last statement

### Symbol Table & Scope

**File:** `interpreter/lrl/runtime.py`

```python
class SymbolTable:
    def __init__(self, parent=None):
        self.symbols = {}      # Local variables
        self.parent = parent   # Parent scope for lookups
    
    def _normalize_name(self, name):
        # Variables are case-insensitive (x == X)
        return name.lower()
    
    def get(self, name):
        # Look in local scope first, then parent scopes
        key = self._normalize_name(name)
        value = self.symbols.get(key, None)
        if value is None and self.parent:
            return self.parent.get(key)
        return value
    
    def set(self, name, value):
        # Always set in local scope (shadowing)
        key = self._normalize_name(name)
        self.symbols[key] = value
```

### Context Management

```python
class Context:
    def __init__(self, display_name, parent=None, parent_entry_pos=None):
        self.display_name = display_name
        self.parent = parent             # For error messages (call chain)
        self.parent_entry_pos = parent_entry_pos
        self.symbol_table = None
```

Each function creates a new context with a new symbol table whose parent is the calling scope.

### Built-in Functions

**File:** `interpreter/lrl/values.py` (BuiltInFunction class)

1. **`say(...args)`**
   - Prints all arguments separated by spaces
   - Emits `SAY_OUTPUT:{output}` to stdout (triggers UI pause)
   - Waits for user to click "Continue" (reads from stdin)
   - Returns `Number.null`
   - **Variadic:** Supports any number of arguments

2. **`get_int(prompt)`**
   - Emits `INPUT_REQUEST:int:{prompt}` to stdout
   - Waits for user input via stdin
   - Parses as integer, re-prompts on invalid input
   - Returns `Number(value)`

3. **`get_float(prompt)`**
   - Emits `INPUT_REQUEST:float:{prompt}` to stdout
   - Parses as float, re-prompts on invalid input
   - Returns `Number(value)`

4. **`get_string(prompt)`**
   - Emits `INPUT_REQUEST:string:{prompt}` to stdout
   - Returns input as-is (no parsing)
   - Returns `String(value)`

### Error Handling

**File:** `interpreter/lrl/errors.py`

Runtime errors are represented as `RTError` objects with:
- Position information (line, column)
- Error name and details
- Code snippet with carets pointing to the error

Example error output:
```
TypeError: Cannot add String and Number

Where: File '<stdin>', line 2, column 5

  2 | x + "hello"
        ^^^^
```

### Special Return Values

- **`Number.null`** – Default/null value (represented as `Number(0)`)
- **`Number.true`** – Boolean true (value=1)
- **`Number.false`** – Boolean false (value=0)
- **`Number.math_PI`** – Constant π

---

## Runtime Environment (Electron + React GUI)

### Electron Main Process

**File:** `main/index.ts`

The main process bridges the UI and the Python interpreter:

#### Key Responsibilities

1. **Window Management**
   - Creates BrowserWindow with 800x600 minimum
   - Handles fullscreen, minimize, maximize, close
   - Manages titlebar visibility on fullscreen toggle

2. **IPC Message Handlers**

   | Handler | Purpose |
   |---------|---------|
   | `pup:run` | Spawn Python subprocess, manage execution |
   | `pup:input` → Event `pup:input` | Forward user input to UI |
   | `pup:say-output` → Event `pup:say-output` | Send output to UI, pause execution |
   | `pup:send-input` | Write user's input to Python stdin |
   | `pup:resume` | Send newline to Python stdin (resume execution) |
   | `pup:stop` | Kill Python subprocess |
   | `file:open` | Open file dialog, read .pup file |
   | `file:save` | Save code to .pup file |
   | `app/minimize` | Minimize window |
   | `app/maximize` | Toggle maximize |
   | `app/close` | Quit application |

3. **Python Subprocess Management**

   ```typescript
   // Spawn Python with stdio piped
   pythonProcess = spawn("python3", [interpreterPath], { stdio: "pipe" });
   
   // Write code to stdin until end marker
   stdin.write(normalizedCode);
   stdin.write("__PUP_END_OF_CODE__\n");
   
   // Parse stdout for special markers:
   // - SAY_OUTPUT:{text}        → Pause execution
   // - INPUT_REQUEST:{type}:{prompt} → Prompt user
   // - Other output → Regular stdout
   ```

4. **Stream Parsing**
   - Line-by-line parsing of stdout
   - Detection of special prefixes: `SAY_OUTPUT:`, `INPUT_REQUEST:`
   - Buffering to handle partial lines (TCP-like delivery)
   - Error collection from stderr

#### Code Structure

```typescript
ipcMain.handle("pup:run", async (_event, code: string) => {
  // 1. Kill any existing Python process
  // 2. Create new process with stdio piped
  // 3. Set up stdout/stderr/error listeners
  // 4. Write code to stdin with end marker
  // 5. Return Promise that resolves when process exits
  // 6. Parse stdout line-by-line:
  //    - INPUT_REQUEST → send pup:input event
  //    - SAY_OUTPUT → send pup:say-output event
  //    - Other → accumulate in output string
  // 7. Collect stderr
  // 8. Return final output or reject with error
});
```

### React UI Components

**Main File:** `src/App.tsx`

#### Component Hierarchy

```
App (Main component)
├── Header
│   ├── File operations (Open, Save, New)
│   ├── Window controls (Minimize, Maximize, Close)
│   └── Current file path display
├── Editor Section (Left, 60% width)
│   └── Editor
│       ├── LineNumbers
│       └── Textarea (syntax-highlighted via CSS classes)
├── RunButton Section (Center, narrow)
│   └── Play/Stop toggle button
└── Output Section (Right, 40% width)
    ├── OutputPanel
    │   ├── Character sprite (context-aware image)
    │   ├── Speech bubble (output display)
    │   ├── Input form (when awaiting input)
    │   ├── Continue button (when awaiting say() continuation)
    └── ConsolePanel
        └── Execution log/status text
```

#### State Management (App.tsx)

```typescript
const [code, setCode] = useState("");                           // Editor content
const [output, setOutput] = useState("");                       // Program output
const [currentSayOutput, setCurrentSayOutput] = useState("");   // say() output
const [consoleLog, setConsoleLog] = useState("");               // Status log
const [isRunning, setIsRunning] = useState(false);              // Execution flag
const [currentFilePath, setCurrentFilePath] = useState(null);   // Loaded file path
const [inputState, setInputState] = useState(null);             // Current input prompt
const [inputValue, setInputValue] = useState("");               // User's input text
const [awaitingSayOutput, setAwaitingSayOutput] = useState(false); // say() paused
```

#### Key Event Handlers

1. **`handleRun()`**
   - Disables run button, enables stop
   - Calls `window.api.runPup(code)` via IPC
   - Awaits completion
   - Updates output or error message

2. **`handleStop()`**
   - Calls `window.api.stopPup()` to kill Python
   - Clears UI state
   - Enables run button

3. **`handleInputSubmit()`**
   - Calls `window.electron.sendPupInput(inputValue)`
   - Clears input state and UI

4. **`handleContinueAfterSay()`**
   - Calls `window.electron.resumePup()`
   - Clears say output display

#### IPC Event Listeners

```typescript
useEffect(() => {
  // Listen for input prompts from main process
  window.electron.onPupInput(({ prompt, type }) => {
    setInputState({ prompt, type });
    setInputValue("");
  });
}, []);

useEffect(() => {
  // Listen for say() output from main process
  window.electron.onSayOutput(({ output }) => {
    setCurrentSayOutput(output);
    setAwaitingSayOutput(true);
  });
}, []);
```

### OutputPanel Component

**File:** `src/components/OutputPanel.tsx`

Displays program output with contextual character sprite:

```
┌─────────────────────────────────────┐
│           Output Panel              │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Speech Bubble              │   │
│  │  "Result: 42"               │   │
│  │  └─ Tail                    │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Character Sprite]        │
│          (idle/input/output/error)  │
│                                     │
└─────────────────────────────────────┘
```

**Character States:**
- `idle-laurel.png` – Default (no input/output)
- `input-laurel.png` – Awaiting user input
- `output-laurel.png` – Displaying output
- `error-laurel.png` – Error message

**Input Form (when `awaitingSayOutput` is false and `inputState` is set):**
- Displays prompt text
- Text input field with auto-focus
- Submit button (disabled if empty input for number/float types)

**Continue Button (when `awaitingSayOutput` is true):**
- Green button below speech bubble
- Allows resumption of program execution

### Editor Component

**File:** `src/components/Editor/Editor.tsx`

Code editor with minimal features (to keep code simple for beginners):

Features:
- **Drag & drop:** Drop a `.pup` file to load it
- **Tab indentation:** Tab key inserts 2 spaces
- **Scroll sync:** LineNumbers scroll with editor
- **Line numbering:** LineNumbers component shows line count

**Minimal by Design:** No syntax highlighting, autocomplete, or fancy features.

### Header Component

**File:** `src/components/Header.tsx` (inferred from App.tsx)

Provides file operations:
- **New:** Clear editor (`setCode("")`)
- **Open:** Show file dialog, read file content
- **Save:** Show save dialog if no path, else save to existing path
- **Current file path:** Display at top

### ConsolePanel Component

**File:** `src/components/ConsolePanel.tsx` (inferred from App.tsx)

Displays execution log:
- "Running..."
- "Execution completed successfully"
- Error messages (with "Error" prefix)
- Input prompts: "Awaiting {type} input"

---

## Language Features

### Data Types

| Type | Examples | Operations |
|------|----------|-----------|
| **Number** | `123`, `3.14`, `0` | `+`, `-`, `*`, `/`, `^`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `not` |
| **String** | `"hello"`, `"x\ny"` | `+` (concat), `*` (repeat), `==`, `!=` |
| **Boolean** | `True`, `False` | `and`, `or`, `not`, comparison to numbers |
| **List** | `[1, 2, 3]`, `["a", 1, True]` | `+` (append), `-` (remove), `*` (extend), `/` (index access) |
| **Function** | Named or anonymous | Call via `name(args)` |

### Operators

#### Arithmetic

| Operator | Precedence | Associativity | Example |
|----------|-----------|---------------|---------|
| `^` | Highest | Right | `2 ^ 3 == 8` |
| `*`, `/` | High | Left | `6 / 2 * 3 == 9` |
| `+`, `-` | Medium | Left | `1 + 2 - 3 == 0` |

#### Comparison

| Operator | Semantics |
|----------|-----------|
| `==` | Equality |
| `!=` | Inequality |
| `<`, `>`, `<=`, `>=` | Numeric comparison |
| `is` | Alias for `==` (beginner-friendly) |

#### Logical

| Operator | Semantics |
|----------|-----------|
| `and` | Logical AND (short-circuit) |
| `or` | Logical OR (short-circuit) |
| `not` | Logical NOT |

#### Special

| Operator | Semantics |
|----------|-----------|
| `=` | Assignment |
| `->` | Lambda/single-expression function body |

### Keywords (Core Syntax)

| Keyword | Usage |
|---------|-------|
| `if`, `else`, `then`, `end` | Conditionals |
| `for`, `to`, `step`, `then`, `end` | Loops |
| `fun` | Function definition |
| `return` | Early return |
| `and`, `or`, `not` | Logical operators |
| `is` | Equality (alias for `==`) |

### Keywords (Beginner Syntax – Auto-Transpiled)

| Keyword | Transpiles To | Example |
|---------|---------------|---------|
| `make var` | `var = null` | `make x` → `x = null` |
| `var gets expr` | `var = expr` | `x gets 5` → `x = 5` |
| `var asks type prompt` | `var = get_*(prompt)` | `x asks number "Enter:"` → `x = get_int("Enter:")` |
| `task name(args)` | `fun name(args)` | `task add(a, b)` → `fun add(a, b)` |
| `when cond` | `if cond then` | `when x > 0` → `if x > 0 then` |
| `otherwise when cond` | `else if cond then` | `otherwise when x < 0` → `else if x < 0 then` |
| `otherwise` | `else` | `otherwise` → `else` |
| `count i from a to b [step c]` | `for i = a to b [step c] then` | `count i from 0 to 10` → `for i = 0 to 10 then` |
| `say args` | `say(args)` | `say "Hi", x` → `say("Hi", x)` |

### Control Structures

#### If/Else/Elif

```pup
when x is 1 then
  say "one"
otherwise when x is 2 then
  say "two"
otherwise
  say "other"
end
```

Core syntax:
```pup
if x == 1 then
  say("one")
else if x == 2 then
  say("two")
else
  say("other")
end
```

#### For Loop

```pup
count i from 0 to 5 step 1
  say i
end
```

Core syntax:
```pup
for i = 0 to 5 step 1 then
  say(i)
end
```

**Notes:**
- Loop variable `i` is set for each iteration
- Range is `[start, end)` (end is exclusive in many languages, but here it appears to iterate while `i < end`)
- Default step is 1 if not specified
- `step` can be negative (iterates down)

#### Function Definition

**Single-expression (arrow syntax):**
```pup
task add(x, y) -> x + y
```

**Multi-statement:**
```pup
task greet(name)
  say "Hello", name
  return "done"
end
```

**Anonymous (lambda):**
```pup
fun (x) -> x * 2
```

**Notes:**
- Functions with `->` auto-return the expression value
- Functions without `->` must use explicit `return`
- Functions without explicit return return `null`

### Built-in Functions

1. **`say(...args)`**
   - Prints arguments separated by spaces
   - Pauses execution (waits for UI "Continue")
   - Returns `null`

2. **`get_int(prompt: String)`**
   - Prompts user for integer input
   - Re-prompts on invalid input
   - Returns integer as Number

3. **`get_float(prompt: String)`**
   - Prompts user for float input
   - Re-prompts on invalid input
   - Returns float as Number

4. **`get_string(prompt: String)`**
   - Prompts user for string input
   - No validation (accepts any input)
   - Returns String

### Constants

| Constant | Type | Value |
|----------|------|-------|
| `null` | Number | 0 |
| `true` | Bool | True |
| `false` | Bool | False |

### Comments

Comments start with `#` and run to end of line:

```pup
# This is a comment
make x  # Inline comment
```

---

## File Extensions & Entry Points

### File Extension

**`.pup`** – PupLang source file (required by interpreter)

The interpreter enforces this in `runner.py`:
```python
def run_file(path: str):
    if not path.endswith('.pup'):
        raise SystemExit('Only .pup files are allowed')
```

### Entry Points

#### 1. GUI Application
- **Main Entry:** `src/main.tsx` (React)
- **Electron Main:** `app/index.js` → `main/index.ts`
- **Startup:** `bun run dev` or packaged executable
- **IPC Protocol:** Renderer ↔ Main ↔ Python subprocess

#### 2. Command-Line Interpreter (Standalone)
- **Entry:** `interpreter/pup_interpreter.py`
- **Usage:** `python3 -m lrl.cli path/to/file.pup`
- **Alternative:** `python3 pup_interpreter.py` (reads from stdin with `__PUP_END_OF_CODE__` marker)

#### 3. Python Module
- **Entry:** `from lrl.runner import run_text` or `run_file`
- **Usage:** Embed in other Python programs

### Build & Distribution

**Development Mode:**
```bash
bun run electron:dev
```

**Production Build:**
```bash
bun run build  # Compiles renderer + main process
bun run dist   # Packages with Electron Builder
```

**Output:**
- Linux: `.pacman` package
- Windows/Mac: Native installers

---

## Undocumented Features & Implementation Details

### 1. Case-Insensitive Variables

**Implementation:** `runtime.py` SymbolTable `_normalize_name()` method

Variables are stored lowercase internally but can be referenced with any case:
```pup
make MyVar
MyVar gets 10
myvar gets 20  # Sets the same variable
say MYVAR      # Prints 20
```

**Design Note:** Beginner-friendly, but can be confusing. Not documented in syntax guide.

### 2. Automatic Type Truthiness

**Implementation:** `values.py` `is_true()` method

Implicit boolean conversion for conditionals:
```pup
when 5 then
  say "truthy"  # Prints (5 is truthy)
end

when "" then
  say "won't print"  # Empty string is falsy
end

when [] then
  say "prints"  # Empty list is truthy!
end
```

**Design Note:** Unusual that empty lists are truthy; not documented.

### 3. List Indexing & Manipulation

**Implementation:** `values.py` List class

- **Access:** `list / index` (division operator reused)
- **Append:** `list + element`
- **Remove:** `list - index`
- **Concatenate:** `list1 * list2`

**Example:**
```pup
make items
items gets [1, 2, 3]
make first
first gets items / 0    # Access: first = 1
make new_items
new_items gets items + 4  # Append: new_items = [1, 2, 3, 4]
```

**Design Note:** Operator overloading for lists is creative but not well-documented.

### 4. Say Output Stream Markers

**Implementation:** `values.py` BuiltInFunction.execute_say()

Output includes special markers for UI communication:
- `SAY_OUTPUT:{text}` – Printed to stdout, triggers pause
- `INPUT_REQUEST:{type}:{prompt}` – Printed to stdout, prompts user

These are parsed by the Electron main process and never shown to the user.

**Design Note:** Clever use of stdout for IPC, but brittle (if user's say() output starts with these prefixes, parsing breaks).

### 5. Code End Marker

**Implementation:** `pup_interpreter.py`, `main/index.ts`

The subprocess reads code from stdin until `__PUP_END_OF_CODE__` marker:
```python
CODE_END_MARKER = "__PUP_END_OF_CODE__"

def read_code_from_stdin():
    lines = []
    for line in sys.stdin:
        if line.rstrip("\n") == CODE_END_MARKER:
            break
        lines.append(line)
    return "".join(lines)
```

This allows the main process to send code and know when code ends (without message framing).

**Design Note:** Hacky but functional. Could fail if user's code contains this exact string on its own line.

### 6. Transpilation Step (New Syntax → Core Syntax)

**Implementation:** `runner.py` `transpile_new_syntax()` function

The beginner-friendly syntax (`make`, `gets`, `when`, etc.) is transpiled to core syntax before parsing:

```python
def _translate_line(line: str) -> str:
    # Regex-based line-by-line transpilation
    # make x → x = null
    # x gets 5 → x = 5
    # when cond → if cond then
    # etc.
```

**Design Note:** Error positions in transpiled code are re-targeted to original source for error messages. Clever but complex.

### 7. Symbol Table Parent Chaining

**Implementation:** `runtime.py` SymbolTable

Symbol tables form a parent chain for scope resolution:
```python
def get(self, name):
    value = self.symbols.get(key, None)
    if value is None and self.parent:
        return self.parent.get(key)  # Recursive lookup
    return value
```

This allows functions to access variables from enclosing scopes.

**Design Note:** Creates implicit closure capture; may surprise users.

### 8. Binary Operator Dispatch

**Implementation:** `interpreter.py` `visit_BinOpNode()`

Binary operations dispatch via type methods on the left operand:
```python
if node.op_tok.type == TT_PLUS:
    result, error = left.added_to(right)
elif node.op_tok.type == TT_MINUS:
    result, error = left.subbed_by(right)
# ... etc
```

This allows left operand to define how it combines with other types (e.g., String + String vs String + Number fails).

**Design Note:** Asymmetric operator semantics; not all combinations work.

### 9. `is` Keyword as Equality Alias

**Implementation:** `interpreter.py` and `parser.py`

The `is` keyword is treated identically to `==`:
```python
elif node.op_tok.matches(TT_KEYWORD, 'is'):
    result, error = left.get_comparison_eq(right)
```

**Example:**
```pup
when x is 5
  say "Equal"
end
```

**Design Note:** Intended for readability ("x is 5" reads naturally); but semantically identical to "x == 5". Can be confusing.

### 10. Return Value of Loops

**Implementation:** `interpreter.py` `visit_ForNode()`

For loops return a List of all iteration values:
```python
def visit_ForNode(self, node, context):
    # ...
    while condition():
        # ... execute body ...
        elements.append(value)
    return res.success(
        Number.null if node.should_return_null else List(elements)
    )
```

**Example:**
```pup
count i from 0 to 3
  say i
end
# Returns [null, null, null] if body doesn't return values
```

**Design Note:** Undocumented; rarely used feature.

### 11. Function Auto-Return

**Implementation:** `interpreter.py` `visit_FuncDefNode()`, `nodes.py` FuncDefNode

Functions defined with `->` auto-return the expression value:
```pup
task double(x) -> x * 2
```

Functions defined with `end` only return explicitly with `return`:
```pup
task double(x)
  return x * 2
end
```

**Design Note:** Dual syntax for convenience; not well-documented.

### 12. No Continue/Break Statements

**Implementation:** Absent from tokens.py and parser.py

The language has no `continue` or `break` statements for loops.

**Design Note:** Simplifies for beginners; limits loop expressiveness.

### 13. Division by Zero Error

**Implementation:** `values.py` Number.dived_by()

Attempting to divide by zero triggers a runtime error:
```python
def dived_by(self, other):
    if isinstance(other, Number):
        if other.value == 0:
            return None, RTError(other.pos_start, other.pos_end, 
                                 'Division by zero', self.context)
```

**Design Note:** Good error handling; matches typical language behavior.

### 14. String Escape Sequences

**Implementation:** `lexer.py` `make_string()`

Only `\n` and `\t` are recognized:
```python
mapping = {'n': '\n', 't': '\t'}
if escape:
    s += mapping.get(self.current_char, self.current_char)
```

Any other backslash sequence preserves the character literally.

**Example:**
```pup
say "Hello\nWorld"  # Prints: Hello
                    #         World
say "Tab\there"     # Prints: Tab	here
say "Quote\"here"   # Prints: Quote"here (\" not recognized, outputs as-is)
```

**Design Note:** Limited but adequate for beginners.

### 15. Operator Precedence Not Documented

The language has clear precedence (power > mul/div > add/sub > comparison), but it's not documented anywhere. Users must infer it from examples.

**Example:**
```pup
say 2 + 3 * 4    # Prints: 14 (not 20), because * > +
```

---

## Communication Protocol

### Electron ↔ Python Communication

The main process communicates with the Python subprocess via stdio (stdin/stdout/stderr) and uses a custom protocol.

#### Request → Code Execution

**Renderer → Main (IPC):**
```javascript
window.api.runPup(code)  // IPC call "pup:run"
```

**Main → Python (stdin):**
```
<code line 1>
<code line 2>
...
__PUP_END_OF_CODE__
<newline>
```

#### Response → Output Stream Parsing

**Python → Main (stdout):**

Multiple possible output formats:

1. **Regular Output (Normal `say()` call with continuation):**
   ```
   SAY_OUTPUT:Hello, World!
   <waits for stdin>
   ```
   Main process:
   - Extracts text after `SAY_OUTPUT:` → `"Hello, World!"`
   - Sends IPC event `pup:say-output` to renderer with `{ output: "Hello, World!" }`
   - Renderer displays button "Continue"
   - User clicks "Continue" → Renderer sends `pup:resume` IPC to main
   - Main writes `\n` to subprocess stdin
   - Python resumes

2. **Input Request:**
   ```
   INPUT_REQUEST:int:Enter a number:
   <waits for stdin>
   ```
   Main process:
   - Parses `int:Enter a number:` → type=`int`, prompt=`Enter a number:`
   - Sends IPC event `pup:input` to renderer
   - Renderer displays input modal with prompt
   - User enters value, clicks submit → Renderer sends `pup:send-input` IPC
   - Main writes `<value>\n` to subprocess stdin
   - Python reads and validates

3. **Normal Program Output (no markers):**
   ```
   42
   hello
   ```
   Main process:
   - Accumulates in output string
   - On process exit, returns to renderer

4. **Errors (stderr):**
   ```
   TypeError: Cannot add String and Number

   Where: File '<stdin>', line 2, column 5

     2 | x + "hello"
           ^^^^
   ```
   Main process:
   - Collects on stderr
   - On process exit, rejects Promise with error message
   - Renderer displays in console

#### IPC Handlers Summary

```typescript
// Request Handlers (Renderer → Main)
ipcMain.handle("pup:run", async (_event, code) => { ... })
ipcMain.handle("file:open", async () => { ... })
ipcMain.handle("file:save", async (_event, { content, defaultPath }) => { ... })

// Event Handlers (Renderer → Main, Fire-and-Forget)
ipcMain.on("pup:send-input", (_event, value) => { ... })
ipcMain.on("pup:resume", () => { ... })
ipcMain.on("pup:stop", () => { ... })
ipcMain.on("app/minimize", () => { ... })
ipcMain.on("app/maximize", () => { ... })
ipcMain.on("app/close", () => { ... })

// Event Emissions (Main → Renderer, Broadcast)
win.webContents.send("pup:input", { type, prompt })
win.webContents.send("pup:say-output", { output })
win.webContents.send("pup:stopped")
win.webContents.send("toggle-titlebar", boolean)
```

#### Event Listeners in Renderer

```typescript
// Main process emits events; renderer subscribes via electron API
window.electron.onPupInput(({ prompt, type }) => { ... })
window.electron.onSayOutput(({ output }) => { ... })

// Renderer sends async requests
const result = await window.api.runPup(code)
const { canceled, filePath, content } = await window.api.openFile()
const { canceled, filePath } = await window.api.saveFile(content, defaultPath)

// Renderer sends sync events
window.electron.sendPupInput(value)
window.electron.resumePup()
window.api.stopPup()
```

#### Preload Bridge

**File:** `main/preload.ts` (inferred structure)

The preload script exposes safe APIs to the renderer:

```typescript
// Exposes window.api and window.electron globally
contextBridge.exposeInMainWorld("api", {
  runPup: (code) => ipcRenderer.invoke("pup:run", code),
  stopPup: () => ipcRenderer.send("pup:stop"),
  openFile: () => ipcRenderer.invoke("file:open"),
  saveFile: (content, defaultPath) => ipcRenderer.invoke("file:save", { content, defaultPath }),
  // ...
})

contextBridge.exposeInMainWorld("electron", {
  onPupInput: (callback) => {
    ipcRenderer.on("pup:input", (event, data) => callback(data))
    return () => ipcRenderer.removeAllListeners("pup:input")
  },
  onSayOutput: (callback) => {
    ipcRenderer.on("pup:say-output", (event, data) => callback(data))
    return () => ipcRenderer.removeAllListeners("pup:say-output")
  },
  sendPupInput: (value) => ipcRenderer.send("pup:send-input", value),
  resumePup: () => ipcRenderer.send("pup:resume"),
  // ...
})
```

---

## Summary

### Strengths

1. **Clean Separation of Concerns**
   - Python interpreter is independent and testable
   - React UI is decoupled from interpreter
   - Electron main process mediates cleanly

2. **Beginner-Friendly Design**
   - Dual syntax (beginner vs. core) via transpilation
   - Clear error messages with code snippets
   - Visual feedback with character sprites

3. **Interactive Capabilities**
   - `say()` pauses execution with Continue button
   - Input prompts with validation
   - Modal-based UI for user interaction

4. **Cross-Platform**
   - Electron enables Windows/Mac/Linux builds
   - Python interpreter portable
   - Packaged with Electron Builder

### Limitations

1. **No Advanced Features**
   - No break/continue in loops
   - No while loops (only for loops)
   - No list comprehensions or higher-order functions
   - No classes or objects

2. **Type System**
   - Dynamically typed; no type checking
   - Implicit type conversions can be surprising
   - Limited operator overloading semantics

3. **Error Handling**
   - No try/catch mechanism
   - Runtime errors halt execution
   - Limited error recovery

4. **Performance**
   - Python subprocess spawned per execution (startup overhead)
   - No optimization or JIT compilation
   - Adequate for educational use

### Future Enhancement Opportunities

1. **Language Features**
   - Add `while` loops
   - Add `break` / `continue`
   - Add try/catch/finally
   - Add classes and objects

2. **IDE Improvements**
   - Syntax highlighting
   - Autocomplete
   - Debugger
   - Project management

3. **Standard Library**
   - Math functions (sin, cos, sqrt, etc.)
   - String manipulation (split, join, etc.)
   - File I/O
   - List utilities (map, filter, reduce)

4. **Testing & CI/CD**
   - Unit tests for interpreter
   - Integration tests for UI
   - Automated builds and releases

---

## Document Metadata

- **Version:** 1.0.1 (matching package.json)
- **Project Name:** PupLang (aka Laurel, LRL)
- **Author(s):** Jed Cruz
- **Date:** May 2026
- **Scope:** Complete architectural analysis and implementation details
- **Audience:** Developers maintaining or extending PupLang, documentation writers, educators

---

**End of Architecture Documentation**
