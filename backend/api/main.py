from fastapi import FastAPI

app = FastAPI(title="ReMind API")


@app.get("/health")
def health():
    return {"status": "ok"}
