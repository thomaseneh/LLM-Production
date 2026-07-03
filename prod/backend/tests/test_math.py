from prod.backend.app.core.router import route
from prod.backend.app.core.handler import handle

print("ROUTER:", route("2+2"))
print("HANDLER:", handle("2+2"))