from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

reviews = [
    {
        "id": 1,
        "user_id": 1,
        "menu_id": 1,
        "item_name": "Watermelon Mojito",
        "rating": 5,
        "review": "Very refreshing and perfect for summer!"
    },
    {
        "id": 2,
        "user_id": 2,
        "menu_id": 6,
        "item_name": "Brownie Shake",
        "rating": 5,
        "review": "Rich chocolate flavor. Absolutely loved it."
    },
    {
        "id": 3,
        "user_id": 3,
        "menu_id": 12,
        "item_name": "Paneer Tikka Burger",
        "rating": 4,
        "review": "Crispy, cheesy, and full of flavor."
    },
    {
        "id": 4,
        "user_id": 4,
        "menu_id": 15,
        "item_name": "Grilled Cheese Sandwich",
        "rating": 5,
        "review": "Perfectly grilled and delicious."
    },
    {
        "id": 5,
        "user_id": 5,
        "menu_id": 19,
        "item_name": "Peri Peri Fries",
        "rating": 5,
        "review": "Spicy and crispy. A must-try!"
    },
    {
        "id": 6,
        "user_id": 6,
        "menu_id": 21,
        "item_name": "White Sauce Pasta",
        "rating": 4,
        "review": "Creamy and tasty with fresh vegetables."
    },
    {
        "id": 7,
        "user_id": 7,
        "menu_id": 27,
        "item_name": "Chocolate Croissant",
        "rating": 5,
        "review": "Freshly baked with delicious chocolate filling."
    }
]


# Get all reviews
@router.get("/")
def get_reviews():
    return reviews


# Get review by ID
@router.get("/{review_id}")
def get_review(review_id: int):
    for review in reviews:
        if review["id"] == review_id:
            return review

    raise HTTPException(
        status_code=404,
        detail="Review not found"
    )


# Add review
@router.post("/")
def create_review(review: dict):
    reviews.append(review)
    return {
        "message": "Review added successfully",
        "data": review
    }


# Update review
@router.put("/{review_id}")
def update_review(review_id: int, updated_review: dict):
    for index, review in enumerate(reviews):
        if review["id"] == review_id:
            reviews[index] = updated_review
            return {
                "message": "Review updated successfully",
                "data": updated_review
            }

    raise HTTPException(
        status_code=404,
        detail="Review not found"
    )


# Delete review
@router.delete("/{review_id}")
def delete_review(review_id: int):
    for review in reviews:
        if review["id"] == review_id:
            reviews.remove(review)
            return {
                "message": "Review deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Review not found")


print("Review router loaded successfully")