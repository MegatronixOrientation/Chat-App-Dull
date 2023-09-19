import json
import random
import openai

api_key = "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"

openai.api_key = api_key

def chatgpt(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=4000,
        n=1,
        stop=None,
        temperature=0.7,
    )
    return (response.choices[0].text.strip())

def generate():
    with open('data.json', 'r', encoding='utf-8') as jsonfile:
        data = jsonfile.read()
        data = json.loads(data)
        with open('message.txt') as messagefile:
            message = messagefile.read()
        print(message)
        if message.capitalize() in data:
            return (random.choice(data[message.capitalize()]))
        else:
            return (chatgpt(message))

with open('reply.txt','w') as responsefile:
    print(generate(), file=responsefile)
