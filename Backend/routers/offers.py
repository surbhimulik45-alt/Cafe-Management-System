from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/offers",
    tags=["Offers"]
)

offers = [
    {
        "id": 1,
        "item_name": "Watermelon Mojito",
        "description": "Buy 1 Get 1 Free",
        "original_price": 149,
        "discount_percentage": 50,
        "offer_price": 74.5,
        "offer_status": "Active"
    },
    {
        "id": 2,
        "item_name": "Brownie Shake",
        "description": "20% OFF",
        "original_price": 229,
        "discount_percentage": 20,
        "offer_price": 183.2,
        "offer_status": "Active"
    },
    {
        "id": 3,
        "item_name": "Paneer Tikka Burger",
        "description": "15% OFF",
        "original_price": 219,
        "discount_percentage": 15,
        "offer_price": 186.15,
        "offer_status": "Active"
    },
    {
        "id": 4,
        "item_name": "Grilled Cheese Sandwich",
        "description": "10% OFF",
        "original_price": 179,
        "discount_percentage": 10,
        "offer_price": 161.1,
        "offer_status": "Active"
    },
    {
        "id": 5,
        "item_name": "Peri Peri Fries",
        "description": "25% OFF",
        "original_price": 149,
        "discount_percentage": 25,
        "offer_price": 111.75,
        "offer_status": "Active"
    },
    {
        "id": 6,
        "item_name": "White Sauce Pasta",
        "description": "30% OFF",
        "original_price": 249,
        "discount_percentage": 30,
        "offer_price": 174.3,
        "offer_status": "Active"
    },
    {
        "id": 7,
        "item_name": "Dutch Truffle Pastry",
        "description": "15% OFF",
        "original_price": 169,
        "discount_percentage": 15,
        "offer_price": 143.65,
        "offer_status": "Active"
    },
    {
        "id": 8,
        "item_name": "Chocolate Croissant",
        "description": "Buy 2 Get 1 Free",
        "original_price": 159,
        "discount_percentage": 33,
        "offer_price": 106.53,
        "offer_status": "Active"
    },
    {
        "id": 9,
        "item_name": "Cappuccino",
        "description": "20% OFF",
        "original_price": 149,
        "discount_percentage": 20,
        "offer_price": 119.2,
        "offer_status": "Active"
    },
    {
        "id": 10,
        "item_name": "Latte",
        "description": "10% OFF",
        "original_price": 169,
        "discount_percentage": 10,
        "offer_price": 152.1,
        "offer_status": "Active"
    }
]


# Get all offers
@router.get("/")
def get_offers():
    return offers


# Get offer by ID
@router.get("/{offer_id}")
def get_offer(offer_id: int):
    for offer in offers:
        if offer["id"] == offer_id:
            return offer

    raise HTTPException(
        status_code=404,
        detail="Offer not found"
    )


# Add offer
@router.post("/")
def create_offer(offer: dict):
    offers.append(offer)
    return {
        "message": "Offer added successfully",
        "data": offer
    }


# Update offer
@router.put("/{offer_id}")
def update_offer(offer_id: int, updated_offer: dict):
    for index, offer in enumerate(offers):
        if offer["id"] == offer_id:
            offers[index] = updated_offer
            return {
                "message": "Offer updated successfully",
                "data": updated_offer
            }

    raise HTTPException(
        status_code=404,
        detail="Offer not found"
    )


# Delete offer
@router.delete("/{offer_id}")
def delete_offer(offer_id: int):
    for offer in offers:
        if offer["id"] == offer_id:
            offers.remove(offer)
            return {
                "message": "Offer deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Offer not found"
    )


print("Offer router loaded successfully")