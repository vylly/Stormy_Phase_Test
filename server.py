#!flask/bin/python
from flask import *
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import *
from database import db_session
import json

app = Flask(__name__)

# -------- Create database and tables ----------
from database import init_db
init_db()
# -----------------------------------------------------------------------------

# ---------------------- Functions  -------------------------------------------
# stringToList : take a string with ids separated by ','
# return a list of int containing the ids
def stringToList(stringSpaces):
    print("stringSpaces", stringSpaces)
    listIdsString = stringSpaces.split(',')
    listIds = [int(x) for x in listIdsString[1:-1]]
    print("listIds parsed :", listIds)
    return listIds
# listToString : take a list of int and return a string with ids separated by ','
def listToString(listIds):
    stringSpaces = ","
    for i in listIds:
        stringSpaces = stringSpaces + str(i) + ","
    print("stringSpaces parsed :", stringSpaces)
    return stringSpaces
# fillNames : take the list of spaces id and fill a dictionnary with the names
def fillNames(listIds):
    from tables import Space
    output = []
    spaces = Space.query.filter(Space.id.in_(listIds))
    for space in spaces:
        output.append({"id":space.id, "name": space.name})
    return output
    
# -------------------------------------------------------------------------------

# ============================= ROUTES ============================
@app.route('/', methods=['GET'])
def index():
    return 'welcome on stormy'

# Route /space/add : create a new space
# Need the name of the new space and the id of the user who created it {"name": name, "id": userID}
# Return the new space {"space" : {"id":id, "name":name}}
@app.route("/space/add", methods=['POST'])
def addSpace():
    #from database import db_session
    from tables import Space, User
    # Create new space and add the new space in the spaces table
    new_space = Space(request.json["name"])
    db_session.add(new_space)
    db_session.commit()
    # Add the new space id to the list of spaces of the user
    user = User.query.filter(User.id == request.json["id"]).first()
    user.stringSpaces = user.stringSpaces + str(new_space.id) + ","
    db_session.commit()
    return jsonify({"space": {"name" : new_space.name, "id": new_space.id}})

# Route /items : get all the list of items of a space
# Need {"space" : spaceID }
# Return {"listItems" : [{"id":ID, "name":name, "parent":parentID, "owner":userID, "space": spaceID}]}
@app.route('/items', methods=['POST'])
def items():
    space = request.json["space"]
    from tables import Item
    listItems = Item.query.filter(Item.space == int(space))
    output = []
    for item in listItems:
        output.append({'id':item.id, 'name': item.name, 'parent': item.parent, 'owner': item.userID, 'space': item.space})
    return jsonify({'listItems' : output})

# Route /members : get all the list of members allowed in a space
# Need {"space" : spaceID }
# Return {"listMembers" : [{"id":ID, "name":name, "email": email}]}
@app.route('/members', methods=['POST'])
def members():
    space = request.json["space"]
    from tables import User
    listMembers = User.query.filter(User.stringSpaces.contains("," + str(space) + ","))
    output = []
    for user in listMembers:
        output.append({'id': user.id, 'name': user.name, 'email': user.email})
    return jsonify({'listMembers' : output})

# Route /item/add : method post, add a new item to the database
# JSON needed : { "name": "abcde", "parent": 45, "owner": 12, "space": 1}
# Return {"newItem" : {"id", "name", "parent", "owner"}}
@app.route('/item/add', methods=['POST'])
def addItem():
    space = request.json["space"]
    if not request.json or not 'name' in request.json:
        abort(400)
    # add the item to the database
    from tables import Item
    new_item = Item(userID=request.json['owner'], parent=request.json['parent'], name=request.json['name'], space=request.json['space'])
    db_session.add(new_item)
    db_session.commit()
    # return the new item, with the id just generated
    return jsonify({'newItem': {'id': new_item.id, 'name': new_item.name, 'parent': new_item.parent, 'owner': new_item.userID}}), 201

