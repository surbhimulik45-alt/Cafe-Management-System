from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

admins = [
    {
        "id": 1,
        "name": "Admin",
        "email": "admin@cafe.com",
        "password": "admin123",
        "role": "Admin"
    }
]


# Get All Admins
@router.get("/")
def get_admins():
    return admins


# Dashboard Summary — must be BEFORE /{admin_id} to avoid route conflict
@router.get("/dashboard/summary")
def dashboard_summary():
    return {
        "total_users": 25,
        "total_menu_items": 30,
        "total_categories": 8,
        "total_orders": 120,
        "total_bookings": 18,
        "total_payments": 110,
        "total_reviews": 10,
        "message": "Welcome to Cafe Delight Admin Dashboard"
    }


# Get Admin by ID
@router.get("/{admin_id}")
def get_admin(admin_id: int):
    for admin in admins:
        if admin["id"] == admin_id:
            return admin

    raise HTTPException(
        status_code=404,
        detail="Admin not found"
    )


# Add Admin
@router.post("/")
def create_admin(admin: dict):
    admins.append(admin)
    return {
        "message": "Admin created successfully",
        "data": admin
    }


# Update Admin
@router.put("/{admin_id}")
def update_admin(admin_id: int, updated_admin: dict):
    for index, admin in enumerate(admins):
        if admin["id"] == admin_id:
            admins[index] = updated_admin
            return {
                "message": "Admin updated successfully",
                "data": updated_admin
            }

    raise HTTPException(
        status_code=404,
        detail="Admin not found"
    )


# Delete Admin
@router.delete("/{admin_id}")
def delete_admin(admin_id: int):
    for admin in admins:
        if admin["id"] == admin_id:
            admins.remove(admin)
            return {
                "message": "Admin deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Admin not found"
    )


print("Admin router loaded successfully")