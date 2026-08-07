from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"]
)

nutrition = [
    {
        "id": 1,
        "menu_id": 1,
        "item_name": "Watermelon Mojito",
        "calories": 120,
        "protein": 1,
        "carbohydrates": 30,
        "fat": 0
    },
    {
        "id": 2,
        "menu_id": 2,
        "item_name": "Green Apple Mojito",
        "calories": 125,
        "protein": 1,
        "carbohydrates": 31,
        "fat": 0
    },
    {
        "id": 3,
        "menu_id": 3,
        "item_name": "Cranberry Mojito",
        "calories": 130,
        "protein": 1,
        "carbohydrates": 32,
        "fat": 0
    },
    {
        "id": 4,
        "menu_id": 4,
        "item_name": "Blue Sky Mojito",
        "calories": 135,
        "protein": 1,
        "carbohydrates": 33,
        "fat": 0
    },
    {
        "id": 5,
        "menu_id": 5,
        "item_name": "Black Currant Shake",
        "calories": 320,
        "protein": 8,
        "carbohydrates": 45,
        "fat": 10
    },
    {
        "id": 6,
        "menu_id": 6,
        "item_name": "Brownie Shake",
        "calories": 420,
        "protein": 9,
        "carbohydrates": 55,
        "fat": 16
    },
    {
        "id": 7,
        "menu_id": 7,
        "item_name": "Oreo Shake",
        "calories": 390,
        "protein": 8,
        "carbohydrates": 50,
        "fat": 15
    },
    {
        "id": 8,
        "menu_id": 8,
        "item_name": "Strawberry Shake",
        "calories": 330,
        "protein": 7,
        "carbohydrates": 46,
        "fat": 11
    },
    {
        "id": 9,
        "menu_id": 9,
        "item_name": "Chocolate Shake",
        "calories": 410,
        "protein": 8,
        "carbohydrates": 54,
        "fat": 16
    },
    {
        "id": 10,
        "menu_id": 10,
        "item_name": "Veg Burger",
        "calories": 280,
        "protein": 12,
        "carbohydrates": 30,
        "fat": 12
    },
    {
        "id": 11,
        "menu_id": 11,
        "item_name": "Veg Cheese Burger",
        "calories": 330,
        "protein": 14,
        "carbohydrates": 32,
        "fat": 16
    },
    {
        "id": 12,
        "menu_id": 12,
        "item_name": "Paneer Tikka Burger",
        "calories": 360,
        "protein": 18,
        "carbohydrates": 33,
        "fat": 17
    },
    {
        "id": 13,
        "menu_id": 13,
        "item_name": "Korean Burger",
        "calories": 390,
        "protein": 19,
        "carbohydrates": 35,
        "fat": 18
    },
    {
        "id": 14,
        "menu_id": 14,
        "item_name": "Veg Plain Sandwich",
        "calories": 220,
        "protein": 8,
        "carbohydrates": 28,
        "fat": 6
    },
    {
        "id": 15,
        "menu_id": 15,
        "item_name": "Grilled Cheese Sandwich",
        "calories": 300,
        "protein": 11,
        "carbohydrates": 30,
        "fat": 12
    },
    {
        "id": 16,
        "menu_id": 16,
        "item_name": "Paneer Cheese Sandwich",
        "calories": 330,
        "protein": 16,
        "carbohydrates": 31,
        "fat": 14
    },
    {
        "id": 17,
        "menu_id": 17,
        "item_name": "Chilli Garlic Mayo Sandwich",
        "calories": 340,
        "protein": 10,
        "carbohydrates": 33,
        "fat": 15
    },
    {
        "id": 18,
        "menu_id": 18,
        "item_name": "Salted Fries",
        "calories": 250,
        "protein": 3,
        "carbohydrates": 35,
        "fat": 11
    },
    {
        "id": 19,
        "menu_id": 19,
        "item_name": "Peri Peri Fries",
        "calories": 290,
        "protein": 3,
        "carbohydrates": 38,
        "fat": 13
    },
    {
        "id": 20,
        "menu_id": 20,
        "item_name": "Cheese Fries",
        "calories": 350,
        "protein": 6,
        "carbohydrates": 40,
        "fat": 18
    },
    {
        "id": 21,
        "menu_id": 21,
        "item_name": "White Sauce Pasta",
        "calories": 420,
        "protein": 12,
        "carbohydrates": 50,
        "fat": 18
    },
    {
        "id": 22,
        "menu_id": 22,
        "item_name": "Red Sauce Pasta",
        "calories": 390,
        "protein": 10,
        "carbohydrates": 48,
        "fat": 15
    },
    {
        "id": 23,
        "menu_id": 23,
        "item_name": "Dutch Truffle Pastry",
        "calories": 310,
        "protein": 5,
        "carbohydrates": 36,
        "fat": 15
    },
    {
        "id": 24,
        "menu_id": 24,
        "item_name": "Brownie Pudding",
        "calories": 360,
        "protein": 6,
        "carbohydrates": 40,
        "fat": 18
    },
    {
        "id": 25,
        "menu_id": 25,
        "item_name": "Fruit Custard",
        "calories": 220,
        "protein": 4,
        "carbohydrates": 32,
        "fat": 7
    },
    {
        "id": 26,
        "menu_id": 26,
        "item_name": "Caramel Custard",
        "calories": 250,
        "protein": 5,
        "carbohydrates": 35,
        "fat": 9
    },
    {
        "id": 27,
        "menu_id": 27,
        "item_name": "Chocolate Croissant",
        "calories": 320,
        "protein": 6,
        "carbohydrates": 38,
        "fat": 16
    },
    {
        "id": 28,
        "menu_id": 28,
        "item_name": "Cappuccino",
        "calories": 120,
        "protein": 6,
        "carbohydrates": 10,
        "fat": 5
    },
    {
        "id": 29,
        "menu_id": 29,
        "item_name": "Espresso",
        "calories": 5,
        "protein": 0,
        "carbohydrates": 1,
        "fat": 0
    },
    {
        "id": 30,
        "menu_id": 30,
        "item_name": "Latte",
        "calories": 180,
        "protein": 8,
        "carbohydrates": 18,
        "fat": 8
    }
]


# Get all nutrition details
@router.get("/")
def get_nutrition():
    return nutrition


# Get nutrition by ID
@router.get("/{nutrition_id}")
def get_nutrition_by_id(nutrition_id: int):
    for item in nutrition:
        if item["id"] == nutrition_id:
            return item

    raise HTTPException(
        status_code=404,
        detail="Nutrition record not found"
    )


# Add nutrition record
@router.post("/")
def add_nutrition(item: dict):
    nutrition.append(item)
    return {
        "message": "Nutrition record added successfully",
        "data": item
    }


# Update nutrition record
@router.put("/{nutrition_id}")
def update_nutrition(nutrition_id: int, updated_item: dict):
    for index, item in enumerate(nutrition):
        if item["id"] == nutrition_id:
            nutrition[index] = updated_item
            return {
                "message": "Nutrition record updated successfully",
                "data": updated_item
            }

    raise HTTPException(
        status_code=404,
        detail="Nutrition record not found"
    )


# Delete nutrition record
@router.delete("/{nutrition_id}")
def delete_nutrition(nutrition_id: int):
    for item in nutrition:
        if item["id"] == nutrition_id:
            nutrition.remove(item)
            return {
                "message": "Nutrition record deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Nutrition record not found"
    )


print("Nutrition router loaded successfully")