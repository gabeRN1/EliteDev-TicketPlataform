import os
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = (
    os.getenv("POSTGRES_URL") or 
    os.getenv("POSTGRES_URL_NON_POOLING") or 
    os.getenv("DATABASE_URL") or 
    "sqlite:///./app.db"
)


if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "postgresql" in DATABASE_URL and "?" in DATABASE_URL:
    parsed_url = urlparse(DATABASE_URL)
    query_params = parse_qsl(parsed_url.query)
    
    filtered_params = [(k, v) for k, v in query_params if k not in ("supa", "pgbouncer")]

    new_query = urlencode(filtered_params)
    DATABASE_URL = urlunparse(parsed_url._replace(query=new_query))

if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  
        pool_recycle=300     
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()