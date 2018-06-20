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

    //Hakee heti alkuun json tiedot
    $.ajax({
        type: "get",
        url: "https://rata.digitraffic.fi/api/v1/metadata/stations",
        dataType: "json",
        success: function (data) {
            var dataSuodatettuHenkilöliikenne = data.filter(function (item) {
                return item.passengerTraffic === true;
            });

            kaikkiAsemat = dataSuodatettuHenkilöliikenne;
            console.dir(kaikkiAsemat)

            //Kaikkien asemien nimet, jotta filtteröinti toimii
            $.each(kaikkiAsemat, function () {
                let väliaikainen = this.stationName;
                asemienNimet.push(väliaikainen);
                $('<li><a>' + väliaikainen + '</a></li >').click(jokainenAsema).appendTo('#myUL');
                $('<li><a>' + väliaikainen + '</a></li >').click(jokainenAsemaSaapuminen).appendTo('#myUL2');

            })
        }
    });

    //Nykyisen ajan näyttäminen
    var date = new Date();
    var tämäHetki = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON();
    tämäHetki = tämäHetki.slice(0, 16);
    document.getElementById("päivämäärä").defaultValue = tämäHetki;

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

    //Lähtöasema filtteri
    $('#lähtöAsema').keyup(function () {
        if ($(this).val().length > 2) {
            let input, filter, ul, li, a, i;
            input = document.getElementById('lähtöAsema');
            filter = input.value.toUpperCase();
            ul = document.getElementById("myUL");
            li = ul.getElementsByTagName('li');

            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("a")[0];
                if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "block";
                } else {
                    li[i].style.display = "none";
                }
            }
        } else {
            $('#myUL li').css('display', 'none');
        }
    })

    //Lähtöasema filtteri
    $('#saapumisAsema').keyup(function () {
        if ($(this).val().length > 2) {
            let input, filter, ul, li, a, i;
            input = document.getElementById('saapumisAsema');
            filter = input.value.toUpperCase();
            ul = document.getElementById("myUL2");
            li = ul.getElementsByTagName('li');

            for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("a")[0];
                if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "block";
                } else {
                    li[i].style.display = "none";
                }
            }
        } else {
            $('#myUL2 li').css('display', 'none');
        }
    })

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
        $('#lähtöAsema').val(lähinAsemaNimi);
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

    //Värittää tyjäksi jätetyn kentän
    $('input').blur(function (e) {
        $(this).addClass('touched');
    })

    //Hae lähin asema funktio
    $('#haeLähin').click(function (e) {
        console.log('haetaan lähin asema')
        etsiLähinAsema();
        console.log(lähinAsemaNimi);
    })

    //löytää oikeat asemat
    $('#haeNappi').click(function () {

        //Validointi logiikka
        if ($('#lähtöAsema').val() == "" || $('#saapumisAsema').val() == "") {
            $('form').addClass('submitted');
        //Kaikki tapahtumat 'hae junia' napin jälkeen
        } else {
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
            console.log(lähtöAsemaLyhenne);
            console.log(saapumisAsemaLyhenne);
            var pvm = new Date(document.getElementById("päivämäärä").value);
            pvm.setHours(pvm.getHours());
            var isoPvm = pvm.toISOString();
            oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne + "?startDate=" + isoPvm + "&limit=4";
            console.log(oikeaURL);
            $('#toinenKolumni').removeClass('animated zoomIn');
            haeData();
        }
    });

    // Hakee junien tiedot ja tekee jotain!
    function TulostaTiedot() {
        for (let i = 0; i < tiedot.length; i++) {
            let juna = tiedot[i].trainType + tiedot[i].trainNumber;
            let lähtö = new Date(tiedot[i].timeTableRows[lähtöIndeksi()].scheduledTime);
            let perillä = new Date(tiedot[i].timeTableRows[saapumisIndeksi()].scheduledTime);

            function lähtöIndeksi() {
                for (let b = 0; b < tiedot[i].timeTableRows.length; b++) {
                    if ((tiedot[i].timeTableRows[b].stationShortCode) == lähtöAsemaLyhenne && (tiedot[i].timeTableRows[b].type == 'DEPARTURE') && (tiedot[i].timeTableRows[b].trainStopping == true)) {
                        return b;
                    }
                }
            }

            function saapumisIndeksi() {
                for (let a = 0; a < tiedot[i].timeTableRows.length; a++) {
                    if ((tiedot[i].timeTableRows[a].stationShortCode) == saapumisAsemaLyhenne && (tiedot[i].timeTableRows[a].type == 'ARRIVAL') && (tiedot[i].timeTableRows[a].trainStopping == true)) {
                        return a;
                    }
                }
            }

            var optiot = { hour: '2-digit', minute: '2-digit', hour12: false };
            var decimalTimeString = (perillä.toLocaleTimeString("fi", optiot) - lähtö.toLocaleTimeString("fi", optiot));
            if (decimalTimeString < 0) {
                decimalTimeString = (decimalTimeString * -1)
            }

            var decimalTime = parseFloat(decimalTimeString);
            decimalTime = decimalTime * 60 * 60;
            var hours = Math.round((decimalTime / (60 * 60)));
            decimalTime = decimalTime - (hours * 60 * 60);
            var minutes = Math.round((decimalTime / 60));
            decimalTime = decimalTime - (minutes * 60);
            var seconds = Math.round(decimalTime);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }

            var kesto = ("" + hours + ":" + minutes + ":" + seconds);

            //Junien tulostus näytölle
            document.getElementById("lista").innerHTML += '<li><b>Juna '
                + juna + '</b > <br />Lähtee: ‎' + lähtö.toLocaleTimeString("fi", optiot)
                + ' ' + lähtöAsema + '<br />Saapuu: ' + perillä.toLocaleTimeString("fi", optiot)
                + ' ' + saapumisAsema + ' <br /> Kesto: ' + kesto + ' <br /></li > ';
        }

        $('#toinenKolumni').addClass('animated zoomIn');

        //Jos ei yhtäkään juna osumaa
        if ($('#lista li').length == null || $('#lista li').length == 0) {
            console.log("JEEEEE!")
            $('#lista').html('<p class="animated flash">Hakuehdoillasi ei löytynyt yhteyksiä!</p>');
        }

    }

    $('#aloitusHaku').addClass('animated zoomIn');
    

})