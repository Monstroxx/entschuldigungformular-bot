"""Datenbank Manager für den Entschuldigungsformular Bot."""

import os
from typing import Optional, List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
import logging

from .models import Base, User, Schedule, ExcuseForm

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manager für Datenbankoperationen."""
    
    def __init__(self, database_url: Optional[str] = None):
        """Initialisiert den DatabaseManager."""
        if database_url is None:
            # Railway-spezifische Datenbank-URL
            railway_db_url = os.getenv("DATABASE_URL")
            if railway_db_url:
                # Railway PostgreSQL
                database_url = railway_db_url
            else:
                # Lokale SQLite
                database_url = "sqlite:///bot.db"
        
        # Konfiguriere Engine für Railway
        engine_kwargs = {"echo": False}
        
        # PostgreSQL-spezifische Konfiguration für Railway
        if "postgresql" in database_url:
            engine_kwargs.update({
                "pool_size": 5,
                "max_overflow": 10,
                "pool_pre_ping": True,
                "pool_recycle": 300
            })
        
        self.engine = create_engine(database_url, **engine_kwargs)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Erstelle Tabellen
        self.create_tables()
    
    def create_tables(self) -> None:
        """Erstellt alle Tabellen."""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Datenbank-Tabellen erfolgreich erstellt")
        except SQLAlchemyError as e:
            logger.error(f"Fehler beim Erstellen der Tabellen: {e}")
            raise
    
    def get_session(self) -> Session:
        """Gibt eine neue Datenbank-Session zurück."""
        return self.SessionLocal()
    
    def get_user_by_discord_id(self, discord_id: str) -> Optional[User]:
        """Holt einen Benutzer anhand der Discord ID."""
        with self.get_session() as session:
            return session.query(User).filter(User.discord_id == discord_id).first()
    
    def create_user(self, discord_id: str, first_name: str = None, last_name: str = None) -> User:
        """Erstellt einen neuen Benutzer."""
        with self.get_session() as session:
            user = User(
                discord_id=discord_id,
                first_name=first_name,
                last_name=last_name
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
    
    def update_user(self, discord_id: str, **kwargs) -> Optional[User]:
        """Aktualisiert einen Benutzer."""
        with self.get_session() as session:
            user = session.query(User).filter(User.discord_id == discord_id).first()
            if user:
                for key, value in kwargs.items():
                    if hasattr(user, key):
                        setattr(user, key, value)
                session.commit()
                session.refresh(user)
            return user
    
    def get_user_schedule(self, discord_id: str) -> List[Schedule]:
        """Holt den Stundenplan eines Benutzers."""
        with self.get_session() as session:
            user = session.query(User).filter(User.discord_id == discord_id).first()
            if user:
                return session.query(Schedule).filter(Schedule.user_id == user.id).all()
            return []
    
    def save_schedule(self, discord_id: str, schedule_data: List[dict]) -> bool:
        """Speichert einen Stundenplan."""
        try:
            with self.get_session() as session:
                user = session.query(User).filter(User.discord_id == discord_id).first()
                if not user:
                    return False
                
                # Lösche alten Stundenplan
                session.query(Schedule).filter(Schedule.user_id == user.id).delete()
                
                # Speichere neuen Stundenplan
                for item in schedule_data:
                    schedule = Schedule(
                        user_id=user.id,
                        hour=item["hour"],
                        subject=item["subject"]
                    )
                    session.add(schedule)
                
                session.commit()
                return True
        except SQLAlchemyError as e:
            logger.error(f"Fehler beim Speichern des Stundenplans: {e}")
            return False
    
    def create_excuse_form(self, discord_id: str, reason: str, start_date, end_date) -> Optional[ExcuseForm]:
        """Erstellt ein neues Entschuldigungsformular."""
        try:
            with self.get_session() as session:
                user = session.query(User).filter(User.discord_id == discord_id).first()
                if not user:
                    return None
                
                excuse_form = ExcuseForm(
                    user_id=user.id,
                    reason=reason,
                    start_date=start_date,
                    end_date=end_date
                )
                session.add(excuse_form)
                session.commit()
                session.refresh(excuse_form)
                return excuse_form
        except SQLAlchemyError as e:
            logger.error(f"Fehler beim Erstellen des Entschuldigungsformulars: {e}")
            return None
