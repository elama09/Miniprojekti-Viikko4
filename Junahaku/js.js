var alkuURL = "https://rata.digitraffic.fi/api/v1/live-trains/station/"
var oikeaURL;
var kaikkiAsemat;
var tiedot;
var lähtöAsema;
var lähtöAsemaLyhenne;
var saapumisAsema;
var saapumisAsemaLyhenne;
var asematArray;

$(document).ready(function () {

    $.ajax({
        type: "get",
        url: "https://rata.digitraffic.fi/api/v1/metadata/stations",
        //data: "name=John&location=Boston",
        dataType: "json",
        success: function (data) {
            kaikkiAsemat = data;
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

    //löytää oikeat asemat
    $('#haeNappi').click(function () {
        //lähtöAsema = $('kenttä1').html().val;
        lähtöAsema = document.getElementById('lähtöAsema').value;
        etsiAsemaLähtö();
        saapumisAsema = document.getElementById('saapumisAsema').value;
        etsiAsemaSaapumis();

        console.log(lähtöAsemaLyhenne);
        console.log(saapumisAsemaLyhenne);

        oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne;

        haeData();
    });

    var optiot = { hour: '2-digit', minute: '2-digit', hour12: false };

    // Hakee junien tiedot ja tekee jotain!
    function TulostaTiedot() {
        for (var i = 0; i < tiedot.length; i++) {
            var juna = tiedot[i].trainType + tiedot[i].trainNumber;
            var lähtö = new Date(tiedot[i].timeTableRows[0].scheduledTime);
            var perillä = new Date(tiedot[i].timeTableRows[oikeaIndeksi()].scheduledTime);

            function oikeaIndeksi() {
                for (var a = 0; a < tiedot[i].timeTableRows.length; a++) {
                    if ((tiedot[i].timeTableRows[a].stationShortCode) == saapumisAsemaLyhenne && (tiedot[i].timeTableRows[a].trainStopping == true)) {
                        return a;
                    }
                }
            }
            console.log(juna + ", Lähtee: " + lähtö.toLocaleTimeString("fi", optiot) + ", Perillä: " + perillä.toLocaleTimeString("fi", optiot));
            //document.write(juna + ", Lähtee: " + lähtö.toLocaleTimeString("fi", optiot) + ", Perillä: " + perillä.toLocaleTimeString("fi", optiot))
        }
    }

    function HaeKaikkiOlemassaOlevatAsemat() {

    }




})


//Tässä saadaan asemien välinen yhteys tiettynä päivänä 24h eteenpäin
//https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/TPE?startDate=2018-06-25T16:28:59.564Z
