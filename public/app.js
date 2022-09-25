fetch("./usa.csv")
  .then((r) => r.text())
  .then((x) => {
    let head = x.split("\n");
    keys = head[0].split(",");
    let body = head.splice(1);
    body = body.map((line) => {
      let obj = {};
      line.split(",").forEach((value, index) => {
        if (keys[index] == "location") {
          a = value.trim().split("'");
          obj[keys[index]] = [a[1], a[3]];
        } else {
          obj[keys[index].trim()] = value;
        }
      });
      return obj;
    });
    const myMap = L.map("map").setView([39.011902,-98.484246], 5);
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      noWrap: true,
    });
    tileLayer.addTo(myMap);

    var southWest = L.latLng(-89.98155760646617, -180),
      northEast = L.latLng(89.99346179538875, 180);
    var bounds = L.latLngBounds(southWest, northEast);

    myMap.setMaxBounds(bounds);

    function genPop(l) {
      return `
        <div class="popup">
        <h3>Establish Year : ${2022-l.Property_age}</h3>
        <h1>${l.Owner_Name}</h1>
        <div>
        <p>city  <span>${l.City}</span></p>
        <p>Administrative Unit  <span>${l.Administrative_unit}</span></p>
        </div>
        <p class="location">Location : ${l.Address}</p>
        <div>
        <p>Building No.  <span>${l.Building_number}</span> </p>
        <p>User Name  <span>${l.User_name}</span></p>
        <p>State  <span>${l.state_name}</span></p>`;
    }
    function makeli(l) {
      return `
        <div>
            <h3>since ${l.Property_age} years</h3>
            <fieldset>
              <legend>User details<i class="fa fa-solid fa-user"></i></legend>
            <h1>${l.Owner_Name}</h1>
            <section>
            <span>User name</span>
            <span>${l.User_name}</span>
            </section>
            <section>
            <span>Date_posted</span>
            <span>${l.Date_posted}</span>
          </section>
            </fieldset>
            <fieldset>
            <legend>Property details<i class="fa fa-solid fa-building"></i></legend>
            <address><i class="fas fa-map-marker-alt"></i>${l.Address}</address>
            <section>
                <span>state_name(Code)</span>
                <span>${l.state_name}(${l.state})</span>
              </section>
              <section>
                <span>Street_name</span>
                <span>${l.Street_name}</span>
              </section>
              <section>
                <span>Building_number</span>
                <span>${l.Building_number}</span>
              </section>
              <section>
                <span>Administrative_unit</span>
                <span>${l.Administrative_unit}</span>
              </section>
            </fieldset>
        </div>`;
    }
    function getOffset(o) {
      let a = 0,
        b = -10;
      if (o.latitude > 75) b = 310;
      if (o.longitude < -150) a = 120;
      if (o.longitude > 150) a = -120;
      return [a, b];
    }

    function generateList(list) {
      document.getElementById("school-count").innerHTML = list.length;
      const ul = document.querySelector("#list");
      ul.innerHTML = ""; //reset
      list.forEach((l) => {
        // var marker = L.marker(l.location).bindPopup(genPop(l));
        let li = document.createElement("li");
        // sp = document.createElement('div');
        li.classList.add("list-item");
        li.innerHTML = makeli(l);
        ul.appendChild(li);
        li.onclick = function () {
          myMap.flyTo([l.latitude,l.longitude], 12, {
            duration: 2,
          });
          setTimeout(() => {
            L.popup()
              .setLatLng([l.latitude,l.longitude])
              .setContent(genPop(l))
              .openOn(myMap);
          }, 2000);
        };
      });
    }
    //-----------------------------------------handling layers on map---------------------------------------------
    var layer;
    function showDataOnMap(arr) {
      let temp = new Array();
      arr.forEach((school) => {
        // console.log(school.latitude);
        temp.push(
          L.marker([school.latitude,school.longitude]).bindPopup(genPop(school), {
            offset: getOffset(school),
          })
        );
      });
      if (layer != undefined) {
        layer.clearLayers(); //reset
      }
      layer = L.layerGroup(temp).addTo(myMap);
    }
    //--------------------------------------checking schools on based of filters---------------------------------

    function check(school) {
      function checkcommune() {
        let value = ADlist.options[ADlist.selectedIndex].value;
        if (value == "none") {
          return true;
        } else {
          return school.Administrative_unit == value;
        }
      }
      function checkcommunecode() {
        let value = STlist.options[STlist.selectedIndex].value;
        if (value == "none") {
          return true;
        } else {
          return school.state_name == value;
        }
      }
      function checkname() {
        let c = school.Owner_Name.toUpperCase().search(
          pin.value.toUpperCase()
        );
        if (c == -1) {
          return false;
        } else {
          return true;
        }
      }
      function checkbuildNo() {
        let c = school.Building_number.search(pin.value);
        if (c == -1) {
          return false;
        } else {
          return true;
        }
      }
      function checkadd() {
        let c = school.Address.replace('"', "")
          .toUpperCase()
          .search(pin.value.toUpperCase());
        if (c == -1) {
          return false;
        } else {
          return true;
        }
      }
      let condition =
        2022-school.Property_age <= slider.value &&
        checkcommune() &&
        checkcommunecode() &&
        (checkname() || checkbuildNo() || checkadd());

      return condition
    }
    //-----------------------------------------------------------------------------------------
    var filtered = body;
    showDataOnMap(filtered);
    generateList(filtered);
    document.getElementById("reset").addEventListener("click", () => {
      filtered = body;
      showDataOnMap(filtered);
      generateList(filtered);
      let all = document.getElementsByTagName("input");
      Array.from(all).forEach((inp) => {
        inp.checked = false;
      });
      slider.value = slider.max;
      setSliderBackground();
      pin.value = "";
      ADlist.value = "none";
      STlist.value = "none";
    });
    var slider = document.getElementById("yearRange");
    let arrrr = body.map((e) => 2022-e.Property_age);
    slider.min = arrrr.reduce((a, b) => (a < b ? a : b));
    slider.max = arrrr.reduce((a, b) => (a > b ? a : b));
    slider.value = slider.max;
    document.getElementById("rangevalue").innerHTML =
      slider.min + " - " + slider.max;
    function setSliderBackground() {
      let prcnt =
        (100 * (slider.value - slider.min)) / (slider.max - slider.min);
      slider.style.background = `linear-gradient(90deg,var(--back) ${prcnt}%,white ${prcnt}%)`;
    }

    setSliderBackground();

    //--------------------------------filtering by establishment year--------------------------

    slider.oninput = function () {
      filtered = body.filter((school) => check(school));
      document.getElementById("rangevalue").innerHTML =
        slider.min + " - " + this.value;
      setSliderBackground();
      showDataOnMap(filtered);
      generateList(filtered);
    };

    // -------------------------------search by name pin udise--------------------------------------

    var pin = document.getElementById("name");
    pin.addEventListener("input", () => {
      filtered = body.filter((school) => check(school));
      showDataOnMap(filtered);
      generateList(filtered);
    });
    //------------------------------------filtering by Administrative_unit---------------------------------------
    let options = new Set();
    body.forEach((school) => options.add(school.Administrative_unit));
    var ADlist = document.getElementById("education");
    options.forEach((option) => ADlist.add(new Option(option, option)));
    
    ADlist.onchange = function () {
      filtered = body.filter((school) => check(school));
      showDataOnMap(filtered);
      generateList(filtered);
    };
    //------------------------------------filtering by state_name---------------------------------------
    options = new Set();
    body.forEach((school) => options.add(school.state_name));
    var STlist = document.getElementById("cca");
    options.forEach((option) => STlist.add(new Option(option, option)));

    STlist.onchange = function () {
      filtered = body.filter((school) => check(school));
      showDataOnMap(filtered);
      generateList(filtered);
    };
  });
//----------------------------------menu-----------------------------------
function changing(e){
  Array.from(document.getElementsByClassName('menu')).forEach(a=>{
    console.log(e.id);
    if (a.classList.contains('active')) 
    a.classList.remove('active');
    if (a.classList.contains(e.id)) 
    a.classList.add('active');
  })
  Array.from(document.getElementsByClassName('f')).forEach(a=>{
    console.log();
    if (a.id=='f-'+e.id.split('-')[1]) 
    a.style.display='block'
    else
    a.style.display='none'
  })
}