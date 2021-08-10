const functions = require('firebase-functions');
const request = require('request-promise');
const ACCESS_TOKEN = 'YreEnqMxGwKkUtmX9YpPo/2m8lGNGhUgc+kZYqLQRNIVxDY0LFuLKWH8aMMmnsuqvlm8IL/DDEmXAMB6B6rQT5mWILTJf5kG0RAQxjEV8A3GdYYM6qau1omOE4d+pOJu3Yk+Cb5P5Dbh93CYESkjugdB04t89/1O/w1cDnyilFU='
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot';
const LINE_GET_CONTENT_API = 'https://api-data.line.me/v2/bot/message';
const vision = require('@google-cloud/vision');
const { ImageAnnotatorClient } = require('@google-cloud/vision').v1;
const BigQuery = require('@google-cloud/bigquery');
const fetch = require('node-fetch');
const MAP_API_KEY = 'AIzaSyDTciOAG1tmhxKAW_Wc4KMEecf2VKXWY4A'
const line = require('@line/bot-sdk');
const axios = require('axios')
const fs = require('fs');
const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
};
const fileName = "/Users/warissara/Desktop/firebase-function/functions/image.jpg";
// const fileName = "/Users/warissara/Desktop/S__10739754.jpg";
const { Client } = require("@googlemaps/google-maps-services-js");

var timein = "";
const vision_client = new vision.ImageAnnotatorClient();

const client = new line.Client({
    channelAccessToken: ACCESS_TOKEN
});

function compareDistance(d, line_id) {
    let max = Math.min(...d);
    let index = d.indexOf(max);
    console.log(index);
    const mapping = ['Central World', 'Central Pinklao', 'Central Rama3'];
    let place = mapping[index];

    const message = {
        "type": "text",
        "text": "Central สาขาที่ใกล้ที่สุดของคุณคือ " + place
    };

    client.pushMessage(line_id, message)
        .then(() => {
        })
        .catch((err) => {
            // error handling
            console.log(err);
        });
    const message12 = {
        "type": "flex",
        "altText": "this is a flex message",
        "contents":
        {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": "https://i.ibb.co/m5N6DqM/unnamed-1.jpg",
                "size": "full",
                "aspectRatio": "20:13",
                "aspectMode": "cover"
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "text",
                        "text": "Central Pinklao",
                        "weight": "bold",
                        "size": "xl",
                        "wrap": true,
                        "contents": []
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": "Tel: 02 802 9000",
                                "contents": []
                            }
                        ]
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "จองที่จอดรถ",
                            "text": "เงื่อนไขบริการที่จอดรถที่ Central Pinklao",
                        },
                        "style": "primary"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": "คำนวณเวลาในการเดินทาง",
                            "text": "คำนวณระยะเวลาเดินทางไป Central Pinklao",
                        }
                    }
                ]
            }
        }
    }
    client.pushMessage(line_id, message12)
        .then(() => {
        })
        .catch((err) => {
            // error handling
            console.log(err);
        });

}

