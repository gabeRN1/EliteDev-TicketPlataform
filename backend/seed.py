from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models

try:
    from security import get_password_hash
except ImportError:
    def get_password_hash(password: str) -> str:
        return password

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(models.User).filter_by(email="organizador@elitedev.com").first():
            print("O banco de dados já possui os dados de seed.")
            return

        print("Semeando o banco de dados conforme o edital do desafio...")

        organizador = models.User(
            nome="Organizador Principal",
            email="organizador@elitedev.com",
            senha=get_password_hash("123456"),
            role=models.RoleEnum.organizador
        )
        db.add(organizador)
        db.flush()

        cliente1 = models.User(
            nome="Cliente Um",
            email="cliente1@elitedev.com",
            senha=get_password_hash("123456"),
            role=models.RoleEnum.cliente
        )
        cliente2 = models.User(
            nome="Cliente Dois",
            email="cliente2@elitedev.com",
            senha=get_password_hash("123456"),
            role=models.RoleEnum.cliente
        )
        db.add_all([cliente1, cliente2])

        portaria = models.User(
            nome="Agente de Portaria",
            email="portaria@elitedev.com",
            senha=get_password_hash("123456"),
            role=models.RoleEnum.portaria
        )
        db.add(portaria)

        eventos = [
            models.Event(
                titulo="Festival de Jazz Elite",
                descricao="Uma noite inesquecível com os melhores nomes do jazz internacional.",
                local="Teatro Central",
                data_evento=datetime.now() + timedelta(days=15),
                preco=120.0,
                capacidade_total=300,
                ingressos_disponiveis=300,
                imagem_url="https://images.unsplash.com/photo-1511192336575-5a79af67a629",
                categoria="show",
                organizador_id=organizador.id
            ),
            models.Event(
                titulo="Tech Conference 2026",
                descricao="O maior evento de desenvolvimento de software e inovação do ano.",
                local="Centro de Convenções",
                data_evento=datetime.now() + timedelta(days=30),
                preco=250.0,
                capacidade_total=500,
                ingressos_disponiveis=450,
                imagem_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87",
                categoria="tecnologia",
                organizador_id=organizador.id
            )
        ]

        db.add_all(eventos)
        db.commit()
        
        print("Banco de dados semeado com sucesso!")
        print("\nCredenciais prontas para teste:")
        print("   - Organizador: organizador@elitedev.com | Senha: 123456")
        print("   - Cliente 1:    cliente1@elitedev.com    | Senha: 123456")
        print("   - Cliente 2:    cliente2@elitedev.com    | Senha: 123456")
        print("   - Portaria:     portaria@elitedev.com     | Senha: 123456")

    except Exception as e:
        db.rollback()
        print(f"Erro ao semear o banco de dados: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()