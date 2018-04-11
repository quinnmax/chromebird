var divCollection = document.getElementsByTagName("div");

for (var i=0; i<divCollection.length; i++) {

    if( divCollection[i].getAttribute("class") == "dashboard dashboard-left" ||
    	divCollection[i].getAttribute("class") == "dashboard dashboard-right" ||
    	divCollection[i].getAttribute("class") == "Grid-cell u-size1of3 u-lg-size1of4") {
        divCollection[i].parentNode.removeChild(divCollection[i]);
    } 

}

document.getElementById('timeline').style.cssFloat = "left"

document.getElementById('page-container').style.width = "840x";











