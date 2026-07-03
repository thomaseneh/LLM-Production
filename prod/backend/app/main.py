from backend.app.core.handler import handle


print("CartMir AI Assistant\n")

while True:

    prompt = input("You: ")

    if prompt.lower() == "exit":

        break

    response = handle(prompt)

    print("\nAssistant:\n")

    print(response)