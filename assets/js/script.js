// Variables that will never change that all functions need to see
const API_KEY = '-1t8oIAPehMhiyfbbaX9GReRIEs';
const API_URL = 'https://ci-jshint.herokuapp.com/api';
// Creates a new bootstrap modal in JS for the output to go to
const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

// Add event listner to check status button and send the click event to our new function getStatus(e)
document.getElementById('status').addEventListener('click', e => getStatus(e));
// Add event listener to form submit button
document.getElementById('submit').addEventListener('click', e => postForm(e));

/**
 *  Asynchronus function to allow waiting for responses from API servers
 *  Takes the click event from the check api key status button and makes
 *  a call to the api handling any errors thrown
 * */

/**
 * 
 * @param {*} form 
 * @returns 
 */
function processOptions(form) {
    let optArray = [];

    for (let entry of form.entries()){
        if(entry[0] === 'options') {
            optArray.push(entry[1]);
        }
    }

    form.delete("options");
    form.append("options", optArray.join());

    return form;

}

async function getStatus(e) {
    const queryString = `${API_URL}?api_key=${API_KEY}`;
    console.log(queryString);
    const response = await fetch(queryString);

    const data = await response.json();

    if (response.ok) {
        displayStatus(data);
    } else {
        // create new JS error with the returned API error message
        displayException(data);
        throw new Error(data.error);
    }
}

function displayStatus(data) {

    let heading = 'API Key Status';
    let results = `<div>Your key is valid until</div>`;
    results += `<div class="key-status">${data.expiry}</div>`;

    document.getElementById('resultsModalTitle').innerText = heading
    document.getElementById('results-content').innerHTML = results;

    resultsModal.show();
}

async function postForm(e) {

    const form = processOptions(new FormData(document.getElementById('checksform')));

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form,
    })

    const data = await response.json();

    if (response.ok) {
       displayErrors(data);
       
    } else {
        displayException(data);
        // create new JS error with the returned API error message
        throw new Error(data.error);
        
    }
}

function displayErrors(data) {
    let heading = `JSHint Results for ${data.file}`;

    if (data.total_errors === 0) {
        results = `<div class="no_errors">No errors reported! Nice!</div>`;
    } else {
        results = `<div>Total Errors: <span class="error_count">${data.total_errors}</span>`;
        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class ="column">${error.col}</span></div>`;
            results += `<div class ="error">${error.error}</div>`;
        }
    }

    document.getElementById('resultsModalTitle').innerText = heading;
    document.getElementById('results-content').innerHTML = results;

    resultsModal.show();

}

function displayException(data) {
    let heading = "An Exception Occurred";
    let results = `<div class="api-code">The API returned status code ${data.status_code}</div>`;
    results += `<div class="error-number">Error Number: <strong>${data.error_no}</strong></div>`;
    results += `<div class="error-text">Error text: <strong>${data.error}</strong></div>`;

    document.getElementById('resultsModalTitle').innerText = heading;
    document.getElementById('results-content').innerHTML = results;

    resultsModal.show();
}
