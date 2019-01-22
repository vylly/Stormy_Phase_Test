#!flask/bin/python
from flask import *
from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import *
from database import db_session
import json
from flask_bcrypt import Bcrypt
import jwt
import datetime
app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SECRET_KEY'] = "Q1dZ0bG3z7Xt8j5T9Iq3S7qA10q3v7f"
    

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

# Generate a token based on the time and the user ID and the secret key
def encode_auth_token(user_id):
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, seconds=3600),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )
    except Exception as e:
        return e
# Decode a token and return the user id if status is success
def decode_auth_token(auth_token):
    try:
        payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'))
        return {'status': 'success', 'id': payload['sub']}
    except jwt.ExpiredSignatureError:
        return {'status': 'fail', 'message' : 'Signature expired. Please log in again.'}
    except jwt.InvalidTokenError:
        return {'status': 'fail', 'message': 'Invalid token. Please log in again.'}
    
# -------------------------------------------------------------------------------

# ============================= ROUTES ============================
@app.route('/', methods=['GET'])
def index():
    return 'welcome on stormy'

@app.route('/policy', methods=['GET'])
def policy():
    return render_template("policy.html")

# Route /space/add : create a new space
# Need the name of the new space and the id of the user who created it {"name": name, "id": userID}
# Return the new space {"status": "success", space" : {"id":id, "name":name}, "token": token}
@app.route("/space/add", methods=['POST'])
def addSpace():
    # check token
    decoded_token = decode_auth_token(request.json["token"])
    if decoded_token["status"] == "success":
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
        return jsonify({"status": "success", "space": {"name" : new_space.name, "id": new_space.id}})
    else:
        return jsonify({"status": "fail"})

# Route /items : get all the list of items of a space
# Need {"space" : spaceID, "id": userID, "token": token}
# Return {"status: "success", listItems" : [{"id":ID, "name":name, "parent":parentID, "owner":userID, "space": spaceID}]}
@app.route('/items', methods=['POST'])
def items():
    decoded_token = decode_auth_token(request.json["token"])
    space = request.json["space"]
    if decoded_token["status"] == "success":
        from tables import Item
        listItems = Item.query.filter(Item.space == int(space))
        output = []
        for item in listItems:
            output.append({'id':item.id, 'name': item.name, 'parent': item.parent, 'owner': item.userID, 'space': item.space})
        return jsonify({'status': 'success', 'listItems': output})
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})

# Route /members : get all the list of members allowed in a space
# Need {"space" : spaceID, 'token' : token}
# Return {"listMembers" : [{"id":ID, "name":name, "email": email}]}
@app.route('/members', methods=['POST'])
def members():
    decoded_token = decode_auth_token(request.json["token"])
    space = request.json["space"]
    if decoded_token["status"] == "success":
        from tables import User
        listMembers = User.query.filter(User.stringSpaces.contains("," + str(space) + ","))
        output = []
        for user in listMembers:
            output.append({'id': user.id, 'name': user.name, 'email': user.email})
        return jsonify({'status': 'success', 'listMembers' : output})
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})

# Route /item/add : method post, add a new item to the database
# JSON needed : { "name": "abcde", "parent": 45, "owner": 12, "space": 1}
# Return {"newItem" : {"id", "name", "parent", "owner"}}
@app.route('/item/add', methods=['POST'])
def addItem():
    decoded_token = decode_auth_token(request.json["token"])
    if decoded_token["status"] == "success":
        space = request.json["space"]
        if not request.json or not 'name' in request.json:
            abort(400)
        # add the item to the database
        from tables import Item
        new_item = Item(userID=request.json['owner'], parent=request.json['parent'], name=request.json['name'], space=request.json['space'])
        db_session.add(new_item)
        db_session.commit()
        # return the new item, with the id just generated
        return jsonify({'status': 'success', 'newItem': {'id': new_item.id, 'name': new_item.name, 'parent': new_item.parent, 'owner': new_item.userID}}), 201
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})

# Route /member/add : method post, add a new member to a space
# JSON needed : { "email": email, "space": spaceID}
# Return {"newMember" : {"id", "email", "name"}} , nemMember's id -1 if email doesn't exist, -2 if already in the space
@app.route('/member/add', methods=['POST'])
def addMember():
    decoded_token = decode_auth_token(request.json["token"])
    if decoded_token["status"] == "success":
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
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})

# Route /item/remove : method post, remove an item from the database
# JSON needed : { "idList" : [id1, id2, id3]}
# Return {"ok": "ok"}
@app.route('/item/remove', methods=['POST'])
def removeItem():
    decoded_token = decode_auth_token(request.json["token"])
    if not request.json:
        abort(400)
    if decoded_token["status"] == "success":
        idsToRemove = request.json["idList"] # array (containing the id of the item and the id of its children)
        # delete the items from the list
        from tables import Item
        for ID in idsToRemove:
            item = Item.query.filter(Item.id == ID).first()
            db_session.delete(item)
        db_session.commit()    
        return jsonify({'ok': 'ok'}), 201
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})


# Route /member/remove : method post, remove a member from the database
# JSON needed : { "id" : id, "space": space}
@app.route('/member/remove', methods=['POST'])
def removeMember():
    decoded_token = decode_auth_token(request.json["token"])
    if decoded_token["status"] == "success":
        idToRemove = request.json["id"]
        space = request.json["space"]
        # Find the user
        from tables import User
        user = User.query.filter(User.id == idToRemove)
        # Remove the space from his list of spaces
        listSpaces = stringToList(user.stringSpaces)
        for sp in listSpaces:
            if sp != space:
                newList.append(sp)
        user.stringSpaces = listToString(newList)
        db_session.commit()
        return jsonify({'ok': 'ok'}), 201
    else:
        # Either the token is invalid either it is expired
        return jsonify({'status' : 'fail', 'message': decoded_token["message"]})


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
        # Reply if the pwd is correct or not and send the id and the token
        if (bcrypt.check_password_hash(user.password,pwd)):
            listSpaces = stringToList(user.stringSpaces)
            return jsonify({'spaces' : fillNames(listSpaces), 'id' : user.id, 'name' : user.name, 'token': encode_auth_token(user.id)})
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
    new_space = Space(request.json["name"] + "'s Stormy")
    db_session.add(new_space)
    db_session.commit()
    # Add new user and return it
    spacesList = [new_space.id]
    # Hash + salt password before storing it
    hashedPwd = bcrypt.generate_password_hash(request.json["password"])
    new_user = User(email=request.json["email"], password=hashedPwd, name=request.json["name"], stringSpaces=listToString(spacesList))
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    listSpaces = stringToList(new_user.stringSpaces)
    return jsonify({'id': (int)(new_user.id), 'email': new_user.email, 'name' : new_user.name, 'spaces': fillNames(listSpaces), 'token': encode_auth_token(new_user.id)})
# ============================= ROUTES ============================


# --------------- run server --------------------------------------
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0" )#, ssl_context=('/etc/letsencrypt/live/118.ip-51-38-68.eu/fullchain.pem', '/etc/letsencrypt/live/118.ip-51-38-68.eu/privkey.pem'))
    # IP address 0.0.0.0 makes the server externally visible