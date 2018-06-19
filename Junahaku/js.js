var alkuURL = "https://rata.digitraffic.fi/api/v1/live-trains/station/"
var oikeaURL;
var kaikkiAsemat;
var tiedot;
var lähtöAsema;
var lähtöAsemaLyhenne;
var saapumisAsema;
var saapumisAsemaLyhenne;
var asematArray;
var päivämäärä = document.getElementById("päivämäärä").value;

$(document).ready(function () {

    $.ajax({
        type: "get",
        url: "https://rata.digitraffic.fi/api/v1/metadata/stations",
        //data: "name=John&location=Boston",
        dataType: "json",
        success: function (data) {
            var dataSuodatettuHenkilöliikenne = data.filter(function (item) {
                return item.passengerTraffic === true;
            });


            kaikkiAsemat = dataSuodatettuHenkilöliikenne;
            console.dir(kaikkiAsemat)

            HaeKaikkiOlemassaOlevatAsemat();
        }
    });

    // Hakee lähtö ja saapumis välillä menevät junat
    function haeData() {
        $.ajax({
            type: "get",
            url: oikeaURL,
            dataType: "json",
            success: function (data) {
                tiedot = data;
                console.dir(tiedot)
                TulostaTiedot();
            }
        });
    }

    //funktio - haetaan lähtöaseman lyhenne
    function etsiAsemaLähtö() {
        $.each(kaikkiAsemat, function (indexInArray, valueOfElement) {
            if (this.stationName == lähtöAsema) {
                lähtöAsemaLyhenne = this.stationShortCode;
            }
        });
    }

    //funktio - haetaan saapumisaseman lyhenne
    function etsiAsemaSaapumis() {
        $.each(kaikkiAsemat, function (indexInArray, valueOfElement) {
            if (this.stationName == saapumisAsema) {
                saapumisAsemaLyhenne = this.stationShortCode;
            }
        });
    }

    //funktio - haetaan saapumis-/lähtöaika
    function haeAika() {
        $.each(kaikkiAsemat, function (indexInArray, valueOfElement) {
            if (document.getElementById("lähtöAika").checked = true) {

                if (this.stationName == lähtöAsema) {
                    console.log(document.getElementById("päivämäärä").value)
                    console.log(päivämäärä)

                    if (this.startDate >= päivämäärä) {
                        console.log("pvm2")
                    }
                }
            }
        });
    }

    //löytää oikeat asemat
    $('#haeNappi').click(function () {
        //lähtöAsema = $('kenttä1').html().val;
        lähtöAsema = document.getElementById('lähtöAsema').value;
        etsiAsemaLähtö();
        saapumisAsema = document.getElementById('saapumisAsema').value;
        etsiAsemaSaapumis();
        haeAika();
        console.log(lähtöAsemaLyhenne);
        console.log(saapumisAsemaLyhenne);
        var pvm = new Date(document.getElementById("päivämäärä").value);
        pvm.setHours(pvm.getHours());
        var isoPvm = pvm.toISOString();
        oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne + "?startDate=" + isoPvm + "&limit=5";
        console.log(oikeaURL.value);
        haeData();
    });

    var optiot = { hour: '2-digit', minute: '2-digit', hour12: false };

    // Hakee junien tiedot ja tekee jotain!
    function TulostaTiedot() {
        for (var i = 0; i < tiedot.length; i++) {
            var juna = tiedot[i].trainType + tiedot[i].trainNumber;
            var lähtö = new Date(tiedot[i].timeTableRows[lähtöIndeksi()].scheduledTime);
            var perillä = new Date(tiedot[i].timeTableRows[saapumisIndeksi()].scheduledTime);
            function lähtöIndeksi() {
                for (var b = 0; b < tiedot[i].timeTableRows.length; b++) {
                    if ((tiedot[i].timeTableRows[b].stationShortCode) == lähtöAsemaLyhenne && (tiedot[i].timeTableRows[b].trainStopping == true)) {
                        return b;
                    }
                }
            }
            function saapumisIndeksi() {
                for (var a = 0; a < tiedot[i].timeTableRows.length; a++) {
                    if ((tiedot[i].timeTableRows[a].stationShortCode) == saapumisAsemaLyhenne && (tiedot[i].timeTableRows[a].trainStopping == true)) {
                        return a;
                    }
                }
            }
            var decimalTimeString = (perillä.toLocaleTimeString("fi", optiot) - lähtö.toLocaleTimeString("fi", optiot));
            var decimalTime = parseFloat(decimalTimeString);
            decimalTime = decimalTime * 60 * 60;
            var hours = Math.floor((decimalTime / (60 * 60)));
            decimalTime = decimalTime - (hours * 60 * 60);
            var minutes = Math.floor((decimalTime / 60));
            decimalTime = decimalTime - (minutes * 60);
            var seconds = Math.round(decimalTime);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            var kesto = ("" + hours + ":" + minutes + ":" + seconds)
            console.log(juna + ", Lähtee: " + lähtö.toLocaleTimeString("fi", optiot)
                + ", Perillä: " + perillä.toLocaleTimeString("fi", optiot) +
                ", Kesto: " + kesto);
            document.getElementById("lista").innerHTML += '<li><b>Lähijuna '
                + juna + '</b > <br />Lähtee: ‎' + lähtö.toLocaleTimeString("fi", optiot)
                + ' ' + lähtöAsema + '<br />Saapuu: ' + perillä.toLocaleTimeString("fi", optiot)
                + ' ' + saapumisAsema +' <br /> Kesto: ' + kesto + ' <br /></li > ';
            //document.write(juna + ", Lähtee: " + lähtö.toLocaleTimeString("fi", optiot) + ", Perillä: " + perillä.toLocaleTimeString("fi", optiot))
        }
    }


    function HaeKaikkiOlemassaOlevatAsemat() {

    }




})


//Tässä saadaan asemien välinen yhteys tiettynä päivänä 24h eteenpäin
//https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/TPE?startDate=2018-06-25T16:28:59.564Z
