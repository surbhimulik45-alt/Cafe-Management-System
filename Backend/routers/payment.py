from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/payment",
    tags=["Payment"]
)

payments = [
    {
        "id": 1,
        "user_id": 1,
        "order_id": 1,
        "amount": 598.00,
        "payment_method": "UPI",
        "payment_status": "Paid",
        "transaction_id": "TXN100001",
        "qr_code": "upi://pay?pa=cafe@upi&pn=Cafe&am=598"
    }
]


# Get All Payments
@router.get("/")
def get_payments():
    return payments


# Get Payment by ID
@router.get("/{payment_id}")
def get_payment(payment_id: int):
    for payment in payments:
        if payment["id"] == payment_id:
            return payment

    raise HTTPException(
        status_code=404,
        detail="Payment not found"
    )


# Make Payment
@router.post("/")
def create_payment(payment: dict):
    payments.append(payment)
    return {
        "message": "Payment completed successfully",
        "data": payment
    }


# Update Payment
@router.put("/{payment_id}")
def update_payment(payment_id: int, updated_payment: dict):
    for index, payment in enumerate(payments):
        if payment["id"] == payment_id:
            payments[index] = updated_payment
            return {
                "message": "Payment updated successfully",
                "data": updated_payment
            }

    raise HTTPException(
        status_code=404,
        detail="Payment not found"
    )


# Delete Payment
@router.delete("/{payment_id}")
def delete_payment(payment_id: int):
    for payment in payments:
        if payment["id"] == payment_id:
            payments.remove(payment)
            return {
                "message": "Payment deleted successfully"
            }

    raise HTTPException(
        status_code=404,
        detail="Payment not found"
    )


print("Payment router loaded successfully")