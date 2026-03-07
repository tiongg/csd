import os
import time
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("GPT_API_KEY"))

def generate_video_reel(content):

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "reels")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    prompt = f"""
    Create a highly engaging, cinematic video reel.
    
    Requirements:
    - Fast-paced and dynamic visuals fitting the topic.
    - Photorealistic or high-quality 3D render style.
    
    Subject Matter Context:
    {content}
    """

    print("Submitting video request to Sora... This may take a few minutes.")
    
    try:
        video = client.videos.create(
            model="sora-2", 
            prompt=prompt,
            seconds="8",
            size="1280x720"
        )
        
        video_id = video.id
        print(f"Job created successfully! Video ID: {video_id}")
        print("Polling for completion...")

        while True:
            job = client.videos.retrieve(video_id)
            status = job.status
            progress = getattr(job, 'progress', 0)
            
            print(f"Status: {status} ({progress}%)")
            
            if status == "completed":
                print("Generation complete!")
                break
            elif status == "failed":
                error_msg = getattr(job.error, 'message', 'Unknown error')
                raise RuntimeError(f"Failed to generate the video: {error_msg}")
                
            time.sleep(10)

        print("\nDownloading the video file...")
        response = client.videos.download_content(video_id=video_id)
        video_bytes = response.read()
        
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        output_filename = os.path.join(output_dir, f"reels_{timestamp}.mp4")
        
        with open(output_filename, "wb") as f:
            f.write(video_bytes)
            
        print("\n---- GENERATED VIDEO REEL ----")
        print(f"Video successfully saved in: {output_filename}")
        print("------------------------------")

    except Exception as e:
        print(f"\nAn error occurred during video generation: {e}")

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

    generate_video_reel(sample_content)