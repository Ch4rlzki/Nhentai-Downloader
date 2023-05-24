from bs4 import BeautifulSoup
import requests, json, os

def main():
    try:
        download_path = ""

        with open("./config/download_path.txt", "r", encoding="utf-8") as file:
            download_path = file.read()

        url = ""

        with open("./config/url.txt", "r", encoding="utf-8") as file:
            url = file.read()

        nhentai_id = url.split("/")[4]

        if os.path.exists(os.path.join(download_path, nhentai_id)) == False:
            os.mkdir(os.path.join(download_path, nhentai_id))
        else:
            for i in os.listdir(os.path.join(download_path, nhentai_id)):
                os.remove(os.path.join(download_path, nhentai_id, i))

        cookies = {}
        headers = {}

        with open("./config/cookies.json", "r", encoding="utf-8") as file:
            jsons = json.loads(file.read())

            cookies = {
                "csrftoken": jsons["csrftoken"],
                "cf_clearance": jsons["cf_clearance"]
            }

        with open("./config/headers.json", "r", encoding="utf-8") as file:
            jsons = json.loads(file.read())

            headers = {
                "user-agent": jsons["user-agent"],
            }

        with open("./config/isDownloading.txt", "w", encoding="utf-8") as file:
            file.write("true")

        response = requests.get(url, cookies=cookies, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        for i in soup.find_all("a", { "class": "gallerythumb" }):
            response = requests.get(f"https://nhentai.net{i['href']}", cookies=cookies, headers=headers)
            soup = BeautifulSoup(response.text, "html.parser")
            img = soup.find_all("img")[1]
            img_url = img["src"]
            nhentai_page = img_url.split("/")[5]

            with open(os.path.join(download_path, nhentai_id, nhentai_page), "wb") as file:
                response = requests.get(img_url, cookies=cookies, headers=headers)

                file.write(response.content)
                if response.status_code == 200:
                    print(f"{nhentai_page} Success!")
                else:
                    print(f"{nhentai_page} Something went off, Status code: {response.status_code}")

        print(f"Operation done! Saved on {download_path}")

        with open("./config/isDownloading.txt", "w", encoding="utf-8") as file:
            file.write("false")
    except Exception as err:
        print("Something went wrong")
        print(f"Error: {str(err)}")
        with open("./config/error.txt", "w", encoding="utf-8") as file:
            file.write(str(err))
        with open("./config/isDownloading.txt", "w", encoding="utf-8") as file:
            file.write("false")

if __name__ == "__main__":
    main()