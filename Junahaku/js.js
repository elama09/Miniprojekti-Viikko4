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
var asemienNimet = [];
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

            //Array kaikkien asemien nimet / TOIMIII!!
            $.each(kaikkiAsemat, function () {
                let väliaikainen = this.stationName;
                asemienNimet.push(väliaikainen);
                //$('#myUL').append('<li>' + väliaikainen + '</li>')
                $('<li><a>' + väliaikainen + '</a></li >').click(jokainenAsema).appendTo('#myUL');
                $('<li><a>' + väliaikainen + '</a></li >').click(jokainenAsemaSaapuminen).appendTo('#myUL2');

            })
        }
    });

    // Funktio ja ottaa valitun aseman LÄHTÖ!
    function jokainenAsema(e) {
        console.dir(e)
        console.log('Toimiiko!?');
        $('#lähtöAsema').val(e.currentTarget.innerText);
        $('#myUL li').css('display', 'none');
    }

    // Funktio ja ottaa valitun aseman SAAPUMINEN!
    function jokainenAsemaSaapuminen(e) {
        console.dir(e)
        console.log('Toimiiko!?');
        $('#saapumisAsema').val(e.currentTarget.innerText);
        $('#myUL2 li').css('display', 'none');
    }

    //Ei toimi kunnolla... Toimiiko!?!?!?
    $('#lähtöAsema').keyup(function () {
        let input, filter, ul, li, a, i;
        input = document.getElementById('lähtöAsema');
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName('li');

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "block";
            } else {
                li[i].style.display = "none";
            }
        }
    })

    $('#saapumisAsema').keyup(function () {
        let input, filter, ul, li, a, i;
        input = document.getElementById('saapumisAsema');
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL2");
        li = ul.getElementsByTagName('li');

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "block";
            } else {
                li[i].style.display = "none";
            }
        }
    })
    //MIHIN TÄMÄ? ERILLINN NAPPI!!??
    etsiLähinAsema();

    function etsiLähinAsema() {
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true
        });

        //Haetun sijainnin kordinaatit
        function success(data) {
            console.dir(data)
            la_hakuSijainti = data.coords.latitude
            lo_hakuSijainti = data.coords.longitude
            //Jos halutaan että kartta latautuu vasta kun käyttäjä on hyväksynyt sijaintipalvelut. Näin toimii, mutta jos ei anna lupaa niin kartta ei lataudu.
            //initMap();
            distance();
        }

        //Jos sijainti epäonnistuu
        function error(e) {
            console.dir(e)
            alert('Sijainnin haku epäonnistui, päivitä sivu ja yritä uudelleen');
        }
        //TEE LOOPPI JA ETSI


    }
    //Looppaa kaikki asemat ja etsii lähimmän -FUNKTIO
    var lähinAsemaNimi;
    var lähinAsemaMatkaKM = 99999;

    function distance() {

        $.each(kaikkiAsemat, function () {
            let lat1 = this.latitude
            let lon1 = this.longitude
            let lat2 = la_hakuSijainti
            let lon2 = lo_hakuSijainti

            var radlat1 = Math.PI * lat1 / 180
            var radlat2 = Math.PI * lat2 / 180
            var theta = lon1 - lon2
            var radtheta = Math.PI * theta / 180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180 / Math.PI
            dist = dist * 60 * 1.1515

            dist = dist * 1.609344

            if (dist < lähinAsemaMatkaKM) {
                lähinAsemaMatkaKM = dist;
                lähinAsemaNimi = this.stationName;
            }
        });
        console.log(lähinAsemaNimi)
        console.log(lähinAsemaMatkaKM)
        $('#lähtöAsema').html(lähinAsemaNimi);
        document.getElementById("lähtöAsema").innerText = lähinAsemaNimi;
        //if (unit == "K") { dist = dist * 1.609344 }
        //if (unit == "N") { dist = dist * 0.8684 }

    }

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
                la_alku = this.latitude;
                lo_alku = this.longitude;
            }
        });
    }

    //funktio - haetaan saapumisaseman lyhenne
    function etsiAsemaSaapumis() {
        $.each(kaikkiAsemat, function (indexInArray, valueOfElement) {
            if (this.stationName == saapumisAsema) {
                saapumisAsemaLyhenne = this.stationShortCode;
                la_loppu = this.latitude
                lo_loppu = this.longitude
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

    //Värittää tyjäksi jätetyn kentän
    $('input').blur(function (e) {
        $(this).addClass('touched');
    })

    //löytää oikeat asemat
    $('#haeNappi').click(function () {
        //VAlidointi logiikka

        if ($('#lähtöAsema').val() === "" || $('#saapumisAsema').val() === "") {
            $('form').click(function (e) {
                e.preventDefault();
                $('form').addClass('submitted')
            })
        }


        $('#toinenKolumni').addClass('col')
        $('#kolmasKolumni').addClass('col')
        $('#tyhjäKolumni').addClass('col-1')
        $('#divContainerPoisto').removeClass('container')
        $('#kolmasKolumni').load("Kartta.html")
        $('#toinenKolumni').load("Junatulokset.html") 
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
        oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne + "?startDate=" + isoPvm + "&limit=4";
        console.log(oikeaURL);
        haeData();
    });

    var optiot = { hour: '2-digit', minute: '2-digit', hour12: false };

    // Hakee junien tiedot ja tekee jotain!
    function TulostaTiedot() {
        for (let i = 0; i < tiedot.length; i++) {
            let juna = tiedot[i].trainType + tiedot[i].trainNumber;
            let lähtö = new Date(tiedot[i].timeTableRows[lähtöIndeksi()].scheduledTime);
            let perillä = new Date(tiedot[i].timeTableRows[saapumisIndeksi()].scheduledTime);

            function lähtöIndeksi() {
                for (let b = 0; b < tiedot[i].timeTableRows.length; b++) {
                    if ((tiedot[i].timeTableRows[b].stationShortCode) == lähtöAsemaLyhenne && (tiedot[i].timeTableRows[b].trainStopping == true)) {
                        return b;
                    }
                }
            }

            function saapumisIndeksi() {
                for (let a = 0; a < tiedot[i].timeTableRows.length; a++) {
                    if ((tiedot[i].timeTableRows[a].stationShortCode) == saapumisAsemaLyhenne && (tiedot[i].timeTableRows[a].trainStopping == true)) {
                        return a;
                    }
                }
            }

            var decimalTimeString = (perillä.toLocaleTimeString("fi", optiot) - lähtö.toLocaleTimeString("fi", optiot));
            if (decimalTimeString < 0) {
                decimalTimeString = (decimalTimeString * -1)
            }
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

            var kesto = ("" + hours + ":" + minutes + ":" + seconds);

            //EDIT KOKEILU
            

            document.getElementById("lista").innerHTML += '<li><b>Lähijuna '
                + juna + '</b > <br />Lähtee: ‎' + lähtö.toLocaleTimeString("fi", optiot)
                + ' ' + lähtöAsema + '<br />Saapuu: ' + perillä.toLocaleTimeString("fi", optiot)
                + ' ' + saapumisAsema +' <br /> Kesto: ' + kesto + ' <br /></li > ';
            //document.write(juna + ", Lähtee: " + lähtö.toLocaleTimeString("fi", optiot) + ", Perillä: " + perillä.toLocaleTimeString("fi", optiot))
        }
    }






})


//Tässä saadaan asemien välinen yhteys tiettynä päivänä 24h eteenpäin
//https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/TPE?startDate=2018-06-25T16:28:59.564Z
