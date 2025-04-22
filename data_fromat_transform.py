import json
from markdownify import markdownify as md


with open("data/timeline_data_2.json", "r") as f:
    data = json.load(f)


data_dict = dict(data)

res = []
content_list = []

res_dict = {}


for event in data_dict["events"]:
    res_dict["time"] = (
        event["start_date"]["year"] + "-" + event["start_date"]["month"] + "-" + event["start_date"]["day"]
    )
    res_dict["title"] = event["text"]["headline"]
    res_dict["image"] = event["media"]["url"]
    res_dict["image_caption"] = event["media"]["caption"]
    res_dict["image_credit"] = event["media"]["credit"]
    res.append(res_dict)

    content = md(event["text"]["text"])
    content = "**" + res_dict["title"] + "**\n" + "時間：" + res_dict["time"] + "\n" + content

    content_time_title = res_dict["time"] + "#" + res_dict["title"]
    print(content_time_title)

    with open("data/timeline_event_content/" + content_time_title + ".md", "w") as f:
        f.write(content)
    res_dict = {}


with open("data/timeline_events.json", "w") as f:
    json.dump(res, f, ensure_ascii=False, indent=4)
