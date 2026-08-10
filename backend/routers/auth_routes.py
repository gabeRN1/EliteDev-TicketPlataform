from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(models.User).filter(models.User.email == user_in.email).first()
    
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    hashed_password = security.get_password_hash(user_in.senha)
    
    
    new_user = models.User(
        nome=user_in.nome,
        email=user_in.email,
        senha=hashed_password, 
        role=user_in.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Autentica o Usuario e retorna o JWT"""

    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    

    if not user or not security.verify_password(login_data.senha, user.senha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    return {"access_token": access_token, "token_type": "bearer"}