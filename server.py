#!flask/bin/python
from flask import *
import json

app = Flask(__name__)

json_data=open('data.json').read()
data = json.loads(json_data)
listItems = data["items"]
listMembers = data["members"]

# ============================= ROUTES ============================
# Route / : get all the data (contains items and members)
@app.route("/", methods=['GET'])
def index():
    return jsonify({"items": listItems, "members": listMembers})

# Route /items : get all the list of items
@app.route('/items', methods=['GET'])
def items():
    return jsonify(listItems)

# Route /members : get all the list of members
@app.route('/members', methods=['GET'])
def members():
    return jsonify(listMembers)

# Route /getfromid/<idItem> : return an item using its id
@app.route('/getfromid/<idItem>', methods=['GET'])
def getfromid(idItem):
    global listItems
    selectedItems = [item for item in listItems if item["id"] == int(idItem)] # returns list of the items with same id (should have length 0 or 1)
    if len(selectedItems) == 0:
        abort(404)
    else:
        return jsonify(selectedItems[0])

# Route /gefromname/<nameItem> : return a list of item using the name
@app.route('/getfromname/<nameItem>', methods=['GET'])
def getfromname(nameItem):
    global listItems
    selectedItems = [item for item in listItems if item["name"] == nameItem] # returns list of the items with same id so we take the first cell
    return jsonify(selectedItems)

# Route /item/add : method post, add a new item to the database
@app.route('/item/add', methods=['POST'])
def addItem():
    if not request.json or not 'name' in request.json:
        abort(400)
    item = {
        'id': listItems[-1]['id'] + 1,
        'name': request.json['name'],
        'parent': request.json['parent']
    }
    # add the item to the list
    listItems.append(item)
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump({"items": listItems, "members": listMembers}, outfile)
    # return the new item, with the id just generated
    return jsonify({'newItem': item}), 201

# Route /member/add : method post, add a new item to the database
@app.route('/member/add', methods=['POST'])
def addMember   ():
    if not request.json or not 'name' in request.json:
        abort(400)
    member = {
        'id': listMembers[-1]['id'] + 1,
        'name': request.json['name']
    }
    # add the member to the list
    listMembers.append(member)
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump(listItems, outfile)
    # return the new member, with the id just generated
    return jsonify({'newMember': member}), 201
# ============================= ROUTES ============================


# --------------- run server ---------------
if __name__ == '__main__':
    app.run(debug=True, port=80, host="0.0.0.0") # IP address 0.0.0.0 makes the server externally visible