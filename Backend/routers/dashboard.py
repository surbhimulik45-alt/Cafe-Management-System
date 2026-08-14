from fastapi import APIRouter
from .booking import bookings
from .orders import orders
from .users import users

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

# Added to resolve the missing endpoint used by customer_dashboard.js
@router.get("/bookings/user/{name}")
def get_user_bookings(name: str):
    user_bookings = [b for b in bookings if b["customer_name"].lower() == name.lower()]
    return {"bookings": user_bookings}

# Unified Customer Dashboard API (Optional enhancement)
@router.get("/customer/{user_id}/summary")
def get_customer_summary(user_id: int):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return {"error": "User not found"}
        
    user_orders = [o for o in orders if o["user_id"] == user_id]
    user_bookings = [b for b in bookings if b["customer_name"].lower() == user["name"].lower()]
    
    return {
        "user": user,
        "orders": user_orders,
        "bookings": user_bookings,
        "loyalty_points": user.get("loyalty_points", 0),
        "rewards": user.get("rewards", [])
    }

print("Dashboard router loaded successfully")
