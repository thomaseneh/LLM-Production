from backend.app.core.router import route
from backend.app.core.handler import handle

print("ROUTER:", route("2+2"))
print("HANDLER:", handle("2+2"))