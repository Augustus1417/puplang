PupLang — New Beginner Syntax Manual
====================================

Overview
--------
This document describes the beginner-friendly PupLang syntax implemented by the
transpiler in `lrl/runner.py`. The transpiler maps a comfortable, English-like
syntax ("make", "gets", "when", "count", "task", etc.) to the core
language used by the lexer and parser.

Key points
- Source files: .pup
- Statements are separated by newlines (or `;`).
- Comments start with `#` and run to the end of the line.
- Variable names are case-insensitive.

Variables
---------
- Declare a variable:
  make x
  -> creates `x` initialized to `null` (Number.null)

- Assign/update a variable:
  x gets 10
  -> equivalent to `x = 10`

Literals
--------
- Numbers: 123, 3.14
- Strings: "hello", supports \n and \t escapes
- Booleans: True, False (case-insensitive)
- Lists: [1, 2, "three"]

Printing and input
------------------
- Print:
  say "Hello", name
  -> prints the values (transpiled to say(...))

- Input:
  make n
  n asks number "Enter number:"
  -> prompts and stores an integer in `n` (transpiled to get_int("..."))

Conditions
----------
- Basic if/else:
  when x is not 2
    say "x isn't 2"
  end

- Chained conditions:
  when x is 1
    say "one"
  otherwise when x is 2
    say "two"
  otherwise
    say "other"
  end

Loops
-----
- Counting loop:
  count i from 0 to 10
    say i
  end

Functions
---------
- Define a function:
  task add(a, b)
    return a + b
  end

  -> transpiles to the core `fun` function syntax.

Notes on execution
- The transpiler rewrites the beginner syntax into the core language before
  feeding it to the lexer/parser/interpreter. If you see errors, the runner
  will try to show the location in your original source.

Examples
--------
See `examples/calculator_demo.pup` and `examples/calculator_interactive.pup` for
working sample programs.
