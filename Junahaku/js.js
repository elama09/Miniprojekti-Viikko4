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
var optiot = { hour: '2-digit', minute: '2-digit', hour12: false };
var pvm;

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
        $('#lähtöAsema').val(e.currentTarget.innerText);
        $('#myUL li').css('display', 'none');
    }

    // Funktio ja ottaa valitun aseman SAAPUMINEN!
    function jokainenAsemaSaapuminen(e) {
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

    //funktio vaihtaa asemat päittäin
    $('#vaihtoNappi').click(function (e) {
        e.preventDefault();
        let läh = $('#lähtöAsema').val();
        let saap = $('#saapumisAsema').val();
        $('#lähtöAsema').val(saap);
        $('#saapumisAsema').val(läh);

    })

    //Värittää tyjäksi jätetyn kentän
    $('input').blur(function (e) {
        $(this).addClass('touched');
    })

    //Hae lähin asema funktio
    $('#haeLähin').click(function (e) {
        etsiLähinAsema();
    })

    //löytää oikeat junat - Eniten tapahtumia tämän jälkeen
    $('#haeNappi').click(function () {

        //Validointi logiikka
        let lähtöAsemaOikein = false;
        let saapumisAsemaOikein = false;
        for (let l = 0; l < asemienNimet.length; l++) {
            if ($('#lähtöAsema').val() == "" || $('#saapumisAsema').val() == "") {
                $('form').addClass('submitted');
                break;
            }
            if ($('#lähtöAsema').val() == asemienNimet[l]) {
                lähtöAsemaOikein = true;
            }
            if ($('#saapumisAsema').val() == asemienNimet[l]) {
                saapumisAsemaOikein = true;
            }
            if (lähtöAsemaOikein == true && saapumisAsemaOikein == true) {

                lähtöAsema = document.getElementById('lähtöAsema').value;
                etsiAsemaLähtö();
                saapumisAsema = document.getElementById('saapumisAsema').value;
                etsiAsemaSaapumis();
                pvm = new Date(document.getElementById("päivämäärä").value);

                $('#toinenKolumni').addClass('col')
                $('#kolmasKolumni').addClass('col')
                $('#tyhjäKolumni').addClass('col-1')
                $('#divContainerPoisto').removeClass('container')
                
                pvm.setHours(pvm.getHours());
                var isoPvm = pvm.toISOString();
                oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne + "?startDate=" + isoPvm + "&limit=4";

                //Jos haetaan saapumisajan mukaan!
                let pelkkäPäivä = pvm.toJSON().substr(0, 10)
                if ($('#radioSaapuminen').prop('checked')) {
                    oikeaURL = alkuURL + lähtöAsemaLyhenne + "/" + saapumisAsemaLyhenne + "?departure_date=" + pelkkäPäivä;
                }

                $('#kolmasKolumni').load("Kartta.html")
                $('#toinenKolumni').load("Junatulokset.html")
                $('#toinenKolumni').removeClass('animated zoomIn');
                haeData();
                
                break;
            }
        }
    });

    //Muutetaan integer oikeaksi viikonpäiväksi
    function muutaViikonPäiväksi(päivä) {
        var viikonPäivät = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
        return viikonPäivät[päivä]
    }

    // Hakee junien tiedot ja tulostaa käyttäjälle
    function TulostaTiedot() {

        //Jos saapumisajan mukaan
        if ($('#radioSaapuminen').prop('checked')) {
            for (let i = tiedot.length - 1; i >= 0; i--) {
                let juna = tiedot[i].trainType + tiedot[i].trainNumber;
                let lähtö = new Date(tiedot[i].timeTableRows[lähtöIndeksi()].scheduledTime);
                let perillä = new Date(tiedot[i].timeTableRows[saapumisIndeksi()].scheduledTime);

                //Jos saapumisaika on myöhempi tai jos junia tulostettu 4kpl
                if (perillä >= pvm) {
                    continue;
                } else if ($('#lista li').length == 4) {
                    break;
                }

                //Keston laskeminen - Sekunteja ei oteta huomioon, todellisuudessa joskus 30s esim
                let lähtöiso = lähtö.toISOString().slice(0, 19) + 'Z';
                let perilläiso = perillä.toISOString().slice(0, 19) + 'Z';
                lähtöiso = new Date(lähtöiso)
                perilläiso = new Date(perilläiso)
                let kesto = (perilläiso - lähtöiso) / 1000 / 60;
                let tunnit = Math.floor(kesto / 60)
                let minuutit = Math.floor(kesto % 60);
                if (minuutit < 10) {
                    kesto = tunnit + ':0' + minuutit;
                } else {
                    kesto = tunnit + ':' + minuutit;
                }

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

                //Junien tulostus näytölle
                document.getElementById("lista").innerHTML += '<li><b>Juna '
                    + juna + '</b > <br />Lähtee: ‎' + lähtö.toLocaleTimeString("fi", optiot)
                    + ' ' + '(' + muutaViikonPäiväksi(lähtö.getDay()) + ')' + ' ' + lähtöAsema + '<br />Saapuu: ' + perillä.toLocaleTimeString("fi", optiot)
                    + ' ' + '(' + muutaViikonPäiväksi(perillä.getDay()) + ')' + ' ' + saapumisAsema + ' <br />' + 'Kesto: '
                    + kesto + '</li > ';
            }

            $('#toinenKolumni').addClass('animated zoomIn');

            //Jos ei yhtäkään juna osumaa
            if ($('#lista li').length == null || $('#lista li').length == 0) {
                $('#lista').html('<p class="animated flash">Hakuehdoillasi ei löytynyt yhteyksiä!</p>');
            }
            
        //Jos lähtöajan mukaan
        } else {
            for (let i = 0; i < tiedot.length; i++) {
                let juna = tiedot[i].trainType + tiedot[i].trainNumber;
                let lähtö = new Date(tiedot[i].timeTableRows[lähtöIndeksi()].scheduledTime);
                let perillä = new Date(tiedot[i].timeTableRows[saapumisIndeksi()].scheduledTime);

                //Keston laskeminen - Sekunteja ei oteta huomioon, todellisuudessa joskus 30s esim
                let lähtöiso = lähtö.toISOString().slice(0, 19) + 'Z';
                let perilläiso = perillä.toISOString().slice(0, 19) + 'Z';
                lähtöiso = new Date(lähtöiso)
                perilläiso = new Date(perilläiso)
                let kesto = (perilläiso - lähtöiso) / 1000 / 60;
                let tunnit = Math.floor(kesto / 60)
                let minuutit = Math.floor(kesto % 60);
                if (minuutit < 10) {
                    kesto = tunnit + ':0' + minuutit;
                } else {
                    kesto = tunnit + ':' + minuutit;
                }

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

                //Junien tulostus näytölle
                document.getElementById("lista").innerHTML += '<li><b>Juna '
                    + juna + '</b > <br />Lähtee: ‎' + lähtö.toLocaleTimeString("fi", optiot)
                    + ' ' + '(' + muutaViikonPäiväksi(lähtö.getDay()) + ')' + ' ' + lähtöAsema + '<br />Saapuu: ' + perillä.toLocaleTimeString("fi", optiot)
                    + ' ' + '(' + muutaViikonPäiväksi(perillä.getDay()) + ')' + ' ' + saapumisAsema + ' <br />' + 'Kesto: '
                    + kesto + '</li > ';
            }

            $('#toinenKolumni').addClass('animated zoomIn');

            //Jos ei yhtäkään juna osumaa
            if ($('#lista li').length == null || $('#lista li').length == 0) {
                $('#lista').html('<p class="animated flash">Hakuehdoillasi ei löytynyt yhteyksiä!</p>');
            }
            
        }
    }

    $('#aloitusHaku').addClass('animated zoomIn');
})