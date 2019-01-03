import requests

session = requests.Session()
session.get("https://fantasy.premierleague.com/")
csrftoken = session.cookies["csrftoken"]
email = "davidhiggins1712@gmail.com"
password = "matchy123*"

payload = {
    "csrfmiddlewaretoken": csrftoken,
    "login": email,
    "password": password,
    "app": "plfpl-web",
    "redirect_uri": "https://fantasy.premierleague.com/a/login"
}

login_url = "https://users.premierleague.com/accounts/login/"
response = session.post(login_url, data=payload)

print(response.cookies)
