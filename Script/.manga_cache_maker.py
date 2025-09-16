import time, json, requests

with open("Data/library2.json", "r", encoding="utf-8") as f:
    data = json.load(f)

List = [manga["name"] for manga in data]
Results = {}

for title in List:

    print(f"Fetching: {title}")
    url = f"https://api.jikan.moe/v4/manga?q={title}&limit=3"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if data["data"]:

            manga = data["data"][0]
            time.sleep(1)

            Results[title.lower().replace(" ","_")] = manga
        else:
            print(f"No results for: {title}")
    except Exception as e:
        print(f"Error fetching {title}")

    time.sleep(1)


with open("Data/manga_cache.json", "w", encoding="utf-8") as f:
    json.dump(Results, f, ensure_ascii=False, indent=2)
