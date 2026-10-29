from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 创建后端应用
app = FastAPI(title="ReMind API")

# 允许前端（5173 端口）调用后端（8000 端口）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# 有人访问 /health 时，执行下面这个函数
@app.get("/health")
def health():
    return {"status": "ok"}