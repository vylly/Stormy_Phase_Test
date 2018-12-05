#!flask/bin/python
from flask import *
import json

app = Flask(__name__)

listItems = []

@app.route('/', methods=['GET'])
def all():
    global listItems
    json_data=open('data.json').read()
    listItems = json.loads(json_data)
    return jsonify(listItems)

@app.route('/add', methods=['POST'])
def add():
    if not request.json or not 'name' in request.json:
        abort(400)
    item = {
        'id': listItems[-1]['id'] + 1,
        'name': request.json['name'],
        'parent': request.json['parent']
    }
    listItems.append(item)
    with open('data.json', 'w') as outfile:
        json.dump(listItems, outfile)
    return jsonify({'newItem': item}), 201

if __name__ == '__main__':
    app.run(debug=True, port=80)