var location = [];
var central_pin = [];
var central_rama3 = [];
var central_world = [];
async function queryUserid(line_id) {
    const bigqueryClient = new BigQuery();

    // The SQL query to run
    const sqlQuery = `SELECT user_id
FROM user_dataset.line_user_data
where line_id = @lineid`;
    console.log('Rows:');

    const lineid_options = {
        query: sqlQuery,
        params: { lineid: line_id },
    };

    // Run the query
    const [userid] = await bigqueryClient.query(lineid_options);

    console.log(userid);


}
var text_mes = "";
async function vision_func(id) {

    //******text detection */

    const [result] = await vision_client.textDetection(fileName);
    // console.log(result);
    try {
        const [detections] = result.textAnnotations;
        console.log('Text:');
        let description = detections.description;
        description = description.replace(/ /g, "");

        description = description.replace(/[^a-zA-Z_0-9-]/g, '\n');
        description = description.toLowerCase();
        let des = description.split(/\r?\n/);

        var filtered = des.filter(function (el) {
            return el != "";
        });

        // let no_array = [];
        let total_arr = filtered.indexOf("total");
        let total = filtered[total_arr + 1];
        console.log("TOTAL:" + String(total));
        let inv_arr = filtered.indexOf("invoiceid");
        let invid = filtered[inv_arr + 1];
        console.log("INV NO:" + String(invid));
        let shop_name = filtered[0];
        console.log("SHOP:" + String(shop_name));
        // queryUserid(line_id);

        let rawdata = fs.readFileSync('inv_id.json');
        let invno = JSON.parse(rawdata);
        console.log(invno.inv['id1'])

        if (invno.inv['id1'] == "") {
            invno.inv['id1'] = invid;
        }
        else if (invno.inv['id2'] == "" && invno.inv['id1'] != invid) {
            invno.inv['id2'] = invid;
        }
        else {
            const message3 = {
                "type": "sticker",
                "packageId": "8522",
                "stickerId": "16581283"
            };

            client.pushMessage(id, message3)
                .then(() => {
                })
                .catch((err) => {
                    // error handling
                    console.log(err);
                });
            const message4 = {
                "type": "text",
                "text": "ขอโทษค่ะ ใบเสร็จนี้ถูกใช้ไปแล้ว รบกวนอัพโหลดใบเสร็จใหม่เพื่อรับสิทธิจอดรถฟรีค่ะ",

            };

            client.pushMessage(id, message4)
                .then(() => {
                })
                .catch((err) => {
                    // error handling
                    console.log(err);
                });
            return true
        }
        console.log(invno);


        let data = JSON.stringify(invno, null, 2);

        fs.writeFile('inv_id.json', data, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });

        text_mes = "ยอดรวม: " + String(total) + " THB ใช้บริการที่ร้าน " + String(shop_name) + ". Verify invoice no.: " + String(invid) + ".  ";
        console.log(invno);

        const message = {
            "type": "sticker",
            "packageId": "8522",
            "stickerId": "16581271"
        };

        client.pushMessage(id, message)
            .then(() => {
            })
            .catch((err) => {
                // error handling
                console.log(err);
            });
        const message2 = {
            "type": "text",
            "text": text_mes + "คุณสามารถจอดรถได้ฟรี 2 ชั่วโมง!"
        };

        client.pushMessage(id, message2)
            .then(() => {
            })
            .catch((err) => {
                // error handling
                console.log(err);
            });

        const message101 = {
            "type": "text",
            "text": "ซื้อสินค้าเพิ่มอีกนิดเดียวคุณจะได้รับสิทธิพิเศษ จอดรถฟรีมากถึง 6 ชั่วโมง! ลองดูโปรโมชั่นนี้เลย!"
        };

        client.pushMessage(id, message101)
            .then(() => {
            })
            .catch((err) => {
                // error handling
                console.log(err);
            });
        const message105 = {
            "type": "template",
            "altText": "this is an image carousel template",
            "template": {
                "type": "image_carousel",
                "columns": [
                    {
                        "imageUrl": "https://i.ibb.co/CV526jN/817473c0-b871-11eb-9ca2-73594b023eb0-original.jpg",
                        "action": {
                            "type": "uri",
                            "label": "SHOP NOW",
                            "uri": "https://www.central.co.th/th?gclid=CjwKCAjwmK6IBhBqEiwAocMc8gt3E_TrPnOG0YonYQTujnaBqJ--71q0M5xByTfzJxjpmDUrarrBVRoCuk0QAvD_BwE&gclsrc=aw.ds"
                        }
                    },
                    {
                        "imageUrl": "https://i.ibb.co/m96KKvh/Food-Delivery-Take-away-with-Voucher.jpg",
                        "action": {
                            "type": "uri",
                            "label": "SHOP NOW",
                            "uri": "https://www.central.co.th/th?gclid=CjwKCAjwmK6IBhBqEiwAocMc8gt3E_TrPnOG0YonYQTujnaBqJ--71q0M5xByTfzJxjpmDUrarrBVRoCuk0QAvD_BwE&gclsrc=aw.ds"
                        }
                    }
                ]
            }
        }
        client.pushMessage(id, message105)
            .then(() => {
            })
            .catch((err) => {
                // error handling
                console.log(err);
            });
    }
    catch {

        if (result.error.message == 'Bad image data.') {
            const message5 =
            {
                "type": "sticker",
                "packageId": "8522",
                "stickerId": "16581274"
            }

                ;
            client.pushMessage(id, message5)
                .then(() => {
                })
                .catch((err) => {
                    // error handling
                    console.log(err);
                });
            const message50 =
            {
                "type": "text",
                "text": "รูปนี้ไม่สามารถประมวลผลได้กรุณาถ่ายใหม่อีกครั้งค่ะ",
            }

                ;
            client.pushMessage(id, message50)
                .then(() => {
                })
                .catch((err) => {
                    // error handling
                    console.log(err);
                });

        }
    }

}


