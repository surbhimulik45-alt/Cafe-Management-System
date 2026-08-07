from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/menu",
    tags=["Menu"]
)

menu = [
    {
        "id": 1,
        "name": "Watermelon Mojito",
        "price": 149,
        "image": "images/watermelon_mojito.jpg",
        "category": "Mojitos",
        "rating": "★★★★★",
        "nutrition": "120 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 2,
        "name": "Green Apple Mojito",
        "price": 149,
        "image": "images/green_apple_mojito.jpeg",
        "category": "Mojitos",
        "rating": "★★★★★",
        "nutrition": "125 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 3,
        "name": "Cranberry Mojito",
        "price": 159,
        "image": "images/cranberry_mojito.jpg",
        "category": "Mojitos",
        "rating": "★★★★★",
        "nutrition": "130 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 4,
        "name": "Blue Sky Mojito",
        "price": 169,
        "image": "images/blue_sky_mojito.jpg",
        "category": "Mojitos",
        "rating": "★★★★★",
        "nutrition": "135 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 5,
        "name": "Black Currant Shake",
        "price": 199,
        "image": "images/black_currant_shake.jpg",
        "category": "Shakes",
        "rating": "★★★★★",
        "nutrition": "320 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 6,
        "name": "Brownie Shake",
        "price": 229,
        "image": "images/brownie_shake.jpg",
        "category": "Shakes",
        "rating": "★★★★★",
        "nutrition": "420 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 7,
        "name": "Oreo Shake",
        "price": 209,
        "image": "images/oreo_shake.jpg",
        "category": "Shakes",
        "rating": "★★★★★",
        "nutrition": "390 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 8,
        "name": "Strawberry Shake",
        "price": 199,
        "image": "images/strawberry_shake.jpg",
        "category": "Shakes",
        "rating": "★★★★★",
        "nutrition": "330 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 9,
        "name": "Chocolate Shake",
        "price": 219,
        "image": "images/chocolate_shake.jpg",
        "category": "Shakes",
        "rating": "★★★★★",
        "nutrition": "410 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 10,
        "name": "Veg Burger",
        "price": 179,
        "image": "images/veg_burger.jpg",
        "category": "Burgers",
        "rating": "★★★★★",
        "nutrition": "280 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 11,
        "name": "Veg Cheese Burger",
        "price": 199,
        "image": "images/veg_cheese_burger.jpg",
        "category": "Burgers",
        "rating": "★★★★★",
        "nutrition": "330 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 12,
        "name": "Paneer Tikka Burger",
        "price": 219,
        "image": "images/paneer_tikka_burger.jpeg",
        "category": "Burgers",
        "rating": "★★★★★",
        "nutrition": "360 Cal",
        "preference": "Veg",
        "spice_level": "Medium"
    },
    {
        "id": 13,
        "name": "Chicken Korean Burger",
        "price": 249,
        "image": "images/korean_burger.jpg",
        "category": "Burgers",
        "rating": "★★★★★",
        "nutrition": "390 Cal",
        "preference": "Non-Veg",
        "spice_level": "Spicy"
    },
    {
        "id": 14,
        "name": "Veg Plain Sandwich",
        "price": 149,
        "image": "images/veg_plain_sandwich.jpg",
        "category": "Sandwich",
        "rating": "★★★★★",
        "nutrition": "220 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 15,
        "name": "Grilled Cheese Sandwich",
        "price": 179,
        "image": "images/grilled_cheese_sandwich.jpg",
        "category": "Sandwich",
        "rating": "★★★★★",
        "nutrition": "300 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 16,
        "name": "Paneer Cheese Sandwich",
        "price": 199,
        "image": "images/paneer_cheese_sandwich.jpg",
        "category": "Sandwich",
        "rating": "★★★★★",
        "nutrition": "330 Cal",
        "preference": "Veg",
        "spice_level": "Medium"
    },
    {
        "id": 17,
        "name": "Chilli Garlic Mayo Sandwich",
        "price": 199,
        "image": "images/chilli_garlic_mayo_sandwich.jpg",
        "category": "Sandwich",
        "rating": "★★★★★",
        "nutrition": "340 Cal",
        "preference": "Veg",
        "spice_level": "Spicy"
    },
    {
        "id": 18,
        "name": "Salted Fries",
        "price": 119,
        "image": "images/salted_fries.jpg",
        "category": "Lite Bites",
        "rating": "★★★★★",
        "nutrition": "250 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 19,
        "name": "Peri Peri Fries",
        "price": 149,
        "image": "images/peri_peri_fries.jpg",
        "category": "Lite Bites",
        "rating": "★★★★★",
        "nutrition": "290 Cal",
        "preference": "Veg",
        "spice_level": "Spicy"
    },
    {
        "id": 20,
        "name": "Cheese Fries",
        "price": 179,
        "image": "images/cheese_fries.jpg",
        "category": "Lite Bites",
        "rating": "★★★★★",
        "nutrition": "350 Cal",
        "preference": "Veg",
        "spice_level": "Medium"
    },
    {
        "id": 21,
        "name": "White Sauce Pasta",
        "price": 249,
        "image": "images/white_sauce_pasta.jpg",
        "category": "Pasta",
        "rating": "★★★★★",
        "nutrition": "420 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 22,
        "name": "Chicken Red Sauce Pasta",
        "price": 239,
        "image": "images/pasta.jpg",
        "category": "Pasta",
        "rating": "★★★★★",
        "nutrition": "390 Cal",
        "preference": "Non-Veg",
        "spice_level": "Spicy"
    },
    {
        "id": 23,
        "name": "Dutch Truffle Pastry",
        "price": 149,
        "image": "images/dutch_truffle_pastry.jpg",
        "category": "Desserts",
        "rating": "★★★★★",
        "nutrition": "310 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 24,
        "name": "Brownie Pudding",
        "price": 169,
        "image": "images/brownie_pudding.jpg",
        "category": "Desserts",
        "rating": "★★★★★",
        "nutrition": "360 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 25,
        "name": "Fruit Custard",
        "price": 129,
        "image": "images/fruit_custard.jpg",
        "category": "Desserts",
        "rating": "★★★★★",
        "nutrition": "220 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 26,
        "name": "Caramel Custard",
        "price": 149,
        "image": "images/caramel_custard.jpg",
        "category": "Desserts",
        "rating": "★★★★★",
        "nutrition": "250 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 27,
        "name": "Chocolate Croissant",
        "price": 159,
        "image": "images/chocolate_croissant.jpg",
        "category": "Desserts",
        "rating": "★★★★★",
        "nutrition": "320 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 28,
        "name": "Cappuccino",
        "price": 149,
        "image": "images/cappuccino.jpg",
        "category": "Coffee",
        "rating": "★★★★★",
        "nutrition": "90 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 29,
        "name": "Espresso",
        "price": 129,
        "image": "images/espresso.jpg",
        "category": "Coffee",
        "rating": "★★★★★",
        "nutrition": "15 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    },
    {
        "id": 30,
        "name": "Latte",
        "price": 159,
        "image": "images/latte.jpg",
        "category": "Coffee",
        "rating": "★★★★★",
        "nutrition": "120 Cal",
        "preference": "Veg",
        "spice_level": "Mild"
    }
]

# Get all menu items
@router.get("/")
def get_menu():
    return menu

# Get one menu item
@router.get("/{item_id}")
def get_menu_item(item_id: int):
    for item in menu:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

# Add menu item
@router.post("/")
def add_menu_item(item: dict):
    menu.append(item)
    return {"message": "Menu item added successfully", "data": item}

# Update menu item
@router.put("/{item_id}")
def update_menu_item(item_id: int, updated_item: dict):
    for index, item in enumerate(menu):
        if item["id"] == item_id:
            menu[index] = updated_item
            return {
                "message": "Menu item updated successfully",
                "data": updated_item
            }
    raise HTTPException(status_code=404, detail="Item not found")

# Delete menu item
@router.delete("/{item_id}")
def delete_menu_item(item_id: int):
    for item in menu:
        if item["id"] == item_id:
            menu.remove(item)
            return {"message": "Menu item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found")

print("Menu router loaded successfully")