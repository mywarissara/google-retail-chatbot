'use strict';

const functions = require('firebase-functions');
const { google } = require('googleapis');
const { WebhookClient } = require('dialogflow-fulfillment');
const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');
const BigQuery = require('@google-cloud/bigquery');
const bigqueryClient = new BigQuery();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const bucketName = 'carpark-chatbot-bucket';
// const timeZone = 'Asia/Bangkok';
// const timeZoneOffset = '+07:00';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {

    console.log("*********************")
    console.log(request.headers.host);
    // const otp = request.body.sessionInfo.parameters.otp;

    const tel = request.body.sessionInfo.parameters.tel;
    // const timein_hr = request.body.sessionInfo.parameters.timein.hours;
    // const timein_min = request.body.sessionInfo.parameters.timein.minutes;


    // time 1000-2200
    console.log("tel is: ", tel);
    queryParamsNamed(tel);
    async function queryParamsNamed(tel) {
        // The SQL query to run
        const sqlQuery = `SELECT user_id, user_license
FROM user_dataset.user_data
where user_tel = @user_tel`;

        const options = {
            query: sqlQuery,
            // Location must match that of the dataset(s) referenced in the query.
            params: { user_tel: tel },
        };

        // Run the query
        const [rows] = await bigqueryClient.query(options);

        console.log('Rows:');
        // rows.forEach(row => 
        // const row_data = row;
        // );
        console.log(rows[0]);
        // const get_user_id = rows[0].user_id;
        const get_user_data = rows;
        console.log(get_user_data);
        findSlot(get_user_data);

    }
    function responseDialogflow(data) {
        let jsonResponse = {};

        jsonResponse = {
            //fulfillment text response to be sent to the agent if there are no defined responses for the specified tag
            "fulfillment_response":
            {
                "messages": [
                    {
                        "text": {
                            ////fulfillment text response to be sent to the agent
                            "text": [
                                `เรากำลังทำรายการของคุณ ที่จอดรถที่คุณได้จองไว้เลขที่ ${data[1]} ชั้น 1 \nโดยคุณจะได้รับสิทธิในการจอดรถฟรี 2 ชั่วโมงแรก \nขอข้อมูลเพิ่มเติมพิมพ์ "เงื่อนไข"`
                            ]
                        }
                    }

                ]
            }
        };
        response.json(jsonResponse);
    }
    async function findSlot(get_user_data) {
        let count = 0;
        const check_slot_count = `SELECT count(*) 
        from user_dataset.parking_slot 
        where slot_status = true`
        let option = {
            query: check_slot_count,
            // Location must match that of the dataset(s) referenced in the query.
        };

        // Run the query
        const [num] = await bigqueryClient.query(option);
        count = num[0].f0_;
        console.log(num[0].f0_);
        if (count != 0) {
            // The SQL query to run
            const parking_query = `SELECT slot_id
FROM user_dataset.parking_slot
where slot_status = true`;

            let options = {
                query: parking_query,
                // Location must match that of the dataset(s) referenced in the query.
            };

            // Run the query
            const [parks] = await bigqueryClient.query(options);
            var status = true; // slot available
            console.log('Rows parking:' + parks[0].slot_id);
            if (parks[0].slot_id == "") {
                parks[0].slot_id = 'ขอโทษค่ะ ขณะนี้ที่จอดรถเต็มลองใหม่อีกครั้งภายหลังน้า';
                status = false;
            }
            else {
                const update_status = `UPDATE user_dataset.parking_slot
SET slot_status = false
WHERE slot_id = @id`
                let options2 = {
                    query: update_status,
                    params: {
                        id: parks[0].slot_id
                    },
                    // Location must match that of the dataset(s) referenced in the query.
                };
                bigqueryClient.query(options2, function (error, rows) {
                    if (error != null) {
                        console.log("error:" + error);
                    }
                });
            }

            let insert_data = get_user_data;

            insert_data.push(parks[0].slot_id);
            insert_data.push(status);

            addToBigQuery(insert_data);
        }
        else {
            let jsonResponse = {};

            jsonResponse = {
                //fulfillment text response to be sent to the agent if there are no defined responses for the specified tag
                "fulfillment_response": {
                    "messages": [
                        {
                            "text": {
                                ////fulfillment text response to be sent to the agent
                                "text": [
                                    `ขอโทษค่ะ ขณะนี้ที่จอดรถเต็มลองใหม่อีกครั้งภายหลังน้า`
                                ]
                            }
                        }
                    ]
                }
            };
            response.json(jsonResponse);
        }
    }
    async function addToBigQuery(data) {
        if (data[2] == true) {
            setTimeout(function () {
                // const data = await queryParamsNamed();
                // let sql = `INSERT user_dataset.user_reserve(user_id, user_license, user_timein, slot_id) VALUES(@userid, @userlicense, @timein, @slotid )`
                let sql = `INSERT user_dataset.user_reserve(user_id, user_license, slot_id) VALUES(@userid, @userlicense, @slotid )`

                const options = {
                    query: sql,
                    params: {
                        userid: data[0].user_id, userlicense: data[0].user_license,
                        // timein: timein_hr.toString() + timein_min.toString(),
                        slotid: data[1]
                    },
                };
                bigqueryClient.query(options, function (error, rows) {
                    if (error != null) {
                        console.log("error:" + error);
                    }
                });
            }, 30000);
            responseDialogflow(data);
        }
        else {
            responseDialogflow(data);

        }
    }

});

