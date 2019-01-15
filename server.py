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
# --------------------------------------------------

# ============================= ROUTES ============================
# Route /space/add : create a new space
@app.route("/space/add", methods=['POST'])
def addSpace():
    from database import db_session
    from tables import Space, User
    # Add the new space in the spaces table
    new_space = Space(request.json["name"])
    db_session.add(new_space)
    db_session.commit()
    return jsonify({"space": {"name" : new_space.name, "id": new_space.id}})

# Route /items : get all the list of items of a space
@app.route('/items', methods=['GET', 'POST'])
def items():
    space = request.json["space"]
    from tables import Item
    listItems = Item.query.filter(Item.space == int(space))
    output = []
    for item in listItems:
        output.append({'id':item.id, 'name': item.name, 'parent': item.parent, 'owner': item.userID, 'space': item.space})
    return jsonify({'listItems' : output})

# Route /members : get all the list of members of a space
# Need {"space" : spaceID }
@app.route('/members', methods=['GET', 'POST'])
def members():
    space = request.json["space"]
    from tables import User
    listMembers = User.query.filter(User.space == int(space))
    output = []
    for user in listMembers:
        output.append({'id':user.id, 'name': user.name, 'space': user.space})
    return jsonify({'listMembers' : output})

# Route /item/add : method post, add a new item to the database
# JSON needed : { "name": "abcde", "parent": 45, "owner": 12}
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
@app.route('/member/add', methods=['POST'])
def addMember():
    # add the member to the list
    from tables import User
    user = User.query.filter(User.email == request.json["email"]).first()
    # NEED TO ADD TO A LIST OF SPACE, NOT JUST REPLACE IT... 
    user.space = request.json["space"]
    db_session.commit()
    return jsonify({'newMember': user.id, 'space': user.space}), 201

# Route /item/remove : method post, remove an item from the database
# JSON needed : { "idList" : [id1, id2, id3]}
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
# Return space and name and id of the user, id = -1 if user not found or password incorrect
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
            return jsonify({'space' : user.space, 'id' : user.id, 'name' : user.name})
        else:
            return jsonify({'id': "-1"})
    else:
        return jsonify({'id': "-1"})

# Route /signup : method post, try to login
# JSON needed : { "email" : email, "password": password, "name": name}
# Return id of the user, id = -1 if email already in database
@app.route('/signup', methods=['POST'])
def signup():
    if not request.json:
        abort(400)
    email = request.json["email"]
    # check if account already exist
    from database import db_session
    from tables import User, Space
    for row in User.query.all():
        if row.email == email:
            return jsonify({'id': '-1'})
    # Create new space for the new user
    # Add the new space in the spaces table
    new_space = Space("My Stormy")
    db_session.add(new_space)
    db_session.commit()
    # Add new user and return it
    new_user = User(email=request.json["email"], password=request.json["password"], name=request.json["name"], space=new_space.id)
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    return jsonify({'id': (int)(new_user.id), 'email': new_user.email, 'name' : new_user.name, 'space': new_user.space})
# ============================= ROUTES ============================


# --------------- run server ---------------
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0") # IP address 0.0.0.0 makes the server externally visible