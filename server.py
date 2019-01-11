#!flask/bin/python
from flask import *
import json

json_data=open('data.json').read()
data = json.loads(json_data)
listItems = data["items"]
listMembers = data["members"]

app = Flask(__name__)

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

# Route /item/getfromid/<idItem> : return an item using its id
@app.route('/item/getfromid/<idItem>', methods=['GET'])
def getfromidItem(idItem):
    global listItems
    selectedItems = [item for item in listItems if item["id"] == int(idItem)] # returns list of the items with same id (should have length 0 or 1)
    if len(selectedItems) == 0:
        abort(404)
    else:
        return jsonify(selectedItems[0])

# Route /item/gefromname/<nameItem> : return a list of item using the name
@app.route('/item/getfromname/<nameItem>', methods=['GET'])
def getfromnameItem(nameItem):
    global listItems
    selectedItems = [item for item in listItems if item["name"] == nameItem]
    return jsonify(selectedItems)

# Route /member/gefromname/<idMember> : return a member using the id
@app.route('/member/getfromid/<idMember>', methods=['GET'])
def getfromidMember(idMember):
    global listMembers
    selectedMembers = [item for item in listMembers if item["id"] == int(idMember)]
    # Return just the first cell because only one should have the same id
    if len(selectedMembers) == 0:
        abort(404)
    else:
        return jsonify(selectedMembers[0])

# Route /member/gefromname/<nameItem> : return a list of members using the name
@app.route('/member/getfromname/<nameMember>', methods=['GET'])
def getfromnameMember(nameMember):
    global listMembers
    selectedMembers = [item for item in listMembers if item["name"] == nameMember]
    return jsonify(selectedMembers)

# Route /item/add : method post, add a new item to the database
# JSON needed : { "name": "abcde", "parent": 45, "owner": 12}
@app.route('/item/add', methods=['POST'])
def addItem():
    if not request.json or not 'name' in request.json:
        abort(400)
    item = {
        'id': listItems[-1]['id'] + 1,
        'name': request.json['name'],
        'parent': request.json['parent'],
        'owner': request.json['owner']
    }
    # add the item to the list
    listItems.append(item)
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump({"items": listItems, "members": listMembers}, outfile)
    # return the new item, with the id just generated
    return jsonify({'newItem': item}), 201

# Route /member/add : method post, add a new item to the database
# JSON needed : { "name": "abcde"}
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
        json.dump({"items": listItems, "members": listMembers}, outfile)
    # return the new member, with the id just generated
    return jsonify({'newMember': member}), 201

# Route /item/remove : method post, remove an item from the database
# JSON needed : { "idList" : [id1, id2, id3]}
@app.route('/item/remove', methods=['POST'])
def removeItem():
    global listItems
    if not request.json:
        abort(400)
    idsToRemove = request.json["idList"] # array (containing the id of the item and the id of its children)
    # delete the items from the list
    for ID in idsToRemove:
        listItems = [item for item in listItems if not (item["id"] == ID)]
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump({"items": listItems, "members": listMembers}, outfile)
    
    return jsonify({'ok': 'ok'}), 201

# Route /member/remove : method post, remove a member from the database
# JSON needed : { "id" : id}
@app.route('/member/remove', methods=['POST'])
def removeMember():
    global listMembers
    if not request.json:
        abort(400)
    idToRemove = request.json["id"]
    # delete the member from the list
    listMembers = [m for m in listMembers if not (m["id"] == idToRemove)]
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump({"items": listItems, "members": listMembers}, outfile)
    
    return jsonify({'ok': 'ok'}), 201

# Route /login : method post, try to login
# JSON needed : { "email" : email, "password": password}
# Return id of the user, id = -1 if user not found or password incorrect
@app.route('/login', methods=['POST'])
def login():
    if not request.json:
        abort(400)
    email = request.json["email"]
    pwd = request.json["password"]
    # find the correct pwd in the database
    users = json.loads(open('list-users.json').read())["users"]
    # Reply if the pwd is correct or not and send the id
    matching_users = [u for u in users if (u["email"] == email)]
    if len(matching_users) > 0:
        user = matching_users[0]
        if user["password"] == pwd:
            return jsonify({'id': user["id"]})
    
    return jsonify({'id': "-1"})

# Route /signup : method post, try to login
# JSON needed : { "email" : email, "password": password}
# Return id of the user, id = -1 if email already in database
@app.route('/signup', methods=['POST'])
def signup():
    if not request.json:
        abort(400)
    email = request.json["email"]
    pwd = request.json["password"]
    # check if account already exist
    users = json.loads(open('list-users.json').read())["users"]
    matching_users = [user for user in users if (user["email"] == email)]
    if len(matching_users) > 0:
        return jsonify({'id': '-1'})

    # Generate the id
    ids = [int(u['id']) for u in users]
    newId = max(ids) + 1
    # Add the new user and write in the json
    users.append({'email': email, 'password': pwd, 'id': newId})
    with open('list-users.json', 'w') as outfile:
        json.dump({"users": users}, outfile)

    # Reply with the id    
    return jsonify({'id': newId})
# ============================= ROUTES ============================


# --------------- run server ---------------
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0") # IP address 0.0.0.0 makes the server externally visible