# Route /member/add : method post, add a new member to a space
# JSON needed : { "email": email, "space": spaceID}
# Return {"newMember" : {"id", "email", "name"}} , nemMember's id -1 if email doesn't exist, -2 if already in the space
@app.route('/member/add', methods=['POST'])
def addMember():
    # add the member to the list
    from tables import User
    user = User.query.filter(User.email == request.json["email"]).first()
    if user == None:
        # wrong email : the user does not exist so it cannot be add to a list of members
        return jsonify({'newMember': {'id': '-1'}})
    else:
        listSpacesAlreadyAllowed = stringToList(user.stringSpaces)
        if request.json["space"] not in listSpacesAlreadyAllowed:
            # We add the space to the list of the user found by its email
            user.stringSpaces = user.stringSpaces + str(request.json["space"]) + ","
            db_session.commit()
            return jsonify({'newMember': {'id': user.id, 'email': user.email, 'name': user.name}}), 201
        else:
            # User already allowed in this space
            return jsonify({'newMember': {'id': -'2'}})

# Route /item/remove : method post, remove an item from the database
# JSON needed : { "idList" : [id1, id2, id3]}
# Return {"ok": "ok"}
@app.route('/item/remove', methods=['POST'])
def removeItem():
    if not request.json:
        abort(400)
    idsToRemove = request.json["idList"] # array (containing the id of the item and the id of its children)
    # delete the items from the list
    from tables import Item
    for ID in idsToRemove:
        item = Item.query.filter(Item.id == ID).first()
        db_session.delete(item)
    db_session.commit()    
    return jsonify({'ok': 'ok'}), 201

'''
# Route /member/remove : method post, remove a member from the database
# JSON needed : { "id" : id}
@app.route('/member/remove', methods=['POST'])
def removeMember():
    if not request.json:
        abort(400)
    idToRemove = request.json["id"]
    # delete the member from the space
    listMembers = [m for m in listMembers if not (m["id"] == idToRemove)]
    # write the new list in the database
    with open('data.json', 'w') as outfile:
        json.dump({"items": listItems, "members": listMembers}, outfile)
    return jsonify({'ok': 'ok'}), 201
'''

# Route /login : method post, try to login
# JSON needed : { "email" : email, "password": password}
# Return {'spaces' : [sp1, sp2, sp3], 'id' : userID, 'name': userName}, id = -1 if user not found or password incorrect
@app.route('/login', methods=['POST'])
def login():
    if not request.json:
        abort(400)
    email = request.json["email"]
    pwd = request.json["password"]
    # find the correct pwd in the database
    from tables import User
    user = User.query.filter(User.email == email).first()
    if user != None:
        # Reply if the pwd is correct or not and send the id
        if pwd == user.password:
            listSpaces = stringToList(user.stringSpaces)
            return jsonify({'spaces' : fillNames(listSpaces), 'id' : user.id, 'name' : user.name})
        else:
            return jsonify({'id': "-1"})
    else:
        return jsonify({'id': "-1"})

# Route /signup : method post, try to login
# JSON needed : { "email" : email, "password": password, "name": name}
# Return {'spaces' : [sp1, sp2, sp3], 'id' : userID, 'name': userName, 'email': email}, id = -1 if mail already used
@app.route('/signup', methods=['POST'])
def signup():
    if not request.json:
        abort(400)
    email = request.json["email"]
    # check if account already exist
    from database import db_session
    from tables import User, Space
    alreadyUser = User.query.filter(User.email == email).first()
    if(alreadyUser != None):
        return jsonify({'id': '-1'})
    # Create new space for the new user and add the new space in the spaces table
    new_space = Space(request.json["name"] + "'s Personal Stormy")
    db_session.add(new_space)
    db_session.commit()
    # Add new user and return it
    spacesList = [new_space.id]
    new_user = User(email=request.json["email"], password=request.json["password"], name=request.json["name"], stringSpaces=listToString(spacesList))
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    listSpaces = stringToList(new_user.stringSpaces)
    return jsonify({'id': (int)(new_user.id), 'email': new_user.email, 'name' : new_user.name, 'spaces': fillNames(listSpaces)})
# ============================= ROUTES ============================


# --------------- run server --------------------------------------
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0") # IP address 0.0.0.0 makes the server externally visible