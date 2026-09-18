from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
import bcrypt

from database import SessionLocal
from models import User, FoodItem, Claim, Organization


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="FoodRescue API",
    description="Surplus Food Donation and Recovery System",
    version="1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "FoodRescue Server is running successfully!",
        "status": "online"
    }


# =========================================================
# REGISTER
# =========================================================

@app.post("/register")
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == register_data.email)
        .first()
    )

    if existing_user:

        return {
            "success": False,
            "message": "Email already registered."
        }

    hashed_password = bcrypt.hashpw(
        register_data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        name=register_data.name,
        email=register_data.email,
        password=hashed_password,
        role=register_data.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "success": True,
        "message": "Registration successful!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:

        return {
            "success": False,
            "message": "Invalid email or password."
        }

    stored_password = user.password

    if (
        stored_password.startswith("$2b$")
        or stored_password.startswith("$2a$")
        or stored_password.startswith("$2y$")
    ):

        password_correct = bcrypt.checkpw(
            login_data.password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

    else:

        password_correct = (
            login_data.password == stored_password
        )

    if not password_correct:

        return {
            "success": False,
            "message": "Invalid email or password."
        }

    return {
        "success": True,
        "message": "Login successful!",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# =========================================================
# CREATE FOOD DONATION
# =========================================================

@app.post("/food-items")
def create_food_item(

    food_name: str,

    description: str,

    category: str,

    quantity: int,

    location: str,

    expiry_date: str,

    donor_name: str,

    contact: str,

    pickup_deadline: str = None,

    donor_id: int = None,

    organization_id: int = None,

    db: Session = Depends(get_db)

):

    # -----------------------------------------------------
    # CONVERT EXPIRY DATE
    # -----------------------------------------------------

    try:

        expiry_datetime = datetime.fromisoformat(
            expiry_date
        )

    except ValueError:

        return {
            "success": False,
            "message": "Invalid expiry date."
        }

    # -----------------------------------------------------
    # CONVERT AND VALIDATE PICKUP DEADLINE
    # -----------------------------------------------------

    pickup_datetime = None

    if pickup_deadline:

        try:

            # datetime-local from React normally arrives as:
            # 2026-09-19T18:00
            #
            # Remove timezone information only if it
            # accidentally arrives with a Z.

            clean_pickup_deadline = (
                pickup_deadline
                .replace("Z", "")
            )

            pickup_datetime = datetime.fromisoformat(
                clean_pickup_deadline
            )

        except ValueError:

            return {
                "success": False,
                "message": "Invalid pickup deadline."
            }

        # -------------------------------------------------
        # PICKUP MUST BE BEFORE FOOD EXPIRY
        # -------------------------------------------------

        if pickup_datetime >= expiry_datetime:

            return {
                "success": False,
                "message": (
                    "Pickup deadline must be earlier "
                    "than the food expiry time."
                )
            }

        # -------------------------------------------------
        # NOTE:
        #
        # We intentionally DO NOT compare pickup_datetime
        # with datetime.now() here.
        #
        # React's datetime-local input sends local date/time
        # without timezone information. Comparing it with
        # the backend server clock can incorrectly reject
        # a valid future local time.
        #
        # The important database rule is that pickup must
        # happen before food expiry.
        # -------------------------------------------------

    # -----------------------------------------------------
    # VALIDATE ORGANIZATION
    # -----------------------------------------------------

    if organization_id is not None:

        organization = (
            db.query(Organization)
            .filter(
                Organization.id == organization_id
            )
            .first()
        )

        if not organization:

            return {
                "success": False,
                "message": "Organization not found."
            }

        if not organization.verified:

            return {
                "success": False,
                "message": (
                    "This organization is not yet "
                    "verified by FoodRescue."
                )
            }

    # -----------------------------------------------------
    # CREATE FOOD ITEM
    # -----------------------------------------------------

    new_food = FoodItem(

        food_name=food_name,

        description=description,

        category=category,

        quantity=quantity,

        location=location,

        expiry_date=expiry_datetime,

        pickup_deadline=pickup_datetime,

        donor_name=donor_name,

        contact=contact,

        status="Pending",

        donor_id=donor_id,

        organization_id=organization_id

    )

    db.add(new_food)

    db.commit()

    db.refresh(new_food)

    return {

        "success": True,

        "message": "Food donation submitted for verification!",

        "food": {

            "id": new_food.id,

            "food_name": new_food.food_name,

            "description": new_food.description,

            "category": new_food.category,

            "quantity": new_food.quantity,

            "location": new_food.location,

            "expiry_date": new_food.expiry_date,

            "pickup_deadline": new_food.pickup_deadline,

            "donor_name": new_food.donor_name,

            "contact": new_food.contact,

            "donor_id": new_food.donor_id,

            "organization_id": new_food.organization_id,

            "status": new_food.status

        }

    }


# =========================================================
# GET ALL FOOD ITEMS
# =========================================================

@app.get("/food-items")
def get_food_items(
    db: Session = Depends(get_db)
):

    food_items = (

        db.query(FoodItem)

        .order_by(
            FoodItem.created_at.desc()
        )

        .all()

    )

    return [

        {

            "id": item.id,

            "food_name": item.food_name,

            "description": item.description,

            "category": item.category,

            "quantity": item.quantity,

            "location": item.location,

            "expiry_date": item.expiry_date,

            "pickup_deadline": item.pickup_deadline,

            "donor_name": item.donor_name,

            "contact": item.contact,

            "status": item.status,

            "donor_id": item.donor_id,

            "organization_id": item.organization_id,

            "created_at": item.created_at

        }

        for item in food_items

    ]


# =========================================================
# GET VERIFIED / AVAILABLE FOOD
# =========================================================

@app.get("/available-food")
def get_available_food(
    db: Session = Depends(get_db)
):

    food_items = (

        db.query(FoodItem)

        .filter(
            FoodItem.status == "Verified"
        )

        .order_by(
            FoodItem.created_at.desc()
        )

        .all()

    )

    return [

        {

            "id": item.id,

            "food_name": item.food_name,

            "description": item.description,

            "category": item.category,

            "quantity": item.quantity,

            "location": item.location,

            "expiry_date": item.expiry_date,

            "pickup_deadline": item.pickup_deadline,

            "donor_name": item.donor_name,

            "contact": item.contact,

            "status": item.status,

            "organization_id": item.organization_id,

            "created_at": item.created_at

        }

        for item in food_items

    ]


# =========================================================
# CREATE FOOD CLAIM
# =========================================================

@app.post("/claims")
def create_claim(

    food_id: int,

    user_id: int,

    db: Session = Depends(get_db)

):

    food = (

        db.query(FoodItem)

        .filter(
            FoodItem.id == food_id
        )

        .first()

    )

    if not food:

        return {
            "success": False,
            "message": "Food item not found."
        }

    if food.status != "Verified":

        return {
            "success": False,
            "message": "This food is not available for claiming."
        }

    user = (

        db.query(User)

        .filter(
            User.id == user_id
        )

        .first()

    )

    if not user:

        return {
            "success": False,
            "message": "Recipient not found."
        }

    if user.role != "Recipient":

        return {
            "success": False,
            "message": "Only recipients can claim food."
        }

    existing_claim = (

        db.query(Claim)

        .filter(
            Claim.food_id == food_id
        )

        .first()

    )

    if existing_claim:

        return {
            "success": False,
            "message": "This food has already been claimed."
        }

    claim = Claim(

        food_id=food_id,

        user_id=user_id,

        status="Pending"

    )

    db.add(claim)

    food.status = "Claimed"

    db.commit()

    db.refresh(claim)

    return {

        "success": True,

        "message": "Food claimed successfully!",

        "claim": {

            "id": claim.id,

            "food_id": claim.food_id,

            "user_id": claim.user_id,

            "status": claim.status,

            "claimed_at": claim.claimed_at

        }

    }


# =========================================================
# GET RECIPIENT CLAIMS
# =========================================================

@app.get("/my-claims/{user_id}")
def get_my_claims(

    user_id: int,

    db: Session = Depends(get_db)

):

    claims = (

        db.query(Claim)

        .filter(
            Claim.user_id == user_id
        )

        .order_by(
            Claim.claimed_at.desc()
        )

        .all()

    )

    result = []

    for claim in claims:

        food = (

            db.query(FoodItem)

            .filter(
                FoodItem.id == claim.food_id
            )

            .first()

        )

        if food:

            result.append({

                "claim_id": claim.id,

                "food_id": food.id,

                "food_name": food.food_name,

                "description": food.description,

                "category": food.category,

                "quantity": food.quantity,

                "location": food.location,

                "expiry_date": food.expiry_date,

                "pickup_deadline": food.pickup_deadline,

                "donor_name": food.donor_name,

                "contact": food.contact,

                "food_status": food.status,

                "organization_id": food.organization_id,

                "claim_status": claim.status,

                "claimed_at": claim.claimed_at

            })


    return result


# =========================================================
# ADMIN - GET ALL USERS
# =========================================================

@app.get("/admin/users")
def get_all_users(
    db: Session = Depends(get_db)
):

    users = (

        db.query(User)

        .order_by(
            User.created_at.desc()
        )

        .all()

    )

    return [

        {

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role,

            "created_at": user.created_at

        }

        for user in users

    ]


# =========================================================
# ADMIN - GET ALL CLAIMS
# =========================================================

@app.get("/admin/claims")
def get_all_claims(
    db: Session = Depends(get_db)
):

    claims = (

        db.query(Claim)

        .order_by(
            Claim.claimed_at.desc()
        )

        .all()

    )

    result = []

    for claim in claims:

        food = (

            db.query(FoodItem)

            .filter(
                FoodItem.id == claim.food_id
            )

            .first()

        )

        recipient = (

            db.query(User)

            .filter(
                User.id == claim.user_id
            )

            .first()

        )

        if food and recipient:

            result.append({

                "claim_id": claim.id,

                "food_id": claim.food_id,

                "food_name": food.food_name,

                "recipient_name": recipient.name,

                "quantity": food.quantity,

                "location": food.location,

                "expiry_date": food.expiry_date,

                "pickup_deadline": food.pickup_deadline,

                "organization_id": food.organization_id,

                "claim_status": claim.status,

                "claimed_at": claim.claimed_at

            })

    return result


# =========================================================
# ADMIN - VERIFY FOOD
# =========================================================

@app.put("/admin/food/{food_id}/verify")
def verify_food(

    food_id: int,

    db: Session = Depends(get_db)

):

    food = (

        db.query(FoodItem)

        .filter(
            FoodItem.id == food_id
        )

        .first()

    )

    if not food:

        return {

            "success": False,

            "message": "Food donation not found."

        }

    food.status = "Verified"

    db.commit()

    db.refresh(food)

    return {

        "success": True,

        "message": "Food donation verified successfully!",

        "food": {

            "id": food.id,

            "food_name": food.food_name,

            "status": food.status

        }

    }


# =========================================================
# ADMIN - REJECT FOOD
# =========================================================

@app.put("/admin/food/{food_id}/reject")
def reject_food(

    food_id: int,

    db: Session = Depends(get_db)

):

    food = (

        db.query(FoodItem)

        .filter(
            FoodItem.id == food_id
        )

        .first()

    )

    if not food:

        return {

            "success": False,

            "message": "Food donation not found."

        }

    food.status = "Rejected"

    db.commit()

    db.refresh(food)

    return {

        "success": True,

        "message": "Food donation rejected.",

        "food": {

            "id": food.id,

            "food_name": food.food_name,

            "status": food.status

        }

    }


# =========================================================
# ADMIN - UPDATE CLAIM STATUS
# =========================================================

@app.put("/admin/claims/{claim_id}/status")
def update_claim_status(

    claim_id: int,

    status: str,

    db: Session = Depends(get_db)

):

    claim = (

        db.query(Claim)

        .filter(
            Claim.id == claim_id
        )

        .first()

    )

    if not claim:

        return {

            "success": False,

            "message": "Claim not found."

        }

    allowed_statuses = [

        "Pending",

        "Approved",

        "Ready for Pickup",

        "Collected"

    ]

    if status not in allowed_statuses:

        return {

            "success": False,

            "message": "Invalid claim status."

        }

    valid_next_status = {

        "Pending": "Approved",

        "Approved": "Ready for Pickup",

        "Ready for Pickup": "Collected"

    }

    current_status = claim.status

    if current_status != status:

        expected_status = (
            valid_next_status.get(
                current_status
            )
        )

        if expected_status != status:

            return {

                "success": False,

                "message": (
                    f"Invalid status transition. "
                    f"{current_status} can only move to "
                    f"{expected_status}."
                )

            }

    claim.status = status

    db.commit()

    db.refresh(claim)

    return {

        "success": True,

        "message": (
            f"Claim status updated to {status}."
        ),

        "claim": {

            "id": claim.id,

            "food_id": claim.food_id,

            "user_id": claim.user_id,

            "status": claim.status,

            "claimed_at": claim.claimed_at

        }

    }


# =========================================================
# ORGANIZATION APIs
# =========================================================

@app.get("/organizations")
def get_organizations(

    type: str = None,

    area: str = None,

    db: Session = Depends(get_db)

):

    query = db.query(Organization)

    if type:

        query = query.filter(
            Organization.type == type
        )

    if area:

        query = query.filter(
            Organization.area == area
        )

    organizations = query.order_by(
        Organization.name.asc()
    ).all()

    return [

        {

            "id": org.id,

            "name": org.name,

            "type": org.type,

            "address": org.address,

            "area": org.area,

            "city": org.city,

            "contact": org.contact,

            "email": org.email,

            "verified": bool(org.verified),

            "source_name": org.source_name,

            "source_url": org.source_url,

            "focus_area": org.focus_area,

            "data_status": org.data_status

        }

        for org in organizations

    ]


# =========================================================
# VOLUNTEER APIs
# =========================================================

@app.get("/volunteer/requests")
def get_volunteer_requests(

    volunteer_id: int,

    db: Session = Depends(get_db)

):

    """
    Return pickup requests available to volunteers
    plus requests already assigned to this volunteer.
    """

    volunteer = (

        db.query(User)

        .filter(User.id == volunteer_id)

        .first()

    )

    if not volunteer:

        return {

            "success": False,

            "message": "Volunteer not found."

        }

    if volunteer.role != "Volunteer":

        return {

            "success": False,

            "message": "Only volunteers can access pickup requests."

        }

    claims = (

        db.query(Claim)

        .filter(

            (

                Claim.status == "Ready for Pickup"

            )

            |

            (

                (Claim.volunteer_id == volunteer_id)

                &

                (

                    Claim.status.in_(
                        [
                            "Volunteer Accepted",
                            "Picked Up",
                            "Delivered"
                        ]
                    )

                )

            )

        )

        .order_by(
            Claim.claimed_at.desc()
        )

        .all()

    )

    result = []

    for claim in claims:

        food = claim.food_item

        organization_name = "Recipient organization"

        if food.organization:

            organization_name = food.organization.name

        result.append({

            "id": claim.id,

            "food_id": claim.food_id,

            "food_name": food.food_name,

            "description": food.description,

            "quantity": food.quantity,

            "location": food.location,

            "expiry_date": food.expiry_date,

            "pickup_deadline": food.pickup_deadline,

            "donor_name": food.donor_name,

            "contact": food.contact,

            "organization_name": organization_name,

            "status": claim.status,

            "volunteer_id": claim.volunteer_id,

            "claimed_at": claim.claimed_at,

            "pickup_accepted_at": claim.pickup_accepted_at,

            "picked_up_at": claim.picked_up_at,

            "delivered_at": claim.delivered_at

        })

    return result


# =========================================================
# VOLUNTEER ACCEPT PICKUP
# =========================================================

@app.post("/volunteer/claims/{claim_id}/accept")
def volunteer_accept_pickup(

    claim_id: int,

    volunteer_id: int,

    db: Session = Depends(get_db)

):

    volunteer = (

        db.query(User)

        .filter(User.id == volunteer_id)

        .first()

    )

    if not volunteer:

        return {

            "success": False,

            "message": "Volunteer not found."

        }

    if volunteer.role != "Volunteer":

        return {

            "success": False,

            "message": "Only volunteers can accept pickup requests."

        }

    claim = (

        db.query(Claim)

        .filter(Claim.id == claim_id)

        .first()

    )

    if not claim:

        return {

            "success": False,

            "message": "Claim not found."

        }

    if claim.status != "Ready for Pickup":

        return {

            "success": False,

            "message": "This pickup request is no longer available."

        }

    claim.volunteer_id = volunteer_id

    claim.status = "Volunteer Accepted"

    claim.pickup_accepted_at = datetime.utcnow()

    db.commit()

    db.refresh(claim)

    return {

        "success": True,

        "message": "Pickup request accepted successfully.",

        "claim_id": claim.id,

        "status": claim.status

    }


# =========================================================
# VOLUNTEER MARK PICKED UP
# =========================================================

@app.post("/volunteer/claims/{claim_id}/pickup")
def volunteer_mark_picked_up(

    claim_id: int,

    volunteer_id: int,

    db: Session = Depends(get_db)

):

    volunteer = (

        db.query(User)

        .filter(User.id == volunteer_id)

        .first()

    )

    if not volunteer:

        return {

            "success": False,

            "message": "Volunteer not found."

        }

    if volunteer.role != "Volunteer":

        return {

            "success": False,

            "message": "Only volunteers can update pickup status."

        }

    claim = (

        db.query(Claim)

        .filter(Claim.id == claim_id)

        .first()

    )

    if not claim:

        return {

            "success": False,

            "message": "Claim not found."

        }

    if claim.volunteer_id != volunteer_id:

        return {

            "success": False,

            "message": "This pickup is not assigned to you."

        }

    if claim.status != "Volunteer Accepted":

        return {

            "success": False,

            "message": "Pickup cannot be marked as picked up."

        }

    claim.status = "Picked Up"

    claim.picked_up_at = datetime.utcnow()

    db.commit()

    db.refresh(claim)

    return {

        "success": True,

        "message": "Food marked as picked up.",

        "claim_id": claim.id,

        "status": claim.status

    }


# =========================================================
# VOLUNTEER MARK DELIVERED
# =========================================================

@app.post("/volunteer/claims/{claim_id}/deliver")
def volunteer_mark_delivered(

    claim_id: int,

    volunteer_id: int,

    db: Session = Depends(get_db)

):

    volunteer = (

        db.query(User)

        .filter(User.id == volunteer_id)

        .first()

    )

    if not volunteer:

        return {

            "success": False,

            "message": "Volunteer not found."

        }

    if volunteer.role != "Volunteer":

        return {

            "success": False,

            "message": "Only volunteers can update delivery status."

        }

    claim = (

        db.query(Claim)

        .filter(Claim.id == claim_id)

        .first()

    )

    if not claim:

        return {

            "success": False,

            "message": "Claim not found."

        }

    if claim.volunteer_id != volunteer_id:

        return {

            "success": False,

            "message": "This delivery is not assigned to you."

        }

    if claim.status != "Picked Up":

        return {

            "success": False,

            "message": "Food must be picked up before delivery."

        }

    claim.status = "Delivered"

    claim.delivered_at = datetime.utcnow()

    claim.food_item.status = "Collected"

    db.commit()

    db.refresh(claim)

    return {

        "success": True,

        "message": "Food delivered successfully.",

        "claim_id": claim.id,

        "status": claim.status

    }