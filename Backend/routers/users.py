from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

users = [
    {
        "id": 1,
        "name": "Surbhi Mulik",
        "email": "surbhi@gmail.com",
        "phone": "9876543210",
        "role": "Customer",
        "loyalty_points": 240,
        "rewards": ["Free Coffee", "10% Off Next Order"]
    },
    {
        "id": 2,
        "name": "pranjal patil",
        "email": "pranjal@gmail.com",
        "phone": "9834675896",
        "role": "Customer",
        "loyalty_points": 150,
        "rewards": []
    }
]

# Get all users
@router.get("/")
def get_users():
    return users

# Get user by ID
@router.get("/{user_id}")
def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

# Add new user
@router.post("/")
def add_user(user: dict):
    # Ensure default loyalty and rewards fields are present
    if "loyalty_points" not in user:
        user["loyalty_points"] = 0
    if "rewards" not in user:
        user["rewards"] = []
    users.append(user)
    return {
        "message": "User added successfully",
        "data": user
    }

# Update user
@router.put("/{user_id}")
def update_user(user_id: int, updated_user: dict):
    for index, user in enumerate(users):
        if user["id"] == user_id:
            # Preserve existing rewards and loyalty if not provided in update
            if "loyalty_points" not in updated_user:
                updated_user["loyalty_points"] = user.get("loyalty_points", 0)
            if "rewards" not in updated_user:
                updated_user["rewards"] = user.get("rewards", [])
            users[index] = updated_user
            return {
                "message": "User updated successfully",
                "data": updated_user
            }
    raise HTTPException(status_code=404, detail="User not found")

# Add loyalty points to a user
@router.post("/{user_id}/loyalty")
def add_loyalty_points(user_id: int, payload: dict):
    points = payload.get("points", 0)
    for user in users:
        if user["id"] == user_id:
            user["loyalty_points"] = user.get("loyalty_points", 0) + points
            return {
                "message": f"Successfully added {points} loyalty points",
                "loyalty_points": user["loyalty_points"]
            }
    raise HTTPException(status_code=404, detail="User not found")

# Add a reward to a user's wallet
@router.post("/{user_id}/rewards")
def add_reward(user_id: int, payload: dict):
    reward = payload.get("reward")
    if not reward:
        raise HTTPException(status_code=400, detail="Reward name is required")
    for user in users:
        if user["id"] == user_id:
            if "rewards" not in user:
                user["rewards"] = []
            user["rewards"].append(reward)
            return {
                "message": f"Added reward: {reward}",
                "rewards": user["rewards"]
            }
    raise HTTPException(status_code=404, detail="User not found")

# Delete user
@router.delete("/{user_id}")
def delete_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            users.remove(user)
            return {"message": "User deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")
print("User router loaded successfully")