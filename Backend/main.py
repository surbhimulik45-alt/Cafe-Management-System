from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import Base, engine
from routers import (
    menu,
    orders,
    users,
    categories,
    cart,
    booking,
    payment,
    tracking,
    reviews,
    nutrition,
    offers,
    auth,
    admin,
    tables,
    dashboard,
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="Cafe Ordering System API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(booking.router)
app.include_router(payment.router)
app.include_router(tracking.router)
app.include_router(reviews.router)
app.include_router(nutrition.router)
app.include_router(offers.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tables.router)
app.include_router(dashboard.router)

# Serve static files
app.mount("/css", StaticFiles(directory="../Frontend/css"), name="css")
app.mount("/js", StaticFiles(directory="../Frontend/js"), name="js")
app.mount("/images", StaticFiles(directory="../Frontend/images"), name="images")

# ── HTML filename routes (so navbar links like menu.html, cart.html all work) ──

@app.get("/", include_in_schema=False)
@app.get("/index.html", include_in_schema=False)
def home():
    return FileResponse("../Frontend/index.html")

@app.get("/menu.html", include_in_schema=False)
@app.get("/menu-page", include_in_schema=False)
def menu_page():
    return FileResponse("../Frontend/menu.html")

@app.get("/login.html", include_in_schema=False)
@app.get("/login-page", include_in_schema=False)
def login_page():
    return FileResponse("../Frontend/login.html")

@app.get("/register.html", include_in_schema=False)
@app.get("/register-page", include_in_schema=False)
def register_page():
    return FileResponse("../Frontend/register.html")

@app.get("/cart.html", include_in_schema=False)
@app.get("/cart-page", include_in_schema=False)
def cart_page():
    return FileResponse("../Frontend/cart.html")

@app.get("/booking.html", include_in_schema=False)
@app.get("/booking-page", include_in_schema=False)
def booking_page():
    return FileResponse("../Frontend/booking.html")

@app.get("/payment.html", include_in_schema=False)
@app.get("/payment-page", include_in_schema=False)
def payment_page():
    return FileResponse("../Frontend/payment.html")

@app.get("/tracking.html", include_in_schema=False)
@app.get("/tracking-page", include_in_schema=False)
def tracking_page():
    return FileResponse("../Frontend/tracking.html")

@app.get("/reviews.html", include_in_schema=False)
@app.get("/reviews-page", include_in_schema=False)
def reviews_page():
    return FileResponse("../Frontend/reviews.html")

@app.get("/offers.html", include_in_schema=False)
@app.get("/offers-page", include_in_schema=False)
def offers_page():
    return FileResponse("../Frontend/offers.html")

@app.get("/history.html", include_in_schema=False)
@app.get("/history-page", include_in_schema=False)
def history_page():
    return FileResponse("../Frontend/history.html")

@app.get("/favorites.html", include_in_schema=False)
@app.get("/favorites-page", include_in_schema=False)
def favorites_page():
    return FileResponse("../Frontend/favorites.html")

@app.get("/admin.html", include_in_schema=False)
@app.get("/admin-page", include_in_schema=False)
def admin_page():
    return FileResponse("../Frontend/admin.html")


@app.get("/nutrition.html", include_in_schema=False)
@app.get("/nutrition-page", include_in_schema=False)
def nutrition_page():
    return FileResponse("../Frontend/nutrition.html")

@app.get("/invoice.html", include_in_schema=False)
@app.get("/invoice-page", include_in_schema=False)
def invoice_page():
    return FileResponse("../Frontend/invoice.html")

@app.get("/surprise.html", include_in_schema=False)
@app.get("/surprise-page", include_in_schema=False)
def surprise_page():
    return FileResponse("../Frontend/surprise.html")

@app.get("/customer_dashboard.html", include_in_schema=False)
@app.get("/dashboard-page", include_in_schema=False)
def customer_dashboard_page():
    return FileResponse("../Frontend/customer_dashboard.html")
