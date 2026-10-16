import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    String,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    Text,
    Index,
)
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    tg_id = Column(BigInteger, unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=True)
    phone = Column(String(25), nullable=True)
    role = Column(String(20), default="client")  # 'client', 'master', 'shop', 'admin'
    balance = Column(BigInteger, default=0)       # Ichki balans (so'mda)
    brand_name = Column(String(150), nullable=True)
    brand_logo_url = Column(Text, nullable=True)
    master_rates = Column(JSONB, default=dict)
    region = Column(String(80), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=utc_now)

    # Relationships
    estimates = relationship("Estimate", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    purchased_leads = relationship("Lead", back_populates="buyer", foreign_keys="Lead.purchased_by")

class MaterialCatalog(Base):
    __tablename__ = "materials_catalog"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name_uz = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    tier = Column(String(20), default="standard")
    consumption_per_m2 = Column(Numeric(6, 3), nullable=False)
    package_volume = Column(Numeric(8, 2), nullable=False)
    package_unit = Column(String(30), nullable=False)
    avg_price = Column(BigInteger, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=utc_now)

class Estimate(Base):
    __tablename__ = "estimates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    project_title = Column(String(150), nullable=False)
    rooms_data = Column(JSONB, nullable=False)
    materials_total = Column(BigInteger, nullable=False)
    labor_total = Column(BigInteger, default=0)
    grand_total = Column(BigInteger, nullable=False)
    is_paid = Column(Boolean, default=False)
    pdf_file_id = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=utc_now)

    # Relationships
    user = relationship("User", back_populates="estimates")
    leads = relationship("Lead", back_populates="estimate")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    estimate_id = Column(UUID(as_uuid=True), ForeignKey("estimates.id"), nullable=True, index=True)
    client_phone = Column(String(25), nullable=False)
    region = Column(String(80), nullable=False)
    lead_type = Column(String(30), nullable=False)  # 'materials_order', 'need_master'
    lead_price = Column(BigInteger, default=10000)
    purchased_by = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(20), default="open")     # 'open', 'sold', 'expired'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=utc_now)

    __table_args__ = (
        Index("idx_leads_region_status", "region", "status"),
    )

    # Relationships
    estimate = relationship("Estimate", back_populates="leads")
    buyer = relationship("User", back_populates="purchased_leads", foreign_keys=[purchased_by])

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(BigInteger, nullable=False)
    tx_type = Column(String(30), nullable=False)     # 'topup', 'pdf_unlock', 'lead_buy'
    provider = Column(String(30), nullable=True)      # 'click', 'payme', 'internal_balance'
    external_tx_id = Column(String(120), nullable=True)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=utc_now)

    # Relationships
    user = relationship("User", back_populates="transactions")
