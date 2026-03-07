import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("GPT_API_KEY"))

MAX_WORDS = 60

def word_count(text):
    return len(text.split())

def generate_description(content):

    prompt = f"""
    The following text contains course material.

    Create a concise informational summary describing what the course teaches.

    Requirements:
    - Maximum {MAX_WORDS} words
    - Neutral informational tone
    - No headings
    - No bullet points

    Course Content:
    {content}
    """

    response = client.responses.create(
        model="gpt-4.1",
        input=prompt
    )

    description = response.output_text.strip()
    count = word_count(description)

    print("\n---- GENERATED COURSE DESCRIPTION ----")
    print(description)
    print(f"\nWord count: {count}")
    print(f"Within limit: {count <= MAX_WORDS}")
    print("--------------------------------------")


if __name__ == "__main__":

    sample_content = """
    Skibidi Toilet is a series of short, bizarre action videos on YouTube where human heads come out of toilets and try to take over the world. 
    It started as a one-off, weird joke using assets from a video game, featuring a head singing a catchy, distorted song while popping out of a porcelain bowl. 
    Because it was so strange and visually jarring, it exploded into a massive viral meme.
    As it went on, it turned into a giant war between these toilet creatures and a group of "good guys" who have cameras or speakers for heads. 
    There are no words, just constant, fast-paced fights that keep getting bigger and more intense. 
    It's essentially a DIY, digital blockbuster that kids and teens follow like a high-stakes TV show. 
    People call it "brain rot" because of how nonsensical it looks, but it has become a massive cultural phenomenon because it's basically an endless, evolving video game movie that anyone can watch on their phone.
    """

    generate_description(sample_content)