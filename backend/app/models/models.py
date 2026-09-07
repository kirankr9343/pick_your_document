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
    role = Column(String(20), default="USER", nullable=False, index=True)  # USER, ADMIN, SUPER_ADMIN
    status = Column(String(20), default="active", nullable=False, index=True)  # active, disabled
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
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
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, processing, completed, failed, expired
    file_size = Column(Integer, nullable=False)
    processing_time_ms = Column(Float, default=0.0)
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

class ToolStatus(Base):
    __tablename__ = "tool_statuses"

    tool_id = Column(String(50), primary_key=True)
    enabled = Column(Boolean, default=True, nullable=False)
    category = Column(String(50), nullable=False, default="pdf")
    usage_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    total_processing_time_ms = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    admin_email = Column(String(255), nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)  # ROLE_CHANGE, STATUS_CHANGE, TOOL_TOGGLE, SETTINGS_CHANGE
    target_type = Column(String(50), nullable=False)  # user, tool, system
    target_id = Column(String(255), nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
