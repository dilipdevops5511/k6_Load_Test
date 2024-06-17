import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import http from 'k6/http';
import { check } from 'k6';

// Define the stages for the test
export let options = {
    stages: [
        // Ramp up to 300 VUs over 60 seconds
        { duration: "20s", target: 10 },
        // Maintain 300 VUs for 5 minutes (300 seconds)
        { duration: "20s", target: 10 },
        // Ramp down to 0 VUs for 10 seconds
        { duration: "10s", target: 0 },
    ],
};

// Open the CSV file and parse the data using papaparse
const csvData = open('./data.csv');
const parsedData = papaparse.parse(csvData).data;

// Remove header row from the CSV data
parsedData.shift();

export default function () {

  const baseUrl = 'https://lt-1-stage-api.penpencil.co/batch-service/v1/fee/upcoming-instalments';

  // Loop through the data and make a GET request for each row
  parsedData.forEach(row => {
    // Extract the token from the row
    const [column1, column2, token] = row;

    let headers = {
        'Authorization': `Bearer ${token}`,
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'integration-with': '',
        'sec-ch-ua-mobile': '?0',
        'client-version': '4.2.1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://staging.physicswallah.live/',
        'randomId': '4c2c9314-6595-4951-a08f-ac59b4b10edd',
        'client-id': '5eb393ee95fab7468a79d189',
        'client-type': 'WEB',
        'sec-ch-ua-platform': '"macOS"',
    };

    let response = http.get(baseUrl, {
        headers: headers
    });

    // Check the response for various conditions
    check(response, {
		// The status code should be 200
		'status is 200': (r) => r.status === 200,
        // The response time should be less than 200ms
        'response time < 200ms': (r) => r.timings.duration < 200,
        // Check for 401 error
        'status is 401': (r) => r.status === 401,
    });

    // Log the token and API response
   // console.log(`Token: ${token}`);
   // console.log(`API Response: ${response.body}`);

  });
}
export function handleSummary(data) {
    return {
        "report.html": htmlReport(data),
    };
}