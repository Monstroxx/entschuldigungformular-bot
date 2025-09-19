"""SQLAlchemy Models für den Entschuldigungsformular Bot."""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """Benutzer Model."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    discord_id = Column(String(20), unique=True, nullable=False, index=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    excuse_forms = relationship("ExcuseForm", back_populates="user", cascade="all, delete-orphan")


class Schedule(Base):
    """Stundenplan Model."""
    
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hour = Column(String(10), nullable=False)  # z.B. "1. Stunde", "2. Stunde"
    subject = Column(String(100), nullable=False)  # z.B. "Mathematik", "Deutsch"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="schedules")


class ExcuseForm(Base):
    """Entschuldigungsformular Model."""
    
    __tablename__ = "excuse_forms"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_path = Column(String(255), nullable=True)  # Pfad zur generierten Datei
    is_processed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="excuse_forms")
