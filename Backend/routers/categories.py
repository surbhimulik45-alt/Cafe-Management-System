from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

categories = [
    {"id": 1, "name": "Mojitos"},
    {"id": 2, "name": "Shakes"},
    {"id": 3, "name": "Burgers"},
    {"id": 4, "name": "Sandwiches"},
    {"id": 5, "name": "Lite Bites"},
    {"id": 6, "name": "Pasta"},
    {"id": 7, "name": "Desserts"},
    {"id": 8, "name": "Coffee"}
]

# Get all categories
@router.get("/")
def get_categories():
    return categories


# Get category by ID
@router.get("/{category_id}")
def get_category(category_id: int):
    for category in categories:
        if category["id"] == category_id:
            return category
    raise HTTPException(status_code=404, detail="Category not found")


# Add a new category
@router.post("/")
def add_category(category: dict):
    categories.append(category)
    return {
        "message": "Category added successfully",
        "data": category
    }


# Update a category
@router.put("/{category_id}")
def update_category(category_id: int, updated_category: dict):
    for index, category in enumerate(categories):
        if category["id"] == category_id:
            categories[index] = updated_category
            return {
                "message": "Category updated successfully",
                "data": updated_category
            }
    raise HTTPException(status_code=404, detail="Category not found")


# Delete a category
@router.delete("/{category_id}")
def delete_category(category_id: int):
    for category in categories:
        if category["id"] == category_id:
            categories.remove(category)
            return {
                "message": "Category deleted successfully"
            }
    raise HTTPException(status_code=404, detail="Category not found")


print("Category router loaded successfully")