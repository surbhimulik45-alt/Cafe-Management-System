from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/tables",
    tags=["Table Seating"]
)

# Standard layout configuration for 8 tables
tables = [
    {
        "id": 1,
        "name": "Table 1 (2-Seater)",
        "seats": 2,
        "location": "Main Hall",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 2,
        "name": "Table 2 (2-Seater)",
        "seats": 2,
        "location": "Window Side",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 3,
        "name": "Table 3 (4-Seater)",
        "seats": 4,
        "location": "Main Hall",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 4,
        "name": "Table 4 (4-Seater)",
        "seats": 4,
        "location": "Window Side",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 5,
        "name": "Table 5 (Lounge)",
        "seats": 6,
        "location": "VIP Lounge",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 6,
        "name": "Table 6 (Lounge)",
        "seats": 6,
        "location": "VIP Lounge",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 7,
        "name": "Table 7 (Garden)",
        "seats": 4,
        "location": "Garden Patio",
        "status": "Available",
        "current_booking_id": None
    },
    {
        "id": 8,
        "name": "Table 8 (Garden)",
        "seats": 4,
        "location": "Garden Patio",
        "status": "Available",
        "current_booking_id": None
    }
]

# Get all tables
@router.get("/")
def get_tables():
    return tables

# Block a table for maintenance or private events
@router.post("/{table_id}/block")
def block_table(table_id: int, payload: dict = None):
    reason = payload.get("reason", "Maintenance") if payload else "Maintenance"
    for table in tables:
        if table["id"] == table_id:
            table["status"] = "Blocked"
            table["location_note"] = reason
            return {"message": f"Table #{table_id} blocked for {reason}", "table": table}
    raise HTTPException(status_code=404, detail="Table not found")

# Unblock a table
@router.post("/{table_id}/unblock")
def unblock_table(table_id: int):
    for table in tables:
        if table["id"] == table_id:
            table["status"] = "Available"
            if "location_note" in table:
                del table["location_note"]
            return {"message": f"Table #{table_id} is now available", "table": table}
    raise HTTPException(status_code=404, detail="Table not found")

# Check in customer to table (Occupied)
@router.post("/{table_id}/checkin")
def checkin_table(table_id: int, payload: dict):
    booking_id = payload.get("booking_id")
    for table in tables:
        if table["id"] == table_id:
            table["status"] = "Occupied"
            table["current_booking_id"] = booking_id
            return {"message": f"Checked in booking #{booking_id} to Table #{table_id}", "table": table}
    raise HTTPException(status_code=404, detail="Table not found")

# Check out or clear table status
@router.post("/{table_id}/checkout")
def checkout_table(table_id: int):
    for table in tables:
        if table["id"] == table_id:
            table["status"] = "Available"
            table["current_booking_id"] = None
            return {"message": f"Checked out from Table #{table_id}", "table": table}
    raise HTTPException(status_code=404, detail="Table not found")

print("Tables router loaded successfully")
