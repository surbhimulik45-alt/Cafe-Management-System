from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/booking",
    tags=["Booking"]
)

from .tables import tables as tables_list

bookings = [
    {
        "id": 1,
        "user_id": 1,
        "customer_name": "Surbhi",
        "phone_number": "9876543210",
        "table_id": 3,
        "table_type": "Table for 4",
        "number_of_people": 2,
        "booking_date": "2026-08-10",
        "booking_time": "07:30 PM",
        "status": "Approved"
    }
]

# Sync initial state for default booking
for t in tables_list:
    if t["id"] == 3:
        t["status"] = "Reserved"
        t["current_booking_id"] = 1

# Get All Bookings
@router.get("/")
def get_bookings():
    return bookings


# Add Booking
@router.post("/")
def add_booking(booking: dict):
    # Set default status if not provided
    if "status" not in booking:
        booking["status"] = "Pending Approval"
    
    table_id = booking.get("table_id")
    if table_id:
        # Check if table is available
        table_found = False
        for t in tables_list:
            if t["id"] == table_id:
                table_found = True
                if t["status"] != "Available":
                    raise HTTPException(status_code=400, detail="Selected table is not available")
                t["status"] = "Reserved"
                t["current_booking_id"] = booking["id"]
                break
        if not table_found:
            raise HTTPException(status_code=404, detail="Selected table does not exist")
            
    bookings.append(booking)
    return {
        "message": "Table reservation requested successfully",
        "data": booking
    }


# Get Booking by ID
@router.get("/{booking_id}")
def get_booking(booking_id: int):
    for booking in bookings:
        if booking["id"] == booking_id:
            return booking
    raise HTTPException(status_code=404, detail="Booking not found")


# Update Booking (used by Admin to approve/cancel or Customer to check in)
@router.put("/{booking_id}")
def update_booking(booking_id: int, updated_booking: dict):
    for index, booking in enumerate(bookings):
        if booking["id"] == booking_id:
            old_status = booking.get("status")
            new_status = updated_booking.get("status")
            table_id = updated_booking.get("table_id") or booking.get("table_id")
            
            # Sync table status based on reservation state transition
            if table_id and new_status != old_status:
                for t in tables_list:
                    if t["id"] == table_id:
                        if new_status == "Approved":
                            t["status"] = "Reserved"
                            t["current_booking_id"] = booking_id
                        elif new_status == "Checked In":
                            t["status"] = "Occupied"
                            t["current_booking_id"] = booking_id
                        elif new_status in ["Cancelled", "Completed", "Rejected"]:
                            t["status"] = "Available"
                            t["current_booking_id"] = None
                        break

            bookings[index] = updated_booking
            return {
                "message": "Booking updated successfully",
                "data": updated_booking
            }

    raise HTTPException(status_code=404, detail="Booking not found")


# Delete Booking
@router.delete("/{booking_id}")
def delete_booking(booking_id: int):
    for booking in bookings:
        if booking["id"] == booking_id:
            table_id = booking.get("table_id")
            if table_id:
                # Free the table
                for t in tables_list:
                    if t["id"] == table_id:
                        t["status"] = "Available"
                        t["current_booking_id"] = None
                        break
            bookings.remove(booking)
            return {
                "message": "Booking deleted successfully"
            }

    raise HTTPException(status_code=404, detail="Booking not found")


print("Booking router loaded successfully")