from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# =========================================================
# USER MODEL
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    # Donor → Food donations
    food_items = relationship(
        "FoodItem",
        back_populates="donor"
    )


    # Recipient → Claims
    claims = relationship(
        "Claim",
        foreign_keys="Claim.user_id",
        back_populates="recipient"
    )


    # Volunteer → Pickup / delivery claims
    volunteer_claims = relationship(
        "Claim",
        foreign_keys="Claim.volunteer_id",
        back_populates="volunteer"
    )


# =========================================================
# ORGANIZATION MODEL
# =========================================================

class Organization(Base):

    __tablename__ = "organizations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False
    )

    type = Column(
        String(100),
        nullable=False
    )

    address = Column(
        String(300),
        nullable=True
    )

    area = Column(
        String(100),
        nullable=True
    )

    city = Column(
        String(100),
        nullable=True
    )

    contact = Column(
        String(50),
        nullable=True
    )

    email = Column(
        String(150),
        nullable=True
    )

    verified = Column(
        Integer,
        default=0
    )

    source_name = Column(
        String(200),
        nullable=True
    )

    source_url = Column(
        String(500),
        nullable=True
    )

    focus_area = Column(
        String(300),
        nullable=True
    )

    data_status = Column(
        String(50),
        default="Directory Listing"
    )


    # Organization → Food donations
    food_items = relationship(
        "FoodItem",
        back_populates="organization"
    )


# =========================================================
# FOOD ITEM MODEL
# =========================================================

class FoodItem(Base):

    __tablename__ = "food_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    food_name = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String(100),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    location = Column(
        String(200),
        nullable=False
    )

    expiry_date = Column(
        DateTime,
        nullable=False
    )

    pickup_deadline = Column(
        DateTime,
        nullable=True
    )

    donor_name = Column(
        String(150),
        nullable=False
    )

    contact = Column(
        String(20),
        nullable=False
    )

    status = Column(
        String(50),
        default="Pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    donor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=True
    )


    # Food → Donor
    donor = relationship(
        "User",
        back_populates="food_items"
    )


    # Food → Organization
    organization = relationship(
        "Organization",
        back_populates="food_items"
    )


    # Food → Claims
    claims = relationship(
        "Claim",
        back_populates="food_item"
    )


# =========================================================
# CLAIM MODEL
# =========================================================

class Claim(Base):

    __tablename__ = "claims"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    food_id = Column(
        Integer,
        ForeignKey("food_items.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Volunteer assigned to pickup/delivery
    volunteer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    status = Column(
        String(50),
        default="Pending"
    )

    claimed_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    pickup_accepted_at = Column(
        DateTime,
        nullable=True
    )

    picked_up_at = Column(
        DateTime,
        nullable=True
    )

    delivered_at = Column(
        DateTime,
        nullable=True
    )


    # Claim → Food
    food_item = relationship(
        "FoodItem",
        back_populates="claims"
    )


    # Claim → Recipient
    recipient = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="claims"
    )


    # Claim → Volunteer
    volunteer = relationship(
        "User",
        foreign_keys=[volunteer_id],
        back_populates="volunteer_claims"
    )