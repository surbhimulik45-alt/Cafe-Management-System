from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

cart = [
    {
        "id": 1,
        "user_id": 1,
        "menu_id": 1,
        "item_name": "Watermelon Mojito",
        "quantity": 2,
        "price": 149,
        "total_price": 298
    },
    {
        "id": 2,
        "user_id": 1,
        "menu_id": 6,
        "item_name": "Brownie Shake",
        "quantity": 1,
        "price": 229,
        "total_price": 229
    },
    {
        "id": 3,
        "user_id": 1,
        "menu_id": 12,
        "item_name": "Paneer Tikka Burger",
        "quantity": 2,
        "price": 219,
        "total_price": 438
    },
    {
        "id": 4,
        "user_id": 1,
        "menu_id": 15,
        "item_name": "Grilled Cheese Sandwich",
        "quantity": 1,
        "price": 179,
        "total_price": 179
    },
    {
        "id": 5,
        "user_id": 1,
        "menu_id": 19,
        "item_name": "Peri Peri Fries",
        "quantity": 2,
        "price": 149,
        "total_price": 298
    },
    {
        "id": 6,
        "user_id": 1,
        "menu_id": 21,
        "item_name": "White Sauce Pasta",
        "quantity": 1,
        "price": 249,
        "total_price": 249
    },
    {
        "id": 7,
        "user_id": 1,
        "menu_id": 27,
        "item_name": "Chocolate Croissant",
        "quantity": 3,
        "price": 159,
        "total_price": 477
    },
    {
        "id": 8,
        "user_id": 1,
        "menu_id": 28,
        "item_name": "Cappuccino",
        "quantity": 2,
        "price": 149,
        "total_price": 298
    }
]


# Get all cart items
@router.get("/")
def get_cart():
    return cart


# Get cart item by ID
@router.get("/{cart_id}")
def get_cart_item(cart_id: int):
    for item in cart:
        if item["id"] == cart_id:
            return item
    raise HTTPException(status_code=404, detail="Cart item not found")


# Add item to cart
@router.post("/")
def add_to_cart(item: dict):
    cart.append(item)
    return {
        "message": "Item added to cart successfully",
        "data": item
    }


# Update cart item
@router.put("/{cart_id}")
def update_cart_item(cart_id: int, updated_item: dict):
    for index, item in enumerate(cart):
        if item["id"] == cart_id:
            cart[index] = updated_item
            return {
                "message": "Cart updated successfully",
                "data": updated_item
            }

    raise HTTPException(status_code=404, detail="Cart item not found")


# Delete cart item
@router.delete("/{cart_id}")
def delete_cart_item(cart_id: int):
    for item in cart:
        if item["id"] == cart_id:
            cart.remove(item)
            return {
                "message": "Cart item deleted successfully"
            }

    raise HTTPException(status_code=404, detail="Cart item not found")


print("Cart router loaded successfully")