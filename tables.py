
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String)
    password = Column(String)
    name = Column(String)
    space = Column(Integer)

    def __init__(self, email=None, password=None, name=None, space=None):
        self.email = email
        self.password = password
        self.name = name
        self.space = space

    def __repr__(self):
        return '<User %s, %s. Space : %d>' % (self.email, self.name, self.space)

class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, autoincrement=True, primary_key=True)
    userID = Column(Integer)
    parent = Column(Integer)
    name = Column(String)
    space = Column(Integer)

    def __init__(self, userID=None, parent=None, name=None, space=None):
        self.userID = userID
        self.parent = parent
        self.name = name
        self.space= space

    def __repr__(self):
        return '<Item %s>' % (self.name)

class Space(Base):
    __tablename__ = 'spaces'
    id = Column(Integer, autoincrement=True, primary_key=True)
    name = Column(String)

    def __init__(self, name=None):
        self.name = name

    def __repr__(self):
        return "Space %s" % (self.name)
