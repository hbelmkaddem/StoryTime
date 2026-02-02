from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import voices_router, story_router
from app.config import API_SECRET_KEY

app = FastAPI(
    title="StoryTime API",
    description="API for generating personalized children's stories with audio",
    version="1.0.0"
)

# CORS middleware - allow mobile app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Key middleware
@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    # Skip auth for health check and docs
    if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)

    # Skip auth for OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return await call_next(request)

    # Check API key
    api_key = request.headers.get("X-API-Key")
    if api_key != API_SECRET_KEY:
        return JSONResponse(
            status_code=401,
            content={"error": "Invalid or missing API key"}
        )

    return await call_next(request)


# Include routers
app.include_router(voices_router, prefix="/api")
app.include_router(story_router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "storytime-api"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to StoryTime API",
        "docs": "/docs",
        "health": "/health"
    }
