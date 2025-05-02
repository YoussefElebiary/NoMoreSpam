// DOM Elements
const submitButton = document.getElementById("btn");
const textArea = document.getElementById("textArea");
const resultCont = document.getElementsByClassName("resultCont")[0];
const verdict = document.getElementById("resultText");
const likelihood = document.getElementById("resultPercent");

// Handling Back-end Request
submitButton.addEventListener('click', async ()=> {
    // Check if textArea is loaded
    if (!textArea) {return;}
    // Check if there is data in the textArea
    let text = textArea.value;
    if (!text) {return;}
    // Hiding the result
    resultCont.style.visibility = "hidden";
    // Disabling the button
    submitButton.disabled = true;
    submitButton.textContent = "Analyzing...";
    // Attempting to process the request
    try {
        // // Contancting the back-end
        const response = await fetch('/request', {
            method: 'POST',
            headers: {
                'Content-type' : 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(text)}`,
        });
        // Receiving the response
        const data = await response.json();
        // Checking for server fail
        if (!response.ok || data.error) {
            console.error("Server Failed");
            return;
        }
        // Processing the server's response
        let percentage = data.percentage;
        // Validate percentage is a number
        if (typeof percentage !== 'number') {
            console.error("Invalid percentage received:", percentage);
            return;
        }
        if (percentage < 0.35) {    // A chance less than 35% of being spam (SAFE)
            verdict.textContent = "SAFE";
            verdict.style.color = "green";
            likelihood.textContent = `${Math.round(percentage * 100)}%`;
        } else if (0.35 <= percentage && percentage < 0.75) {    // A non assertive prediction (SUSPECT)
            verdict.textContent = "SUSPECT";
            verdict.style.color = "gold";
            likelihood.textContent = `${Math.round(percentage * 100)}%`;
        } else if (percentage >= 0.75) {    // A chance more than 75% of being spam (SPAM)
            verdict.textContent = "SPAM";
            verdict.style.color = "red";
            likelihood.textContent = `${Math.round(percentage * 100)}%`;
        } else {    // An error occured
            console.error("An error occured while parsing the response");
            return;
        }
        // Enabling the result element
        resultCont.style.visibility = "visible";
    } catch (error) {
        console.error(`An error occured!\nError: ${error}`);
    } finally {
        // Enabling the button
        submitButton.disabled = false;
        submitButton.textContent = "Submit for Analysis";
    }
});