exports.LineSmartBot = functions.https.onRequest((req, res) => {

    if (req.method === "POST") {
        let event = req.body.events[0];
        let line_id = event.source.userId;

        console.log(event)
        if (event.type == 'message') {
            if (event.message.type == 'sticker') {

                let emotion = event.message.keywords;
                let message_id = event.message.id;
                if (emotion.includes("OK")) {
                    console.log(emotion);
                    const message5 =
                    {
                        "type": "sticker",
                        "packageId": "8522",
                        "stickerId": "16581267"
                    }

                        ;
                    client.pushMessage(line_id, message5)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    req.body.events[0].message = { type: "text", id: message_id, text: "ok" };
                    newbuff = Buffer.from("ok", 'utf8');
                    req.rawBody = newbuff
                    // console.log(newbuff);
                    // console.log(req.body.events[0].message);
                    postToDialogflow(req);

                }
                else {
                    console.log("no emotion")
                }

            }
            else if (event.message.type == 'image') {

                let message_id = event.message.id;
                let line_id = event.source.userId;
                content(message_id, req.body.events[0].replyToken, line_id);

            }

            else if (event.message.type == 'location') {

                let req = event.message;
                location = [req.latitude, req.longitude]
                let d = [];
                central_world = [13.746944, 100.539719];
                let delx = Math.abs(location[0] - central_world[0]);
                let dely = Math.abs(location[1] - central_world[1]);
                d = [Math.sqrt((Math.pow(delx, 2)) + (Math.pow(dely, 2)))]

                central_pin = [13.7783, 100.4764];
                delx = Math.abs(location[0] - central_pin[0]);
                dely = Math.abs(location[1] - central_pin[1]);
                d.push(Math.sqrt((Math.pow(delx, 2)) + (Math.pow(dely, 2))));

                central_rama3 = [13.9042, 100.5278];
                delx = Math.abs(location[0] - central_rama3[0]);
                dely = Math.abs(location[1] - central_rama3[1]);
                d.push(Math.sqrt((Math.pow(delx, 2)) + (Math.pow(dely, 2))));


                let data = JSON.stringify({
                    "location": [req.latitude, req.longitude],
                    "central_pin": [13.7783, 100.4764]
                })

                fs.writeFile('location.json', data, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                    compareDistance(d, line_id);

                });



            }

            else if (event.message.type == 'text') {
                const query = event.message.text;

                if (query.includes('Hi') || query.includes('เมนูหลัก') || query.includes('สวัสดี') || query.includes('หวัดดี')) {


                    const message10 = {

                        "type": "text",
                        "text": "สวัสดีจ้า มีอะไรให้น้องบอทช่วยบอกมาได้เลย!",
                        "quickReply": {
                            "items": [
                                {
                                    "type": "action",
                                    "imageUrl": "https://i.ibb.co/QnVqbFk/parking.png",
                                    "action": {
                                        "type": "message",
                                        "label": "จองที่จอดรถ",
                                        "text": "สาขาทั้งหมด",
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "cameraRoll",
                                        "label": "อัพโหลดใบเสร็จ"
                                    }

                                },
                                {
                                    "type": "action",
                                    "action": {

                                        "type": "location",
                                        "label": "ใกล้ฉัน"

                                    }
                                },

                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "imageUrl": "https://i.ibb.co/WtFdPZJ/parking-card.png",
                                        "label": "บัตร The 1",
                                        "text": "The 1 Card",
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "label": "สาขาทั้งหมด",
                                        "text": "สาขาทั้งหมด",
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "label": "เงื่อนไข",
                                        "text": "เงื่อนไข",
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "label": "เพิ่มบัตรVIP",
                                        "text": "บัตรVIP",
                                    }
                                },


                            ]
                        }

                    }

                    client.pushMessage(line_id, message10)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (query.includes(":00")) {

                    const message32 = {
                        "type": "text",
                        "text": "คุณต้องการทำการจองที่จอดรถเวลา " + query + " น.",
                    }

                        ;
                    client.pushMessage(line_id, message32)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });

                    const message33 = {
                        "type": "template",
                        "altText": "this is a confirm template",
                        "template": {
                            "type": "confirm",
                            "actions": [
                                {
                                    "type": "message",
                                    "label": "ยืนยัน",
                                    "text": "จองที่จอดรถ"
                                },
                                {
                                    "type": "message",
                                    "label": "ยกเลิก",
                                    "text": "ยกเลิก"
                                }
                            ],
                            "text": "ต้องการยืนยันการจองหรือไม่"
                        }
                    }
                    client.pushMessage(line_id, message33)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }

                else if (event.message.text == 'ใกล้ฉัน') {
                    reply(
                        req.body.events[0].replyToken,
                        {
                            type: 'text',
                            text: "ช่วยส่งตำแหน่งปัจจุบันของคุณมาหน่อย เดี๋ยวน้องบอทจะช่วยดูให้จ้า",
                        }
                    )
                    return true
                }
                else if (event.message.text == 'เลือกเวลาที่จะเข้าใช้บริการ') {
                    let date_ob = new Date();

                    let hours = date_ob.getHours();
                    timein = hours + 8;
                    timein = String(timein) + ":00";
                    const message107 = {
                        "type": "template",
                        "altText": "this is a confirm template",
                        "template": {
                            "type": "confirm",
                            "actions": [
                                {
                                    "type": "message",
                                    "label": "ใช่",
                                    "text": timein
                                },
                                {
                                    "type": "datetimepicker",
                                    "label": "เลือกเวลา",
                                    "data": "จองที่จอดรถ",
                                    "mode": "time",
                                    "initial": timein,
                                    "max": "20:00",
                                    "min": timein
                                }
                            ],
                            "text": "ต้องการเข้าใช้เวลา " + timein + " น. ไหมคะ"
                        }
                    }
                    client.pushMessage(line_id, message107)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'รับสิทธิที่จอดรถฟรี') {
                    const message31 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents":
                        {
                            "type": "bubble",
                            "direction": "ltr",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Parking Service",
                                        "weight": "bold",
                                        "size": "xl",
                                        "color": "#000000FF",
                                        "align": "start",
                                        "gravity": "top",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าบริการจอดรถยนต์  ",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "Car Parking Fee",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xs",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "จอดฟรี 2 ชั่วโมงแรก",
                                        "weight": "regular",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ  600 บาทขึ้นไป ฟรีอีก 2 ชั่วโมง",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 3,000 ฟรี 6 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 6,000 ฟรี 8 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าจอดรถยนต์ชั่วโมงที่ 3-5 ",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ชั่วโมงละ 30.",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ตั้งแต่ชั่วโมงที่ 6 คิดช่ัวโมงละ 60.",
                                        "size": "sm",
                                        "contents": []
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [

                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "uri",
                                            "label": "อัพโหลดใบเสร็จ",
                                            "uri": "https://line.me/R/nv/cameraRoll/single"
                                        },
                                        "margin": "xl",
                                        "style": "primary"
                                    }
                                ]
                            }
                        }
                    }
                    client.pushMessage(line_id, message31)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'เงื่อนไข') {
                    const message31 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents":
                        {
                            "type": "bubble",
                            "direction": "ltr",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Parking Service",
                                        "weight": "bold",
                                        "size": "xl",
                                        "color": "#000000FF",
                                        "align": "start",
                                        "gravity": "top",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าบริการจอดรถยนต์  ",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "Car Parking Fee",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xs",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "จอดฟรี 2 ชั่วโมงแรก",
                                        "weight": "regular",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ  600 บาทขึ้นไป ฟรีอีก 2 ชั่วโมง",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 3,000 ฟรี 6 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 6,000 ฟรี 8 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าจอดรถยนต์ชั่วโมงที่ 3-5 ",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ชั่วโมงละ 30.",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ตั้งแต่ชั่วโมงที่ 6 คิดช่ัวโมงละ 60.",
                                        "size": "sm",
                                        "contents": []
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        },
                                        "margin": "xl",
                                        "height": "md",
                                        "style": "link"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "จองที่จอดรถ",
                                            "text": "เลือกเวลาที่จะเข้าใช้บริการ",
                                        }
                                        ,
                                        "margin": "xl",
                                        "style": "primary"
                                    }
                                ]
                            }
                        }
                    }
                    client.pushMessage(line_id, message31)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'บัตรVIP') {

                    const message32 = {

                        "type": "text",
                        "text": "โปรดเลือกบัตรที่คุณมีเพื่อรับสิทธิที่จอดรถ VIP ",
                        "quickReply": {
                            "items": [
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "label": "The 1 Exclusive",
                                        "text": "The 1 Exclusive",
                                    }
                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "text": "The 1 The Black",
                                        "label": "The 1 The Black"
                                    }

                                },
                                {
                                    "type": "action",
                                    "action": {
                                        "type": "message",
                                        "label": "Citibank",
                                        "text": "Citibank",
                                    }
                                },



                            ]
                        }

                    }

                    client.pushMessage(line_id, message32)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }

                else if (query.includes('เงื่อนไขบริการที่จอดรถ')) {
                    const message30 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents":
                        {
                            "type": "bubble",
                            "direction": "ltr",
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "Parking Service",
                                        "weight": "bold",
                                        "size": "xl",
                                        "color": "#000000FF",
                                        "align": "start",
                                        "gravity": "top",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าบริการจอดรถยนต์  ",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "Car Parking Fee",
                                        "size": "md",
                                        "align": "start",
                                        "margin": "xs",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "จอดฟรี 2 ชั่วโมงแรก",
                                        "weight": "regular",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ  600 บาทขึ้นไป ฟรีอีก 2 ชั่วโมง",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 3,000 ฟรี 6 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ใช้จ่ายครบ 6,000 ฟรี 8 ชั่วโมงแรก",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "separator"
                                    },
                                    {
                                        "type": "text",
                                        "text": "อัตราค่าจอดรถยนต์ชั่วโมงที่ 3-5 ",
                                        "size": "sm",
                                        "margin": "xl",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ชั่วโมงละ 30.",
                                        "size": "sm",
                                        "contents": []
                                    },
                                    {
                                        "type": "text",
                                        "text": "ตั้งแต่ชั่วโมงที่ 6 คิดช่ัวโมงละ 60.",
                                        "size": "sm",
                                        "contents": []
                                    }
                                ]
                            },
                            "footer": {
                                "type": "box",
                                "layout": "horizontal",
                                "contents": [
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        },
                                        "margin": "xl",
                                        "height": "md",
                                        "style": "link"
                                    },
                                    {
                                        "type": "button",
                                        "action": {
                                            "type": "message",
                                            "label": "จองที่จอดรถ",
                                            "text": "เลือกเวลาที่จะเข้าใช้บริการ",
                                        },
                                        "margin": "xl",
                                        "style": "primary"
                                    }
                                ]
                            }
                        }
                    }
                    client.pushMessage(line_id, message30)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'ระยะห่างจาก Central Pinklao') {

                    reply(
                        req.body.events[0].replyToken,
                        {
                            type: 'text',
                            text: "ช่วยส่งตำแหน่งปัจจุบันของคุณมาหน่อย เดี๋ยวน้องบอทจะช่วยดูให้จ้า",
                        }
                    )
                    return true
                }
                else if (event.message.text == 'คำนวณระยะเวลาเดินทางไป Central Pinklao') {

                    let rawdata = fs.readFileSync('location.json');
                    let location_file = JSON.parse(rawdata);
                    console.log("location: " + location_file.location)
                    let location = location_file.location
                    let central_pin = location_file.central_pin
                    console.log("location: " + location_file.central_pin)

                    let todo = {
                        "units": "imperial",
                        "origins": "Washington,DC",
                        "destinations": "New York City,NY",
                        "key": "AIzaSyClnWoJPU_iS9-GnN-1QSfH0k1SMN_oa-I",
                    }

                    function callMapDistance() {
                        axios({
                            url: "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + location[0] + "," + location[1] + "&destinations=" + central_pin[0] + "," + central_pin[1] + "&key=" + MAP_API_KEY,
                            headers: { 'Content-Type': 'application/json' },
                            method: "post",
                            data: todo
                        })
                            .then(response => {
                                console.log(response.data)
                                let arr = response.data.rows[0].elements[0].distance.text;
                                const myArr = arr.split(" ");
                                let km = parseInt(myArr[0]) * 1.60934;
                                let txt = 'ระยะทางประมาณ ' + km + ' กิโลเมตร' + ' คุณจะใช้เวลาเดินทางทั้งหมด ' + response.data.rows[0].elements[0].duration.text + ' เพื่อไปถึงที่หมาย'
                                const message20 = {
                                    "type": "text",
                                    "text": txt,

                                };

                                client.pushMessage(line_id, message20)
                                    .then(() => {
                                    })
                                    .catch((err) => {
                                        // error handling
                                        console.log(err);
                                    });
                                const message106 = {
                                    "type": "location",
                                    "title": "Central Pinklao",
                                    "address": "1 Borommaratchachonnani Rd, Arun Amarin, Bangkok Noi, Bangkok 10700",
                                    "latitude": 13.7783,
                                    "longitude": 100.4764
                                }
                                client.pushMessage(line_id, message106)
                                    .then(() => {
                                    })
                                    .catch((err) => {
                                        // error handling
                                        console.log(err);
                                    });
                            }
                            )
                    }
                    callMapDistance()

                    const message21 = {
                        "type": "sticker",
                        "packageId": "8522",
                        "stickerId": "16581271"
                    };

                    client.pushMessage(line_id, message21)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });


                    return true
                }
                else if (event.message.text == 'The 1 Card') {
                    const message8 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents": {
                            "type": "bubble",
                            "direction": "ltr",
                            "hero": {
                                "type": "image",
                                "url": "https://i.ibb.co/LgK86y1/central-world.png",
                                "size": "full",
                                "aspectRatio": "20:13",
                                "aspectMode": "cover",
                                "action": {
                                    "type": "uri",
                                    "label": "Action",
                                    "uri": "https://linecorp.com/"
                                }
                            },
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "md",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "CENTRAL MEMBER\nThe 1 Card",
                                        "weight": "bold",
                                        "size": "lg",
                                        "color": "#000000FF",
                                        "gravity": "center",
                                        "wrap": true,
                                        "contents": []
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "margin": "md",
                                        "contents": [
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "text",
                                                "text": "4.0",
                                                "size": "sm",
                                                "color": "#999999",
                                                "flex": 0,
                                                "margin": "md",
                                                "contents": []
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "margin": "lg",
                                        "contents": [
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Date",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "Monday 25, 9:00PM",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Parking",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "1 Floor, No.3",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "No.",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "1234567890",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Points",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "2,120 Points",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "margin": "xxl",
                                        "contents": [
                                            {
                                                "type": "spacer"
                                            },
                                            {
                                                "type": "image",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
                                                "size": "xl",
                                                "aspectMode": "cover"
                                            },
                                            {
                                                "type": "text",
                                                "text": "You can use the QR code instead of The 1 Card",
                                                "size": "xs",
                                                "color": "#AAAAAA",
                                                "margin": "xxl",
                                                "wrap": true,
                                                "contents": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                        ;
                    client.pushMessage(line_id, message8)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'ยืนยันการจอง') {
                    const message8 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents": {
                            "type": "bubble",
                            "direction": "ltr",
                            "hero": {
                                "type": "image",
                                "url": "https://i.ibb.co/LgK86y1/central-world.png",
                                "size": "full",
                                "aspectRatio": "20:13",
                                "aspectMode": "cover",
                                "action": {
                                    "type": "uri",
                                    "label": "Action",
                                    "uri": "https://linecorp.com/"
                                }
                            },
                            "body": {
                                "type": "box",
                                "layout": "vertical",
                                "spacing": "md",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": "CENTRAL MEMBER\nThe 1 Card",
                                        "weight": "bold",
                                        "size": "lg",
                                        "color": "#000000FF",
                                        "gravity": "center",
                                        "wrap": true,
                                        "contents": []
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "margin": "md",
                                        "contents": [
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "icon",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gray_star_28.png",
                                                "size": "sm"
                                            },
                                            {
                                                "type": "text",
                                                "text": "4.0",
                                                "size": "sm",
                                                "color": "#999999",
                                                "flex": 0,
                                                "margin": "md",
                                                "contents": []
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "margin": "lg",
                                        "contents": [
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Date",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "Monday 25, 9:00PM",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Parking",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "1 Floor, No.3",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "No.",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "1234567890",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "box",
                                                "layout": "baseline",
                                                "spacing": "sm",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Points",
                                                        "size": "sm",
                                                        "color": "#AAAAAA",
                                                        "flex": 1,
                                                        "contents": []
                                                    },
                                                    {
                                                        "type": "text",
                                                        "text": "2,120 Points",
                                                        "size": "sm",
                                                        "color": "#666666",
                                                        "flex": 4,
                                                        "wrap": true,
                                                        "contents": []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "vertical",
                                        "margin": "xxl",
                                        "contents": [
                                            {
                                                "type": "spacer"
                                            },
                                            {
                                                "type": "image",
                                                "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
                                                "size": "xl",
                                                "aspectMode": "cover"
                                            },
                                            {
                                                "type": "text",
                                                "text": "You can use the QR code instead of The 1 Card",
                                                "size": "xs",
                                                "color": "#AAAAAA",
                                                "margin": "xxl",
                                                "wrap": true,
                                                "contents": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                        ;
                    client.pushMessage(line_id, message8)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });

                    const message102 = {
                        "type": "location",
                        "title": "Central Pinklao",
                        "address": "1 Borommaratchachonnani Rd, Arun Amarin, Bangkok Noi, Bangkok 10700",
                        "latitude": 13.7783,
                        "longitude": 100.4764
                    }
                    client.pushMessage(line_id, message102)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    const message103 = {
                        "type": "text",
                        "text": "จองสำเร็จแล้วที่ Central Pinklao! ยินดีต้อนรับคุณวริศรา มาใช้บริการค่ะ",

                    }
                    client.pushMessage(line_id, message103)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else if (event.message.text == 'สาขาทั้งหมด') {
                    const message9 = {
                        "type": "flex",
                        "altText": "this is a flex message",
                        "contents":
                        {
                            "type": "carousel",
                            "contents": [
                                {
                                    "type": "bubble",
                                    "hero": {
                                        "type": "image",
                                        "url": "https://i.ibb.co/LgK86y1/central-world.png",
                                        "size": "full",
                                        "aspectRatio": "20:13",
                                        "aspectMode": "cover",
                                        "backgroundColor": "#BE0000FF"
                                    },
                                    "body": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "backgroundColor": "#FFFFFFFF",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Central World",
                                                "weight": "bold",
                                                "size": "xl",
                                                "wrap": true,
                                                "contents": []
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Tel: 02 100 9999",
                                                        "contents": []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "จองที่จอดรถ",
                                                    "text": "เงื่อนไขบริการที่จอดรถที่ Central World"
                                                },
                                                "style": "primary"
                                            },
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "ระยะทาง",
                                                    "text": "ระยะห่างจาก Central World"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "bubble",
                                    "hero": {
                                        "type": "image",
                                        "url": "https://i.ibb.co/m5N6DqM/unnamed-1.jpg",
                                        "size": "full",
                                        "aspectRatio": "20:13",
                                        "aspectMode": "cover"
                                    },
                                    "body": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Central Pinklao",
                                                "weight": "bold",
                                                "size": "xl",
                                                "wrap": true,
                                                "contents": []
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Tel: 02 802 9000",
                                                        "contents": []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "จองที่จอดรถ",
                                                    "text": "เงื่อนไขบริการที่จอดรถที่ Central Pinklao"
                                                },
                                                "style": "primary"
                                            },
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "ระยะทาง",
                                                    "text": "ระยะห่างจาก Central Pinklao"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "bubble",
                                    "hero": {
                                        "type": "image",
                                        "url": "https://i.ibb.co/sQB9hz8/download.jpg",
                                        "size": "full",
                                        "aspectRatio": "20:13",
                                        "aspectMode": "cover"
                                    },
                                    "body": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Central Rama 3",
                                                "weight": "bold",
                                                "size": "xl",
                                                "wrap": true,
                                                "contents": []
                                            },
                                            {
                                                "type": "box",
                                                "layout": "vertical",
                                                "contents": [
                                                    {
                                                        "type": "text",
                                                        "text": "Tel:  02 673 5555",
                                                        "contents": []
                                                    }
                                                ]
                                            },
                                            {
                                                "type": "text",
                                                "text": "Parking lot is temporarily full",
                                                "size": "xxs",
                                                "color": "#FF5551",
                                                "flex": 0,
                                                "margin": "md",
                                                "wrap": true,
                                                "contents": []
                                            }
                                        ]
                                    },
                                    "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "spacing": "sm",
                                        "contents": [
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "จองที่จอดรถ",
                                                    "text": "เงื่อนไขบริการที่จอดรถที่ Central Rama3"
                                                },
                                                "flex": 2,
                                                "color": "#AAAAAA",
                                                "style": "primary"
                                            },
                                            {
                                                "type": "button",
                                                "action": {
                                                    "type": "message",
                                                    "label": "ระยะทาง",
                                                    "text": "ระยะห่างจาก Central Rama3"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                    client.pushMessage(line_id, message9)
                        .then(() => {
                        })
                        .catch((err) => {
                            // error handling
                            console.log(err);
                        });
                    return true
                }
                else {
                    postToDialogflow(req);
                }
                postToDialogflow(req);

            }

        }
        else if (event.type == 'postback') {
            if (event.postback.data == 'จองที่จอดรถ') {
                let time = event.postback.params.time;
                const message32 = {
                    "type": "text",
                    "text": "คุณต้องการทำการจองที่จอดรถเวลา: " + String(time),
                }

                    ;
                client.pushMessage(line_id, message32)
                    .then(() => {
                    })
                    .catch((err) => {
                        // error handling
                        console.log(err);
                    });

                const message33 = {
                    "type": "template",
                    "altText": "this is a confirm template",
                    "template": {
                        "type": "confirm",
                        "actions": [
                            {
                                "type": "message",
                                "label": "ยืนยัน",
                                "text": "จองที่จอดรถ"
                            },
                            {
                                "type": "message",
                                "label": "ยกเลิก",
                                "text": "ยกเลิก"
                            }
                        ],
                        "text": "ต้องการยืนยันการจองหรือไม่"
                    }
                }
                client.pushMessage(line_id, message33)
                    .then(() => {
                    })
                    .catch((err) => {
                        // error handling
                        console.log(err);
                    });
            }
        }

        return res.status(200).send(req.method);
    }
});

const reply = (token, payload) => {
    request.post({
        uri: `${LINE_MESSAGING_API}/message/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: token,
            messages: [payload],
        })
    });
};

const postToDialogflow = req => {
    req.headers.host = "dialogflow.cloud.google.com"
    axios({
        url: "https://dialogflow.cloud.google.com/v1/cx/locations/us-central1/integrations/line/webhook/agents/924e9aee-6166-4b0b-952d-4ac975552109/integrations/15b88543-509b-4cab-a681-11eed3b7d8b7",
        headers: req.headers,
        method: "post",
        data: req.body,
    })



};

const content = (message_id, token, line_id) => {
    // let req = request.get({
    //     uri: `${LINE_GET_CONTENT_API}/${message_id}/content`,
    //     headers: LINE_HEADER,
    // });

    client.getMessageContent(message_id)
        .then((stream) => {
            let body = [];

            stream.on('data', (chunk) => {
                // console.log(chunk);
                let base64 = chunk.toString("base64");
                body.push(base64);
            });
            stream.on('end', () => {
                let buff = new Buffer(body[0], 'base64');

                fs.writeFileSync('image.jpg', buff);

                vision_func(line_id);

            });
            stream.on('error', (err) => {
                console.log("error:");
                console.log(err);

            });

        });
};