from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/tracking",
    tags=["Order Tracking"]
)

tracking = [
    {
        "id": 1,
        "order_id": 1,
        "user_id": 1,
        "order_status": "Order Received"
    },
    {
        "id": 2,
        "order_id": 2,
        "user_id": 2,
        "order_status": "Preparing"
    }
]


# Get All Tracking Details
@router.get("/")
def get_tracking():
    return tracking


# Get Tracking by ID
@router.get("/{tracking_id}")
def get_tracking_by_id(tracking_id: int):
    for track in tracking:
        if track["id"] == tracking_id:
            return track

    raise HTTPException(
        status_code=404,
        detail="Tracking record not found"
    )


# Create Tracking Record
@router.post("/")
def create_tracking(track: dict):
    tracking.append(track)
    return {
        "message": "Tracking record created successfully",
        "data": track
    }


# Update Order Status
@router.put("/{tracking_id}")
def update_tracking(tracking_id: int, updated_track: dict):
    for index, track in enumerate(tracking):
        if track["id"] == tracking_id:
            tracking[index] = updated_track
            return {
                "message": "Order status updated successfully",
                "data": updated_track
            }

    raise HTTPException(
        status_code=404,
        detail="Tracking record not found"
    )


# Delete Tracking Record
@router.delete("/{tracking_id}")
def delete_tracking(tracking_id: int):
    for track in tracking:
        if track["id"] == tracking_id:
            tracking.remove(track)
            return {
                "message": "Tracking record deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Tracking record not found"
    )


print("Tracking router loaded successfully")