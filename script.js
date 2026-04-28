const channel1 = "2613419";
const apiKey1 = "NHEEC7B6EH9KXHJQ";

const channel2 = "2614302";
const apiKey2 = "7FYJBHVEJB1O9L0G";

let chartTemp1, chartHumid1;
let chartTemp2, chartHumid2;

// ===== LIMIT DATA =====
function limitData(data, labels, maxPoints = 20){
    const step = Math.ceil(data.length / maxPoints);

    let newData = [];
    let newLabels = [];

    for(let i = 0; i < data.length; i += step){
        newData.push(data[i]);
        newLabels.push(labels[i]);
    }

    return { data: newData, labels: newLabels };
}

// ===== GET COLOR FROM CSS =====
const rootStyle = getComputedStyle(document.documentElement);

// Device 1
const d1Temp = rootStyle.getPropertyValue('--d1-temp').trim();
const d1TempBg = rootStyle.getPropertyValue('--d1-temp-bg').trim();
const d1Humid = rootStyle.getPropertyValue('--d1-humid').trim();
const d1HumidBg = rootStyle.getPropertyValue('--d1-humid-bg').trim();

// Device 2
const d2Temp = rootStyle.getPropertyValue('--d2-temp').trim();
const d2TempBg = rootStyle.getPropertyValue('--d2-temp-bg').trim();
const d2Humid = rootStyle.getPropertyValue('--d2-humid').trim();
const d2HumidBg = rootStyle.getPropertyValue('--d2-humid-bg').trim();

// ===== STATUS =====
function checkStatus(lastTime, id) {
    const now = new Date();
    const last = new Date(lastTime);
    const diff = (now - last) / 1000;

    document.getElementById(id).innerText =
        diff > 60 ? "🔴 Offline" : "🟢 Online";
}

// ===== FETCH =====
async function getData() {
    try {
        const res1 = await fetch(`https://api.thingspeak.com/channels/${channel1}/feeds.json?results=100&api_key=${apiKey1}`);
        const res2 = await fetch(`https://api.thingspeak.com/channels/${channel2}/feeds.json?results=100&api_key=${apiKey2}`);

        const data1 = await res1.json();
        const data2 = await res2.json();

        const f1 = data1.feeds;
        const f2 = data2.feeds;

        // ===== DEVICE 1 =====
        let t1=[], h1=[], l1=[];
        f1.forEach(i=>{
            t1.push(i.field1);
            h1.push(i.field2);
            l1.push(new Date(i.created_at).toLocaleTimeString());
        });

        // 👉 LIMIT 20 จุด
        const t1L = limitData(t1, l1);
        const h1L = limitData(h1, l1);

        let last1 = f1.at(-1);

        document.getElementById("temp1").innerText = last1.field1 + " °C";
        document.getElementById("humid1").innerText = last1.field2 + " %";
        document.getElementById("soil1").innerText = last1.field3 + " %";

        const soilEl = document.getElementById("soil1");
        if(last1.field3 < 30){
            soilEl.style.color = "red";
        } else if(last1.field3 < 60){
            soilEl.style.color = "orange";
        } else {
            soilEl.style.color = "#2e7d32";
        }

        checkStatus(last1.created_at, "status1");

        // ===== DEVICE 2 =====
        let t2=[], h2=[], l2=[];
        f2.forEach(i=>{
            t2.push(i.field1);
            h2.push(i.field2);
            l2.push(new Date(i.created_at).toLocaleTimeString());
        });

        // 👉 LIMIT 20 จุด
        const t2L = limitData(t2, l2);
        const h2L = limitData(h2, l2);

        let last2 = f2.at(-1);

        document.getElementById("temp2").innerText = last2.field1 + " °C";
        document.getElementById("humid2").innerText = last2.field2 + " %";

        checkStatus(last2.created_at, "status2");

        // ===== CHART DEVICE 1 =====
        if(chartTemp1) chartTemp1.destroy();
        if(chartHumid1) chartHumid1.destroy();

        chartTemp1 = new Chart(document.getElementById("chartTemp1"), {
            type: 'line',
            data: {
                labels: t1L.labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: t1L.data,
                    borderColor: d1Temp,
                    backgroundColor: d1TempBg,
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });

        chartHumid1 = new Chart(document.getElementById("chartHumid1"), {
            type: 'line',
            data: {
                labels: h1L.labels,
                datasets: [{
                    label: 'Humidity (%)',
                    data: h1L.data,
                    borderColor: d1Humid,
                    backgroundColor: d1HumidBg,
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });

        // ===== CHART DEVICE 2 =====
        if(chartTemp2) chartTemp2.destroy();
        if(chartHumid2) chartHumid2.destroy();

        chartTemp2 = new Chart(document.getElementById("chartTemp2"), {
            type: 'line',
            data: {
                labels: t2L.labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: t2L.data,
                    borderColor: d2Temp,
                    backgroundColor: d2TempBg,
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });

        chartHumid2 = new Chart(document.getElementById("chartHumid2"), {
            type: 'line',
            data: {
                labels: h2L.labels,
                datasets: [{
                    label: 'Humidity (%)',
                    data: h2L.data,
                    borderColor: d2Humid,
                    backgroundColor: d2HumidBg,
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });

    } catch(e) {
        console.log(e);
    }
}

getData();
setInterval(getData, 15000);