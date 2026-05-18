# PupLang - IDE & Runtime

A modern, beginner-friendly programming language with a sleek Electron-based IDE. PupLang combines intuitive syntax with powerful features to make learning programming enjoyable and accessible.

![PupLang IDE](./runtime-environment/app/renderer/assets/preview.png)

## 🌟 Features

- **Intuitive Syntax** - English-like commands that are easy to learn and read
- **Interactive IDE** - Built-in editor with live execution and real-time output
- **Variable Management** - Simple variable declaration and assignment
- **Control Flow** - Conditional statements and loops
- **Functions** - Define and call reusable functions
- **User Input** - Interactive input for numbers and strings
- **Console Output** - Real-time output display and logging

## 📖 Language Features

### Variables
```pup
make num1
make name
```

### Assignment
```pup
num1 gets 5
name gets "Alice"
```

### Output (Print)
```pup
say "Hello World"
say num1 + num2
```

### Conditionals
```pup
when num1 is 5
  say "Number is 5"
end

when num1 > 3
  say "Greater than 3"
otherwise when num1 is 3
  say "Equal to 3"
end
```

### Loops
```pup
count i from 0 to 10
  say i
end
```

### User Input
```pup
make number
number asks number "Enter a value:"

make text
text asks string "Enter your name:"
```

### Functions
```pup
task greet(name)
  say "Hello, " , name
  return "Greeting sent"
end

greet("World")
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Bun (for dependency management and scripts)

### Installation

1. Navigate to the runtime environment:
```bash
cd runtime-environment
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

The IDE will open in a new Electron window.

### Building for Production

```bash
bun run build
```

This creates an executable for distribution.

## 📁 Project Structure

```
puplang/
├── readme.md                    # Main project documentation
└── runtime-environment/         # IDE & Runtime environment
    ├── package.json            # Project dependencies
    ├── vite.config.ts          # Vite configuration
    ├── tsconfig.json           # TypeScript configuration
    ├── tailwind.config.js       # Tailwind CSS configuration
    ├── electron-builder.config.js
    ├── app/                    # Electron main process
    │   ├── index.js
    │   ├── preload.js
    │   └── renderer/           # UI assets
    ├── main/                   # Main process source (TypeScript)
    │   ├── index.ts
    │   ├── preload.ts
    │   └── lib/
    ├── src/                    # React frontend source
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/         # React components
    │   │   ├── Header.tsx      # Top menu bar
    │   │   ├── Editor/         # Code editor
    │   │   ├── ConsolePanel.tsx # Output console
    │   │   └── ...
    │   ├── hooks/              # Custom React hooks
    │   ├── lib/                # Utilities
    │   └── model/              # Data models
    └── interpreter/            # PupLang interpreter
        ├── pup_interpreter.py  # Main interpreter
        ├── lrl/                # PupLang language runtime library
        │   ├── lexer.py        # Tokenizer
        │   ├── parser.py       # Parser
        │   ├── interpreter.py  # Execution engine
        │   ├── runtime.py      # Runtime environment
        │   ├── tokens.py       # Token definitions
        │   ├── values.py       # Value types
        │   └── ...
        └── examples/           # Example programs
```

## 🛠️ Development

### Running the IDE

```bash
cd runtime-environment
bun run dev
```

### Running Tests

```bash
bun test
```

### Linting

```bash
bun run lint
```

## 🧠 IDE Usage

### Main Components

- **Editor** - Left panel for writing PupLang code
- **Run Button** - Execute your code
- **Output Panel** - Right panel showing program output
- **Console Panel** - Bottom panel with execution logs
- **Help Button** - Access language manual and syntax examples

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save File | `Ctrl+S` (or `Cmd+S` on Mac) |
| Save As | `Ctrl+Shift+S` |
| Open File | `Ctrl+O` |
| Run Code | `Ctrl+Enter` |

### File Format

PupLang programs use the `.pup` file extension.

## 📚 Examples

See the `runtime-environment/interpreter/examples/` directory for example programs:

- `calculator_demo.pup` - Basic arithmetic demonstration
- `calculator_interactive.pup` - Interactive calculator with user input

## 🔧 Technical Details

### Frontend Stack
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Styling
- **Vite** - Build tool and development server

### Backend Stack
- **Electron** - Desktop application framework
- **Python** - Interpreter runtime
- **IPC** - Inter-process communication between Electron and Python

### Architecture

1. **Electron Main Process** - Manages application lifecycle and file I/O
2. **React UI** - Provides the IDE interface
3. **Python Interpreter** - Executes PupLang language code
4. **IPC Bridge** - Communication between processes

## 📋 Interpreter Components

### Lexer (`lrl/lexer.py`)
Tokenizes PupLang source code into tokens

### Parser (`lrl/parser.py`)
Parses tokens into an Abstract Syntax Tree (AST)

### Interpreter (`lrl/interpreter.py`)
Executes the AST and manages the runtime

### Runtime (`lrl/runtime.py`)
Provides built-in functions and runtime environment

### Error Handling (`lrl/errors.py`)
Comprehensive error messages and debugging information

## 🐛 Troubleshooting

### IDE Won't Start
- Ensure Node.js and Bun are installed
- Run `bun install` to install dependencies
- Check logs in the terminal

### Code Won't Execute
- Check syntax using the Help manual
- Look at console messages for error details
- Ensure all variables are declared with `make` before use

### Python Interpreter Issues
- Verify Python 3.8+ is installed
- Check that the interpreter path is correct in `app/index.js`

## 📝 License

[Add your license here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

**Happy coding! 🎉**

Visit the Help button in the IDE for detailed language syntax and examples.
