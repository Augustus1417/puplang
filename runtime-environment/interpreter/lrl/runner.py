import os
import re
from .lexer import Lexer
from .parser import Parser
from .interpreter import Interpreter
from .runtime import Context, SymbolTable
from .values import Number, Bool, String, BuiltInFunction

# Global symbols and built-ins for the PupLang language
global_symbol_table = SymbolTable()
# booleans and constants
global_symbol_table.set("null", Number.null)
global_symbol_table.set("false", Bool.false)
global_symbol_table.set("true", Bool.true)
# builtins for PupLang API
global_symbol_table.set("say", BuiltInFunction.say)
global_symbol_table.set("get_int", BuiltInFunction.get_int)
global_symbol_table.set("get_float", BuiltInFunction.get_float)
global_symbol_table.set("get_string", BuiltInFunction.get_string)


def _translate_line(line: str) -> str:
    """Translate beginner-friendly PupLang syntax into core syntax.

    This keeps the existing lexer/parser/runtime intact while enabling the
    syntax shown in `new_syntax.pup`.
    """
    if not line:
        return line

    match = re.match(r'^(\s*)(.*)$', line)
    indent = match.group(1)
    content = match.group(2)
    stripped = content.strip()

    if stripped == "" or stripped.startswith('#'):
        return line

    # make name  -> name = null
    m = re.match(r'^make\s+([A-Za-z_][A-Za-z0-9_]*)\s*$', stripped)
    if m:
        return f"{indent}{m.group(1)} = null"

    # name gets expr -> name = expr
    m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)\s+gets\s+(.+)$', stripped)
    if m:
        var_name, expr = m.group(1), m.group(2)
        return f"{indent}{var_name} = {expr}"

    # name asks number "Prompt:"  -> name = get_int("Prompt:")
    m = re.match(r'^([A-Za-z_][A-Za-z0-9_]*)\s+asks\s+(number|int|float|string|text)\s+(.+)$', stripped, flags=re.IGNORECASE)
    if m:
        var_name = m.group(1)
        kind = m.group(2).lower()
        prompt_expr = m.group(3)
        fn_map = {
            'number': 'get_int',
            'int': 'get_int',
            'float': 'get_float',
            'string': 'get_string',
            'text': 'get_string',
        }
        read_fn = fn_map.get(kind, 'get_string')
        return f"{indent}{var_name} = {read_fn}({prompt_expr})"

    # task name(args) -> fun name(args)
    m = re.match(r'^task\s+(.+)$', stripped)
    if m:
        return f"{indent}fun {m.group(1)}"

    # when cond -> if cond then
    m = re.match(r'^when\s+(.+)$', stripped)
    if m:
        condition = m.group(1).rstrip(':').strip()
        condition = re.sub(r'\bis\s+not\b', '!=', condition, flags=re.IGNORECASE)
        return f"{indent}if {condition} then"

    # otherwise when cond -> else if cond then
    m = re.match(r'^otherwise\s+when\s+(.+)$', stripped, flags=re.IGNORECASE)
    if m:
        condition = m.group(1).rstrip(':').strip()
        condition = re.sub(r'\bis\s+not\b', '!=', condition, flags=re.IGNORECASE)
        return f"{indent}else if {condition} then"

    # otherwise -> else
    if re.match(r'^otherwise\s*:?\s*$', stripped, flags=re.IGNORECASE):
        return f"{indent}else"

    # count i from 0 to 10 [step n] -> for i = 0 to 10 [step n] then
    m = re.match(
        r'^count\s+([A-Za-z_][A-Za-z0-9_]*)\s+from\s+(.+?)\s+to\s+(.+?)(?:\s+step\s+(.+))?\s*$',
        stripped,
        flags=re.IGNORECASE,
    )
    if m:
        var_name = m.group(1)
        start_expr = m.group(2)
        end_expr = m.group(3)
        step_expr = m.group(4)
        if step_expr is not None:
            return f"{indent}for {var_name} = {start_expr} to {end_expr} step {step_expr} then"
        return f"{indent}for {var_name} = {start_expr} to {end_expr} then"

    # say x, y -> say(x, y)
    m = re.match(r'^say\s+(.+)$', stripped)
    if m:
        args_expr = m.group(1)
        return f"{indent}say({args_expr})"

    return line


def transpile_new_syntax(text: str) -> str:
    lines = text.splitlines()
    out_lines = [_translate_line(line) for line in lines]
    transpiled = "\n".join(out_lines)
    if text.endswith("\n"):
        transpiled += "\n"
    return transpiled


def _retarget_error_source(error, original_text: str):
    """Point error rendering back to the user's original source text.

    The parser/interpreter currently run on transpiled text, so positions carry
    that transpiled `ftxt`. For beginner-friendly diagnostics we want the
    snippet to show what the user actually wrote.
    """
    if not error:
        return

    if getattr(error, 'pos_start', None) is not None:
        error.pos_start.ftxt = original_text
    if getattr(error, 'pos_end', None) is not None:
        error.pos_end.ftxt = original_text

# --- Runner functions ---

def run_text(fn: str, text: str):
    transpiled_source = transpile_new_syntax(text)
    lexer = Lexer(fn, transpiled_source)
    tokens, error = lexer.make_tokens()
    if error:
        _retarget_error_source(error, text)
        return None, error

    parser = Parser(tokens)
    ast = parser.parse()
    if ast.error:
        _retarget_error_source(ast.error, text)
        return None, ast.error

    interpreter = Interpreter()
    context = Context('<program>')
    context.symbol_table = global_symbol_table

    result = interpreter.visit(ast.node, context)
    if result.error:
        _retarget_error_source(result.error, text)
    return result.value, result.error

def run_file(path: str):
    if not path.endswith('.pup'):
        raise SystemExit('Only .pup files are allowed')
    if not os.path.exists(path):
        raise SystemExit(f'File not found: {path}')
    with open(path, 'r') as f:
        code = f.read()
    return run_text(path, code)
