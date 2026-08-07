from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

users = [
    {
        "id": 1,
        "name": "Surbhi",
        "email": "surbhi@gmail.com",
        "password": "123456",
        "role": "Customer"
    },
    {
        "id": 2,
        "name": "Admin",
        "email": "admin@cafe.com",
        "password": "admin123",
        "role": "Admin"
    }
]


# Register User
@router.post("/register")
def register(user: dict):
    for u in users:
        if u["email"] == user["email"]:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    users.append(user)

    return {
        "message": "User registered successfully",
        "data": user
    }


# Login User
@router.post("/login")
def login(login_data: dict):

    email = login_data.get("email")
    password = login_data.get("password")

    for user in users:
        if user["email"] == email and user["password"] == password:
            return {
                "message": "Login successful",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                }
            }

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


# Get All Users
@router.get("/users")
def get_users():
    return users


# Get User by ID
@router.get("/users/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user

    raise HTTPException(
        status_code=404,
        detail="User not found"
    )


# Update User
@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: dict):
    for index, user in enumerate(users):
        if user["id"] == user_id:
            users[index] = updated_user
            return {
                "message": "User updated successfully",
                "data": updated_user
            }

    raise HTTPException(
        status_code=404,
        detail="User not found"
    )


# Delete User
@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            users.remove(user)
            return {
                "message": "User deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="User not found"
    )


print("Authentication router loaded successfully")