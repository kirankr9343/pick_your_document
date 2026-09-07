import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    jobs = relationship("ProcessingJob", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    tool_type = Column(String(50), nullable=False, index=True)
    input_filename = Column(String(255), nullable=False)
    output_filename = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, processing, completed, failed
    file_size = Column(Integer, nullable=False)
    download_token = Column(String(64), unique=True, nullable=True, index=True)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="jobs")

class UsageRecord(Base):
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    tool_type = Column(String(50), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)
    processing_time = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    plan = Column(String(50), nullable=False, default="free")  # free, pro, enterprise
    status = Column(String(20), nullable=False, default="active")  # active, canceled, expired
    provider = Column(String(50), nullable=True)  # stripe, razorpay
    provider_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
