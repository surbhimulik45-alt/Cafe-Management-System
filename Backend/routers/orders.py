from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

orders = [
    {
        "id": 1,
        "customer_name": "Srusti",
        "items": [
            "Watermelon Mojito",
            "Paneer Tikka Burger",
            "Peri Peri Fries"
        ],
        "total_price": 517,
        "status": "Pending"
    },
    {
        "id": 2,
        "customer_name": "Pranjal",
        "items": [
            "Brownie Shake",
            "White Sauce Pasta",
            "Chocolate Croissant"
        ],
        "total_price": 637,
        "status": "Completed"
    },
    {
        "id": 3,
        "customer_name": "Surbhi",
        "items": [
            "Green Apple Mojito",
            "Grilled Cheese Sandwich"
        ],
        "total_price": 328,
        "status": "Preparing"
    },
    {
        "id": 4,
        "customer_name": "Daksh",
        "items": [
            "Oreo Shake",
            "Cheese Fries",
            "Dutch Truffle Pastry"
        ],
        "total_price": 718,
        "status": "Delivered"
    }
]

import datetime

# Get all orders
@router.get("/")
def get_orders():
    return orders

# Get order by ID
@router.get("/{order_id}")
def get_order(order_id: int):
    for order in orders:
        if order["id"] == order_id:
            return order
    raise HTTPException(status_code=404, detail="Order not found")

# Create a new order
@router.post("/")
def create_order(order: dict):
    now_str = datetime.datetime.now().isoformat()
    if "created_at" not in order:
        order["created_at"] = now_str
    if "estimated_prep_time" not in order:
        order["estimated_prep_time"] = 25
    if "history" not in order:
        order["history"] = [
            {"status": order.get("status", "Pending"), "time": now_str}
        ]
    orders.append(order)
    return {
        "message": "Order placed successfully",
        "data": order
    }

# Update an order
@router.put("/{order_id}")
def update_order(order_id: int, updated_order: dict):
    for index, order in enumerate(orders):
        if order["id"] == order_id:
            # If status changed, record it in history logs
            new_status = updated_order.get("status")
            old_status = order.get("status")
            
            # Preserve existing properties if not in update payload
            if "created_at" not in updated_order:
                updated_order["created_at"] = order.get("created_at", datetime.datetime.now().isoformat())
            if "estimated_prep_time" not in updated_order:
                updated_order["estimated_prep_time"] = order.get("estimated_prep_time", 25)
            
            history = order.get("history", [])
            if new_status and new_status != old_status:
                history.append({
                    "status": new_status,
                    "time": datetime.datetime.now().isoformat()
                })
            updated_order["history"] = history
            
            orders[index] = updated_order
            return {
                "message": "Order updated successfully",
                "data": updated_order
            }
    raise HTTPException(status_code=404, detail="Order not found")

# Add item to active order (for Spin the Wheel free rewards)
@router.post("/{order_id}/add-item")
def add_order_item(order_id: int, payload: dict):
    item_name = payload.get("item_name")
    if not item_name:
        raise HTTPException(status_code=400, detail="Item name is required")
    for order in orders:
        if order["id"] == order_id:
            if "items" not in order:
                order["items"] = []
            order["items"].append(item_name)
            return {
                "message": f"Successfully added {item_name} to Order #{order_id}",
                "data": order
            }
    raise HTTPException(status_code=404, detail="Order not found")

# Delete an order
@router.delete("/{order_id}")
def delete_order(order_id: int):
    for order in orders:
        if order["id"] == order_id:
            orders.remove(order)
            return {"message": "Order deleted successfully"}
    raise HTTPException(status_code=404, detail="Order not found")
print("Orders router loaded successfully")