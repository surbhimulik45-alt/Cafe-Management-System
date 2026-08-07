from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)

favorites = [
    {
        "id": 1,
        "user_id": 1,
        "menu_id": 1,
        "item_name": "Watermelon Mojito"
    },
    {
        "id": 2,
        "user_id": 1,
        "menu_id": 12,
        "item_name": "Paneer Tikka Burger"
    },
    {
        "id": 3,
        "user_id": 2,
        "menu_id": 6,
        "item_name": "Brownie Shake"
    },
    {
        "id": 4,
        "user_id": 2,
        "menu_id": 21,
        "item_name": "White Sauce Pasta"
    },
    {
        "id": 5,
        "user_id": 3,
        "menu_id": 27,
        "item_name": "Chocolate Croissant"
    }
]


# Get all favorite items
@router.get("/")
def get_favorites():
    return favorites


# Get favorite item by ID
@router.get("/{favorite_id}")
def get_favorite(favorite_id: int):
    for favorite in favorites:
        if favorite["id"] == favorite_id:
            return favorite

    raise HTTPException(
        status_code=404,
        detail="Favorite item not found"
    )


# Add favorite item
@router.post("/")
def add_favorite(favorite: dict):
    favorites.append(favorite)
    return {
        "message": "Item added to favorites successfully",
        "data": favorite
    }


# Update favorite item
@router.put("/{favorite_id}")
def update_favorite(favorite_id: int, updated_favorite: dict):
    for index, favorite in enumerate(favorites):
        if favorite["id"] == favorite_id:
            favorites[index] = updated_favorite
            return {
                "message": "Favorite item updated successfully",
                "data": updated_favorite
            }

    raise HTTPException(
        status_code=404,
        detail="Favorite item not found"
    )


# Delete favorite item
@router.delete("/{favorite_id}")
def delete_favorite(favorite_id: int):
    for favorite in favorites:
        if favorite["id"] == favorite_id:
            favorites.remove(favorite)
            return {
                "message": "Favorite item removed successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Favorite item not found"
    )


print("Favorite router loaded successfully")