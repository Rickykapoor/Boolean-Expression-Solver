from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp

app = Flask(__name__)
CORS(app)

def parse_expression(expression):
    """Convert custom Boolean notation into SymPy's format."""
    expression = expression.replace('.', '&')
    expression = expression.replace('+', '|')
    expression = expression.replace('!', '~')
    return expression

def parse_simplified(simplified_expression):
    """Convert simplified SymPy expression back into the custom Boolean notation."""
    simplified_expression = str(simplified_expression)
    simplified_expression = simplified_expression.replace('&', '.')
    simplified_expression = simplified_expression.replace('|', '+')
    simplified_expression = simplified_expression.replace('~', '!')
    return simplified_expression

def validate_expression(expression):
    """Validate the input expression."""
    valid_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01.+!()')
    return all(char in valid_chars for char in expression)

@app.route('/simplify', methods=['POST'])
def simplify_expression():
    try:
        data = request.json
        expr_str = data.get('expression')
        
        if not expr_str:
            return jsonify({'error': 'No expression provided!'}), 400
        
        if not validate_expression(expr_str):
            return jsonify({'error': 'Invalid characters in expression!'}), 400
        
        parsed_expr_str = parse_expression(expr_str)
        expr = sp.sympify(parsed_expr_str, evaluate=False)
        simplified_expr = sp.simplify_logic(expr)
        simplified_expr_str = parse_simplified(simplified_expr)
        
        return jsonify({'simplified_expression': simplified_expr_str})
    
    except sp.SympifyError as e:
        return jsonify({'error': 'Invalid Boolean expression!'}), 400
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)