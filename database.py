from sqlalchemy import *
from sqlalchemy.orm import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import *

# -------- Create database ----------
engine = create_engine('sqlite:///stormy.db', echo=True, convert_unicode=True)     
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()
# ------- Create users table ----------
def init_db():
    import tables
    Base.metadata.create_all(bind=engine)


