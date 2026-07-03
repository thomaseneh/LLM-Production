from prod.backend.app.core.llm import call_llm
from prod.backend.app.core.config import MODELS

system = open("prompts/router.txt").read()

while True:

    prompt = input("> ")

    response = call_llm(

        MODELS["router"],

        [

            {

                "role":"system",

                "content":system

            },

            {

                "role":"user",

                "content":prompt

            }

        ]

    )

    print(response)